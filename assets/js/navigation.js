'use strict';
(() => {
function initializeNavigation() {
  const button=document.querySelector('[data-menu]');
  const nav=document.querySelector('#navegacion');
  if (!button || !nav) return;
  document.documentElement.classList.add('navigation-ready');
  const setOpen=open=>{button.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);};
  button.addEventListener('click',()=>setOpen(button.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click',event=>{if(event.target.closest('a'))setOpen(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && button.getAttribute('aria-expanded')==='true'){setOpen(false);button.focus();}});
  document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))setOpen(false);});
  window.matchMedia('(min-width: 1301px)').addEventListener('change',()=>setOpen(false));
  const links=[...document.querySelectorAll('[data-nav-link]')];
  const sections=links.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
  let ticking=false;
  const update=()=>{
    const threshold=window.innerHeight*.35;
    let active=sections[0];
    for(const section of sections)if(section.getBoundingClientRect().top<=threshold)active=section;
    if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-5)active=sections.at(-1);
    for(const link of links){if(link.hash===`#${active.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
    ticking=false;
  };
  window.addEventListener('scroll',()=>{if(!ticking){ticking=true;window.requestAnimationFrame(update);}},{passive:true});
  window.addEventListener('resize',update,{passive:true});
  update();
}

window.HeimySite = Object.assign(window.HeimySite || {}, { initializeNavigation });
})();
