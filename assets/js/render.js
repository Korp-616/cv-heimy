'use strict';
(() => {
const componentTemplates = {
  "headerBrand": "<span class=\"brand-mark\" aria-hidden=\"true\">{{initials}}<span>/</span></span><span class=\"brand-name\">{{shortName}}<span>Perfil ejecutivo</span></span>",
  "heroActions": "<a class=\"button button-gold\" href=\"#experiencia\">{{heroAction}} <svg class=\"icon\" aria-hidden=\"true\"><use href=\"#arrow\"></use></svg></a>{{heroDownload}}",
  "heroVisual": "{{portrait}}<div class=\"seal-caption\"><span>{{sealCaption}}</span><span>{{specialty}}</span></div>",
  "credentialBand": "<a class=\"credential-main\" href=\"#certificaciones\"><svg class=\"credential-star\" aria-hidden=\"true\"><use href=\"#star\"></use></svg><div><span class=\"eyebrow\">{{credentialLabel}}</span><strong>{{credentialName}} · {{credentialLevel}}</strong></div><svg class=\"icon\" aria-hidden=\"true\"><use href=\"#arrow\"></use></svg></a><div class=\"credential-validity\"><span>Vigencia documental</span><p>{{credentialDates}}</p></div><div class=\"credential-systems\"><span class=\"eyebrow\">Sistemas administrativos</span><p>{{systems}}</p></div>",
  "profileCopy": "<p class=\"lead\">{{profileLead}}</p>{{profileParagraphs}}<ol class=\"profile-highlights\">{{profileHighlights}}</ol>",
  "oeceFeature": "<div class=\"oece-symbol\" aria-hidden=\"true\"><svg><use href=\"#star\"></use></svg><span>OECE</span></div><div><p class=\"eyebrow\">{{credentialLabel}}</p><h3>{{credentialName}}</h3><p>{{credentialDescription}}</p></div><div class=\"oece-validity\"><span class=\"badge\">{{credentialLevel}}</span><span>Vigencia documental</span><strong>{{credentialDates}}</strong></div>",
  "categoryOptions": "<option value=\"todas\">Todas las especialidades</option>{{categories}}",
  "contactBlock": "<p class=\"contact-location\"><svg class=\"icon\" aria-hidden=\"true\"><use href=\"#location\"></use></svg>{{location}}</p>{{contactLinks}}",
  "footerBrand": "<span class=\"brand-mark\" aria-hidden=\"true\">{{initials}}<span>/</span></span><span class=\"brand-name\">{{name}}<span>{{footerDescription}}</span></span>",
  "copyright": "© <span data-year>{{year}}</span> {{name}}. {{rights}}"
};
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[char]);
const e = escapeHtml;
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#${name}"></use></svg>`;
const date = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Fecha no válida: ${value}`);
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0,10) !== value) throw new Error(`Fecha inexistente: ${value}`);
  return value.split('-').reverse().join('/');
};
const time = value => `<time datetime="${e(value)}">${date(value)}</time>`;
const period = item => `${time(item.inicio)} <span aria-hidden="true">—</span><span class="sr-only"> hasta </span> ${item.fin ? time(item.fin) : 'Actualidad'}`;
const headline = lines => `${e(lines[0])}<br><em>${e(lines.slice(1).join(' '))}</em>`;
const list = values => values.map(value => `<li>${e(value)}</li>`).join('');
function localAsset(value) {
  if (typeof value !== 'string' || !/^assets\/[\w./-]+$/.test(value) || value.split('/').some(part => part === '..' || part === '.')) throw new Error(`Ruta de recurso no válida: ${value}`);
  return value;
}
function publicUrl(value) {
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Los enlaces públicos deben usar HTTPS sin credenciales.');
  return parsed.href;
}
function validate(data) {
  for (const name of ['experiencia','formacion','certificaciones','competencias','navegacion']) {
    if (!Array.isArray(data[name]) || !data[name].length) throw new Error(`La lista ${name} está vacía o no es válida.`);
  }
  const usedIds = new Set();
  for (const item of [...data.experiencia,...data.formacion,...data.certificaciones]) {
    if (!/^[a-z][\w-]*$/.test(item.id) || usedIds.has(item.id)) throw new Error(`Identificador inválido o duplicado: ${item.id}`);
    usedIds.add(item.id);
  }
  const sections = ['inicio','perfil','experiencia','formacion','certificaciones','competencias','contacto'];
  if (data.navegacion.some(item => !sections.includes(item.id))) throw new Error('La navegación contiene una sección desconocida.');
  for (const item of [...data.experiencia,...data.certificaciones,data.acreditacion]) {
    date(item.inicio);
    if (item.fin) { date(item.fin); if (item.fin < item.inicio) throw new Error(`Periodo invertido: ${item.id ?? item.nombre}`); }
  }
  const mail = data.contacto.correo;
  if (mail.publicar && !/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(mail.direccion)) throw new Error('Añade un correo real antes de activar contacto.correo.publicar.');
  if (data.contacto.linkedin.publicar) publicUrl(data.contacto.linkedin.url);
  if (data.sitio.urlPublica) publicUrl(data.sitio.urlPublica);
  if (data.identidad.foto.publicar) {
    localAsset(data.identidad.foto.archivo);
    if (!(data.identidad.foto.ancho > 0 && data.identidad.foto.alto > 0)) throw new Error('La foto necesita ancho y alto.');
  }
  if (data.identidad.cv.publicar) localAsset(data.identidad.cv.archivo);
}

function prepareProfile(d) {
  validate(d);
  const cv = d.identidad.cv;
  const cvLink = className => cv.publicar ? `<a class="${className}" href="${e(localAsset(cv.archivo))}" download>${e(cv.etiqueta)} ${icon('download')}</a>` : '';
  const nav = footer => d.navegacion.map(item => `<a href="#${e(item.id)}"${footer ? '' : ' data-nav-link'}>${e(item.texto)}</a>`).join('');
  const photo = d.identidad.foto;
  const portrait = photo.publicar
    ? `<div class="photo-frame"><img src="${e(localAsset(photo.archivo))}" alt="${e(photo.textoAlternativo)}" width="${e(photo.ancho)}" height="${e(photo.alto)}" fetchpriority="high"></div>`
    : `<div class="seal" role="img" aria-label="Monograma de ${e(d.identidad.nombre)}"><span class="seal-overline">${e(d.portada.selloSuperior)}</span><span class="seal-initials">${e(d.identidad.iniciales)}</span><span class="seal-rule"></span><span class="seal-under">${e(d.portada.selloInferior)}</span></div>`;
  const work = item => `<article class="timeline-item" id="${e(item.id)}"><div class="timeline-period">${period(item)}</div><details class="experience-detail"><summary><span class="experience-heading"><span class="institution">${e(item.institucion)}</span><span class="experience-role">${e(item.cargo)}</span></span><span class="detail-indicator">${icon('plus')}<span class="sr-only">Ver área y funciones</span></span></summary><div class="experience-body"><p class="detail-label">Dependencia / área</p><p>${e(item.area)}</p><p class="detail-label">Funciones documentadas</p><ul>${list(item.funciones)}</ul></div></details></article>`;
  // Las entradas no destacadas permanecen visibles y accesibles sin JavaScript.
  const experience = d.experiencia.filter(x => x.destacada).map(work).join('') + `<div id="historial-completo" data-older-experience>${d.experiencia.filter(x => !x.destacada).map(work).join('')}</div>`;
  const education = d.formacion.map((item,i) => `<article class="education-card" id="${e(item.id)}"><div class="card-overline"><span>${String(i+1).padStart(2,'0')}</span>${icon('book')}</div><span class="badge ${item.estado === 'Grado obtenido' ? '' : 'badge-study'}">${e(item.estado)}</span><h3>${e(item.programa)}</h3><p class="education-institution">${e(item.institucion)}</p>${item.dependencia ? `<p>${e(item.dependencia)}</p>` : ''}<p class="education-period">${e(item.inicio)}${item.fin ? ` — ${e(item.fin)}` : ''}</p>${item.detalle ? `<p class="education-note">${e(item.detalle)}</p>` : ''}</article>`).join('');
  const categories = [...new Set(d.certificaciones.map(item=>item.categoria))];
  const certificates = [...d.certificaciones].sort((a,b)=>b.fin.localeCompare(a.fin)).map(item => `<article class="certificate-card" id="${e(item.id)}" data-category="${e(item.categoria)}"><p class="certificate-category">${e(item.categoria)}</p><h3>${e(item.nombre)}</h3><p class="certificate-institution">${e(item.institucion)}</p><div class="certificate-meta"><span>${period(item)}</span><span>${e(item.horas)} ${e(item.tipoHoras)}</span></div>${item.expedicion && !item.expedicionPorVerificar ? `<p class="certificate-issued">Expedición: ${time(item.expedicion)}</p>` : ''}</article>`).join('');
  const contactLinks = [
    d.contacto.correo.publicar ? `<a class="contact-link" href="mailto:${e(d.contacto.correo.direccion)}">${icon('mail')}<span>${e(d.contacto.correo.direccion)}</span>${icon('arrow')}</a>` : '',
    d.contacto.linkedin.publicar ? `<a class="contact-link" href="${e(publicUrl(d.contacto.linkedin.url))}" target="_blank" rel="noopener noreferrer">${icon('linkedin')}<span>${e(d.contacto.linkedin.etiqueta)}</span><span class="sr-only"> (abre en otra pestaña)</span>${icon('arrow')}</a>` : '',
    cvLink('contact-link'),
  ].join('');
  const schema = {'@context':'https://schema.org','@type':'Person',name:d.identidad.nombre,description:d.sitio.descripcion,knowsAbout:d.competencias.map(x=>x.nombre),alumniOf:d.formacion.filter(x=>x.estado === 'Grado obtenido').map(x=>({'@type':'CollegeOrUniversity',name:x.institucion}))};
  if (d.sitio.urlPublica) schema.url = publicUrl(d.sitio.urlPublica);
  if (d.contacto.linkedin.publicar && new URL(d.contacto.linkedin.url).pathname.startsWith('/in/')) schema.sameAs = [publicUrl(d.contacto.linkedin.url)];
  const slots = {
    title:e(d.sitio.titulo), description:e(d.sitio.descripcion), name:e(d.identidad.nombre), shortName:e(d.identidad.nombreCorto), initials:e(d.identidad.iniciales),
    canonical:d.sitio.urlPublica ? `<link rel="canonical" href="${e(publicUrl(d.sitio.urlPublica))}"><meta property="og:url" content="${e(publicUrl(d.sitio.urlPublica))}">` : '',
    schema:JSON.stringify(schema).replace(/</g,'\\u003c'), navigation:nav(false), footerNavigation:nav(true), heroLabel:e(d.portada.etiqueta), heroHeadline:headline(d.portada.titular), heroDescription:e(d.portada.resumen), heroAction:e(d.portada.accion), heroDownload:cvLink('button button-text'), portrait, sealCaption:e(d.portada.pieSello), specialty:e(d.identidad.especialidad),
    credentialLabel:e(d.acreditacion.etiqueta), credentialName:e(d.acreditacion.nombre), credentialLevel:e(d.acreditacion.nivel), credentialDescription:e(d.acreditacion.descripcion), credentialDates:period(d.acreditacion), systems:d.herramientas.map(e).join(' · '),
    profileLabel:e(d.perfil.etiqueta), profileTitle:headline(d.perfil.titulo), profileLead:e(d.perfil.entradilla), profileParagraphs:d.perfil.parrafos.map(p=>`<p>${e(p)}</p>`).join(''), values:d.perfil.valores.map(p=>`<span>${e(p)}</span>`).join(''), profileHighlights:d.perfil.destacados.map(p=>`<li>${e(p)}</li>`).join(''), experience, education, categories:categories.map(p=>`<option value="${e(p)}">${e(p)}</option>`).join(''), certificates,
    skills:d.competencias.map((item,i)=>`<article class="expertise-card"><span class="expertise-number">${String(i+1).padStart(2,'0')}</span><h3>${e(item.nombre)}</h3><p>${e(item.descripcion)}</p><ul>${list(item.elementos)}</ul></article>`).join(''), systemList:list(d.herramientas), contactLabel:e(d.contacto.etiqueta), contactTitle:headline(d.contacto.titulo), contactDescription:e(d.contacto.descripcion), location:e(d.identidad.ubicacion), contactLinks, footerDescription:e(d.pie.descripcion), rights:e(d.pie.derechos), year:new Intl.DateTimeFormat('en',{year:'numeric',timeZone:'America/Lima'}).format(new Date()),
  };
  for (const [name, markup] of Object.entries(componentTemplates)) {
    slots[name] = markup.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (!(key in slots)) throw new Error(`Campo desconocido: ${key}`);
      return slots[key];
    });
  }
  return slots;
}
function renderProfile(data) {
  const slots = prepareProfile(data);
  for (const element of document.querySelectorAll('[data-slot]')) {
    const key = element.dataset.slot;
    if (!(key in slots)) throw new Error(`Sección desconocida: ${key}`);
    // Todos los textos variables se han escapado y sus rutas se han validado.
    element.innerHTML = slots[key];
  }
  document.documentElement.lang = data.sitio.idioma || 'es-PE';
  document.title = data.sitio.titulo;
  for (const selector of ['meta[name="description"]','meta[property="og:description"]']) document.querySelector(selector)?.setAttribute('content', data.sitio.descripcion);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', data.sitio.titulo);
  document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', data.identidad.nombre);
  document.querySelector('script[type="application/ld+json"]').textContent = slots.schema;
  document.querySelector('[data-slot="headerBrand"]').setAttribute('aria-label', `${data.identidad.nombre}, inicio`);
  for (const element of document.querySelectorAll('link[rel="canonical"],meta[property="og:url"]')) element.remove();
  if (data.sitio.urlPublica) {
    const canonical = document.createElement('link');canonical.rel='canonical';canonical.href=publicUrl(data.sitio.urlPublica);document.head.append(canonical);
    const openGraph = document.createElement('meta');openGraph.setAttribute('property','og:url');openGraph.content=publicUrl(data.sitio.urlPublica);document.head.append(openGraph);
  }
}
window.HeimySite = Object.assign(window.HeimySite || {}, { prepareProfile, renderProfile });

})();
