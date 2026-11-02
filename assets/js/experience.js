'use strict';
(() => {
function initializeExperience(){
  const older=document.querySelector('[data-older-experience]');
  const button=document.querySelector('[data-experience-toggle]');
  const status=document.querySelector('[data-experience-status]');
  if(!older || !button || !older.children.length)return;
  const total=document.querySelectorAll('.timeline-item').length;
  const featured=total-older.children.length;
  const update=open=>{
    older.hidden=!open;
    button.setAttribute('aria-expanded',String(open));
    button.textContent=open?'Mostrar solo experiencias destacadas':`Ver trayectoria completa (${total} cargos)`;
    status.textContent=`${open?total:featured} de ${total} experiencias`;
  };
  // Un enlace directo a un cargo histórico debe poder mostrarlo.
  const revealHash=()=>{const target=window.location.hash?document.getElementById(decodeURIComponent(window.location.hash.slice(1))):null;if(target && older.contains(target)){update(true);target.scrollIntoView({block:'start'});}};
  update(false);button.hidden=false;
  button.addEventListener('click',()=>update(button.getAttribute('aria-expanded')!=='true'));
  window.addEventListener('hashchange',revealHash);revealHash();
}

window.HeimySite = Object.assign(window.HeimySite || {}, { initializeExperience });
})();
