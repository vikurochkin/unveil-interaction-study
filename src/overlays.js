const legalLinks = `
  <nav class="legal-links" aria-label="Legal">
    <a href="https://unveil.fr/cookie-policy">Cookie Policy</a>
    <a href="https://unveil.fr/privacy-policy">Privacy Policy</a>
    <a href="https://unveil.fr/legal-notice">Legal Notice</a>
  </nav>`;

export function createOverlayController(doc, { projects, onSelect }) {
  const contact = doc.createElement('section');
  contact.className = 'site-overlay contact-overlay';
  contact.dataset.overlay = 'contact';
  contact.hidden = true;
  contact.innerHTML = `
    <button class="overlay-backdrop" type="button" aria-label="Close contact"></button>
    <nav class="contact-links" aria-label="Contact links">
      <a class="glass-pill" href="mailto:contact@unveil.fr">contact@unveil.fr</a>
      <a class="glass-pill" href="https://instagram.com/byunveil/" target="_blank" rel="noreferrer">Instagram</a>
      <a class="glass-pill address-link" href="https://maps.app.goo.gl/yvLUoqpnDYZmS8x56" target="_blank" rel="noreferrer">25 Rue Henry Monnier, 75009 Paris</a>
    </nav>
    ${legalLinks}`;

  const index = doc.createElement('section');
  index.className = 'site-overlay index-overlay';
  index.dataset.overlay = 'index';
  index.hidden = true;
  index.innerHTML = `
    <button class="overlay-backdrop" type="button" aria-label="Close index"></button>
    <div class="index-list" role="dialog" aria-label="Project index"></div>
    ${legalLinks}`;
  const list = index.querySelector('.index-list');
  projects.forEach((project, projectIndex) => {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'index-row';
    button.dataset.indexProject = project.slug;
    button.innerHTML = `<span>${String(projectIndex + 1).padStart(2, '0')}</span><span>${project.title}</span><span>${project.slug === 'nto-stratus' ? '2025' : ''}</span>`;
    button.addEventListener('click', () => {
      closeAll();
      onSelect(project, button);
    });
    list.append(button);
  });
  doc.body.append(contact, index);

  const closeAll = () => {
    contact.hidden = true;
    index.hidden = true;
    doc.documentElement.classList.remove('overlay-open');
  };
  const open = (element) => {
    closeAll();
    element.hidden = false;
    doc.documentElement.classList.add('overlay-open');
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') closeAll(); };
  contact.querySelector('.overlay-backdrop').addEventListener('click', closeAll);
  index.querySelector('.overlay-backdrop').addEventListener('click', closeAll);
  doc.addEventListener('keydown', onKeyDown);

  return {
    openContact: () => open(contact),
    openIndex: () => open(index),
    close: closeAll,
    destroy() {
      doc.removeEventListener('keydown', onKeyDown);
      contact.remove();
      index.remove();
    }
  };
}

