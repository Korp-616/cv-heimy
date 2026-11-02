'use strict';
(() => {
function initializeCertificates(){
  const select=document.querySelector('[data-cert-filter]');
  const toolbar=document.querySelector('[data-filter-toolbar]');
  const more=document.querySelector('[data-certs-more]');
  const status=document.querySelector('[data-cert-status]');
  const cards=[...document.querySelectorAll('[data-certificates] > article')];
  if(!select || !toolbar || !more || !cards.length)return;
  let expanded=false;
  const limit=6;
  const update=()=>{
    const matches=cards.filter(card=>select.value==='todas' || card.dataset.category===select.value);
    const visible=new Set(expanded?matches:matches.slice(0,limit));
    for(const card of cards)card.hidden=!visible.has(card);
    status.textContent=`${visible.size} de ${matches.length} especializaciones`;
    more.hidden=matches.length<=limit;
    more.setAttribute('aria-expanded',String(expanded));
    more.textContent=expanded?'Mostrar menos':`Ver todas las especializaciones (${matches.length})`;
  };
  toolbar.hidden=false;
  select.addEventListener('change',()=>{expanded=false;update();});
  more.addEventListener('click',()=>{expanded=!expanded;update();});
  update();
}

window.HeimySite = Object.assign(window.HeimySite || {}, { initializeCertificates });
})();
