import { getCardTransform } from './scene.js';

const imageUrl = (url) => `${url}?auto=format&fit=max&w=720&q=84`;

export function renderHome(root, {
  projects,
  onSelect,
  requestFrame = requestAnimationFrame,
  cancelFrame = cancelAnimationFrame
}) {
  root.className = 'home-view';
  root.tabIndex = -1;
  root.innerHTML = '<div class="tunnel" aria-label="Projects"></div><div class="project-readout" aria-live="polite"></div>';
  const tunnel = root.querySelector('.tunnel');
  const readout = root.querySelector('.project-readout');
  const ntoIndex = Math.max(0, projects.findIndex((project) => project.slug === 'nto-stratus'));
  const cards = projects.map((project, index) => {
    const link = document.createElement('a');
    link.className = 'project-card';
    link.href = '/nto-stratus';
    link.dataset.project = project.slug;
    link.dataset.index = String(index);
    link.setAttribute('aria-label', `Open project ${project.title}`);
    link.style.setProperty('--card-ratio', String([1.33, 0.78, 1, 1.5, 0.67][index % 5]));
    const media = document.createElement('span');
    media.className = 'project-card__media';
    const image = document.createElement('img');
    image.alt = '';
    image.decoding = 'async';
    image.loading = Math.abs(index - ntoIndex) < 7 ? 'eager' : 'lazy';
    image.src = imageUrl(project.image);
    media.append(image);
    link.append(media);
    link.addEventListener('mouseenter', () => {
      link.setAttribute('data-hovered', '');
      readout.textContent = `${project.title} — ${String(index + 1).padStart(2, '0')}`;
    });
    link.addEventListener('mouseleave', () => { link.removeAttribute('data-hovered'); });
    link.addEventListener('focus', () => {
      link.setAttribute('data-hovered', '');
      readout.textContent = `${project.title} — ${String(index + 1).padStart(2, '0')}`;
    });
    link.addEventListener('blur', () => { link.removeAttribute('data-hovered'); });
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (state.suppressNextClick) {
        state.suppressNextClick = false;
        return;
      }
      onSelect(project, link);
    });
    tunnel.append(link);
    return link;
  });

  const state = {
    position: ntoIndex,
    target: ntoIndex,
    velocity: 0,
    pointer: { x: 0, y: 0 },
    dragging: false,
    lastY: 0,
    startY: 0,
    hasCapture: false,
    dragDistance: 0,
    suppressNextClick: false
  };
  let frameId = 0;

  const draw = () => {
    state.position += (state.target - state.position) * 0.075;
    state.velocity *= 0.9;
    state.target += state.velocity;
    const boundedTarget = Math.max(0, Math.min(projects.length - 1, state.target));
    if (boundedTarget !== state.target) state.velocity = 0;
    state.target = boundedTarget;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    cards.forEach((card, index) => {
      const transform = getCardTransform(index, state.position, viewport, state.pointer);
      card.style.setProperty('--x', `${transform.x}px`);
      card.style.setProperty('--y', `${transform.y}px`);
      card.style.setProperty('--z', `${transform.z}px`);
      card.style.setProperty('--rx', `${transform.rotateX}deg`);
      card.style.setProperty('--ry', `${transform.rotateY}deg`);
      card.style.setProperty('--rz', `${transform.rotateZ}deg`);
      card.style.setProperty('--scale', transform.scale);
      card.style.opacity = String(transform.opacity);
      card.style.pointerEvents = transform.opacity > 0.08 ? 'auto' : 'none';
      card.style.zIndex = String(Math.max(1, 1000 + Math.round(transform.z)));
      card.toggleAttribute('data-active', Math.abs(index - state.position) < 0.5);
    });
    frameId = requestFrame(draw);
  };

  const onWheel = (event) => {
    event.preventDefault();
    state.target += Math.sign(event.deltaY || event.deltaX) * Math.min(1.5, Math.abs(event.deltaY || event.deltaX) / 220);
    state.target = Math.max(0, Math.min(projects.length - 1, state.target));
  };
  const onPointerDown = (event) => {
    state.dragging = true;
    state.lastY = event.clientY;
    state.startY = event.clientY;
    state.hasCapture = false;
    state.dragDistance = 0;
    state.velocity = 0;
    root.classList.add('is-dragging');
  };
  const onPointerMove = (event) => {
    state.pointer.x = event.clientX - window.innerWidth / 2;
    state.pointer.y = event.clientY - window.innerHeight / 2;
    if (!state.dragging) return;
    if (!state.hasCapture && Math.abs(event.clientY - state.startY) > 4) {
      root.setPointerCapture?.(event.pointerId);
      state.hasCapture = true;
    }
    const delta = state.lastY - event.clientY;
    state.dragDistance += Math.abs(delta);
    state.lastY = event.clientY;
    const amount = delta / Math.max(120, window.innerHeight * 0.2);
    state.target = Math.max(0, Math.min(projects.length - 1, state.target + amount));
    state.velocity = Number.isFinite(amount) ? amount * 0.08 : 0;
  };
  const onPointerUp = (event) => {
    if (event.clientY === state.lastY) state.velocity = 0;
    state.dragging = false;
    state.suppressNextClick = state.dragDistance > 4;
    root.classList.remove('is-dragging');
    if (state.hasCapture) root.releasePointerCapture?.(event.pointerId);
    state.hasCapture = false;
  };
  const onKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    state.target = Math.max(0, Math.min(projects.length - 1, state.target + (event.key === 'ArrowDown' ? 1 : -1)));
  };

  root.addEventListener('wheel', onWheel, { passive: false });
  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', onPointerUp);
  root.addEventListener('keydown', onKeyDown);
  draw();

  return {
    getState: () => ({ ...state, pointer: { ...state.pointer } }),
    focusProject(slug) {
      const index = projects.findIndex((project) => project.slug === slug);
      if (index >= 0) state.target = index;
    },
    destroy() {
      cancelFrame(frameId);
      root.removeEventListener('wheel', onWheel);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('pointercancel', onPointerUp);
      root.removeEventListener('keydown', onKeyDown);
    }
  };
}
