'use strict';
(() => {
  const site = window.HeimySite;
  try {
    if (window.PERFIL) site.renderProfile(window.PERFIL);
  } catch (error) {
    console.error('No se pudo actualizar el perfil:', error.message);
  }
  site.initializeNavigation();
  site.initializeExperience();
  site.initializeCertificates();
  for (const element of document.querySelectorAll('[data-year]')) {
    element.textContent = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'America/Lima' }).format(new Date());
  }
})();
