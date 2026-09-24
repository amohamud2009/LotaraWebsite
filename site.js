(() => {
  const screen = document.getElementById('studio-screen');
  const common = '<small>LOTARA · YOUR EVERYDAY</small>';
  const previews = {
    habits: common + '<h3>A little more<br>like you.</h3><p>Your rhythm. One small choice at a time.</p><div class="mock-card"><span>LESS EVENING SCROLLING</span><strong>Make room for your evening.</strong><div class="mock-week" aria-label="Example week"><i style="--i:0">✓</i><i style="--i:1">✓</i><i style="--i:2">—</i><i style="--i:3">✓</i><i style="--i:4">✓</i><i style="--i:5">✓</i><i style="--i:6">·</i></div><div class="mock-line"></div></div><div class="mock-detail">One difficult day doesn’t erase<br>the days you showed up.</div>',
    mood: common + '<h3>How is today<br>feeling?</h3><p>There’s room for the honest answer.</p><div class="mock-mood" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="mock-card"><span>AN EXAMPLE CHECK-IN</span><strong>A little lighter.</strong><svg class="mock-chart" viewBox="0 0 200 100" aria-label="Illustrative mood pattern"><path d="M4 65C20 70 20 25 39 35S65 88 85 61S108 35 126 48S149 76 164 39S185 28 196 19"/></svg></div>',
    journal: common + '<h3>Let it out.<br>Let it settle.</h3><p>Your words, in your own time.</p><div class="mock-journal"><span>AN EXAMPLE REFLECTION</span><p>“Phone away. Dinner together. I want more evenings like this.”</p><i></i><i></i></div><div class="mock-detail">A place for the things<br>you want to remember.</div>'
  };
  const choices = [...document.querySelectorAll('[data-preview]')];
  function showPreview(key) {
    if (!screen || !previews[key]) return;
    screen.innerHTML = previews[key];
    screen.classList.remove('is-changing');
    requestAnimationFrame(() => screen.classList.add('is-changing'));
    choices.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.preview===key)));
  }
  choices.forEach(button => button.addEventListener('click',()=>showPreview(button.dataset.preview)));
  if (screen) showPreview('habits');
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.2});
    document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));
  }
  const query = document.getElementById('help-search');
  if (query) {
    const doc = document.querySelector('.doc');
    const faqs = [...doc.querySelectorAll('details.faq')];
    const headings = [...doc.querySelectorAll('h2')];
    query.addEventListener('input',()=>{
      const term = query.value.trim().toLowerCase();
      let matches=0;
      faqs.forEach(item=>{ const match=!term||item.textContent.toLowerCase().includes(term); item.hidden=!match; if(match)matches++; if(term) item.open=match; });
      headings.forEach(heading=>{
        let item=heading.nextElementSibling, visible=false, hasFaq=false;
        while(item && item.tagName!=='H2'){if(item.matches('details.faq')){hasFaq=true;if(!item.hidden)visible=true;}item=item.nextElementSibling;}
        heading.hidden=hasFaq&&!visible;
      });
      const status=document.getElementById('help-result');status.hidden=!term;
      status.textContent=matches?`${matches} ${matches===1?'answer':'answers'} found.`:'No matching answers. Try another word or contact us using the link below.';
    });
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const oldToggle = document.getElementById('motion-toggle');
  const toggles = [...document.querySelectorAll('[data-motion-toggle]')];
  let remembered=false;try{remembered=sessionStorage.getItem('lotara-paused')==='true';}catch{}
  if (remembered && oldToggle && !document.body.classList.contains('paused')) oldToggle.click();
  if (!oldToggle) document.body.classList.toggle('paused',remembered||reduced.matches);
  function sync(){
    const paused=document.body.classList.contains('paused');
    toggles.forEach(b=>{b.setAttribute('aria-pressed',String(paused));b.textContent=reduced.matches?'Reduced motion enabled':paused?'Resume animations':'Pause animations';b.disabled=reduced.matches;});
    try{sessionStorage.setItem('lotara-paused',String(paused));}catch{}
  }
  toggles.forEach(button=>button.addEventListener('click',()=>{if(oldToggle)oldToggle.click();else document.body.classList.toggle('paused');sync();}));
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  reduced.addEventListener('change',()=>{if(!oldToggle)document.body.classList.toggle('paused',reduced.matches);sync();});sync();
  document.querySelectorAll('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>{a.closest('details').open=false;}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const menu=document.querySelector('.mobile-menu[open]');if(menu){menu.open=false;menu.querySelector('summary').focus();}}});
})();
