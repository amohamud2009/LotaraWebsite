const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../../js/signin.js'), 'utf8');
function setup({popup, email, currentUser} = {}) {
  const elements = {};
  for (const id of ['btn-signin','btn-google','google-label','error-msg','email','password']) {
    const classes = new Set();
    elements[id] = {value:'',textContent:'',disabled:false,attributes:{},listeners:{},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c)},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this.listeners[k]=v;},click(){if(!this.disabled)return this.listeners.click();},focus(){}};
  }
  const calls = [];
  const auth = {onAuthStateChanged(fn){fn(currentUser || null);},async signInWithPopup(provider){calls.push(provider);return popup ? popup() : {user:{uid:'member'}};},async signInWithEmailAndPassword(e,p){calls.push({email:e,password:p});return email ? email() : {user:{uid:'member'}};}};
  function firebaseAuth(){return auth;}
  firebaseAuth.GoogleAuthProvider = class {constructor(){this.providerId='google.com';}setCustomParameters(parameters){this.parameters=parameters;}};
  const window={location:{href:'/signin.html'}};
  vm.runInNewContext(source,{firebase:{initializeApp(){},auth:firebaseAuth},FIREBASE_CONFIG:{},document:{getElementById:id=>elements[id]},window,isAdmin:uid=>uid==='admin'});
  return {elements,window,calls};
}
const fail=code=>()=>Promise.reject({code});
test('Google selects an account and routes existing Firebase user to dashboard',async()=>{
 const {elements,window,calls}=setup();await elements['btn-google'].click();assert.equal(calls[0].providerId,'google.com');assert.equal(calls[0].parameters.prompt,'select_account');assert.equal(window.location.href,'/dashboard.html');assert.equal(elements['btn-google'].disabled,false);
});
test('Google retains admin routing',async()=>{
 const {elements,window}=setup({popup:()=>({user:{uid:'admin'}})});await elements['btn-google'].click();assert.equal(window.location.href,'/admin.html');
});
test('Existing signed-in sessions retain routing',()=>{assert.equal(setup({currentUser:{uid:'member'}}).window.location.href,'/dashboard.html');});
test('Popup cancellation clears busy state without showing an error',async()=>{
 const {elements,window}=setup({popup:fail('auth/popup-closed-by-user')});await elements['btn-google'].click();assert.equal(elements['error-msg'].textContent,'');assert.equal(elements['btn-google'].disabled,false);assert.equal(window.location.href,'/signin.html');
});
for(const [code,match] of [['auth/popup-blocked',/Allow pop-ups/],['auth/account-exists-with-different-credential',/different sign-in method/],['auth/network-request-failed',/internet connection/],['auth/operation-not-allowed',/temporarily unavailable/]])test(code+' is recoverable without redirecting',async()=>{
 const {elements,window}=setup({popup:fail(code)});await elements['btn-google'].click();assert.match(elements['error-msg'].textContent,match);assert.equal(elements['error-msg'].classList.contains('show'),true);assert.equal(elements['btn-signin'].disabled,false);assert.equal(window.location.href,'/signin.html');
});
test('Pending Google popup blocks duplicate and concurrent email requests',async()=>{
 let resolve;const pending=new Promise(r=>{resolve=r;});const {elements,calls}=setup({popup:()=>pending});const attempt=elements['btn-google'].click();assert.equal(elements['btn-signin'].disabled,true);assert.equal(elements['btn-google'].attributes['aria-busy'],'true');await elements['btn-google'].listeners.click();await elements['btn-signin'].listeners.click();assert.equal(calls.length,1);resolve({user:{uid:'member'}});await attempt;assert.equal(elements['btn-google'].disabled,false);
});
test('Email/password sign-in still trims email and preserves password',async()=>{
 const {elements,window,calls}=setup();elements.email.value=' member@example.com ';elements.password.value=' password ';await elements['btn-signin'].click();assert.equal(calls[0].email,'member@example.com');assert.equal(calls[0].password,' password ');assert.equal(window.location.href,'/dashboard.html');
});
test('Blank email form never invokes authentication',async()=>{const {elements,calls}=setup();await elements['btn-signin'].click();assert.equal(calls.length,0);assert.match(elements['error-msg'].textContent,/enter your email/);});
