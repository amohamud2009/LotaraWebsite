(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches;try{paused=paused||sessionStorage.getItem('lotara-paused')==='true';}catch{}
  const topbar=document.querySelector('.topbar');
  const button=document.createElement('button');button.type='button';button.className='theme-motion';
  if(topbar){const controls=document.createElement('div');controls.className='topbar-tools';const streak=topbar.querySelector('.streak-pill');if(streak)controls.append(streak);controls.append(button);topbar.append(controls);const home=document.createElement('a');home.href='/';home.className='portal-mobile-home';home.textContent='Lotara home';topbar.firstElementChild.append(home);}
  function settleCharts(){document.querySelectorAll('svg animate').forEach(a=>{const attr=a.getAttribute('attributeName'),to=a.getAttribute('to');if(attr&&to)a.parentElement.setAttribute(attr,to);a.remove();});}
  function sync(){document.body.classList.toggle('paused',paused);button.textContent=reduced.matches?'Reduced motion':paused?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(paused));button.disabled=reduced.matches;if(paused)settleCharts();try{sessionStorage.setItem('lotara-paused',String(paused));}catch{}}
  button.addEventListener('click',()=>{paused=!paused;sync();});reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
  // Existing charts use SVG animation; reduce motion must also cover dynamically rendered charts.
  const main=document.querySelector('.main');
  if(main)new MutationObserver(()=>{if(reduced.matches||paused)settleCharts();}).observe(main,{childList:true,subtree:true});
  sync();
})();
