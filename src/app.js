import './styles.css';
import { NTO_PROJECT, PROJECTS } from './data.js';
import { renderHome } from './home.js';
import { createOverlayController } from './overlays.js';
import { renderProject } from './project.js';
import { createRouter } from './router.js';
import { createTransitionController } from './transition.js';

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="site-header">
    <nav class="header-nav" aria-label="Primary">
      <button class="glass-button brand-button is-active" type="button"><span>UNVEIL</span><sup>®</sup><span class="brand-projects">Projects</span></button>
      <a class="glass-button" href="https://unveil.fr/research">Research</a>
      <a class="glass-button" href="https://unveil.fr/studio">Studio</a>
      <button class="glass-button contact-button" type="button">Contact</button>
    </nav>
  </header>
  <main id="route-view"></main>
  <nav class="view-switcher" aria-label="Project view">
    <button class="view-button overview-button is-active" type="button">Overview</button>
    <button class="view-button index-button" type="button">Index</button>
  </nav>
  <div class="intro-loader" aria-hidden="true"><span>0%</span></div>`;

const routeView = document.querySelector('#route-view');
const router = createRouter(window);
let currentView;

const transition = createTransitionController({
  document,
  reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  navigate: (path) => router.navigate(path)
});

const renderRoute = (path) => {
  currentView?.destroy?.();
  routeView.innerHTML = '';
  const isProject = path === '/nto-stratus';
  document.body.classList.toggle('project-route', isProject);
  document.querySelector('.view-switcher').hidden = isProject;
  if (isProject) {
    currentView = renderProject(routeView, NTO_PROJECT, { onHome: () => router.navigate('/') });
  } else {
    currentView = renderHome(routeView, { projects: PROJECTS, onSelect: (project, source) => transition.open(project, source) });
  }
};

const overlays = createOverlayController(document, {
  projects: PROJECTS,
  onSelect: (project, source) => transition.open(project, source)
});
document.querySelector('.contact-button').addEventListener('click', overlays.openContact);
document.querySelector('.index-button').addEventListener('click', overlays.openIndex);
document.querySelector('.overview-button').addEventListener('click', overlays.close);
document.querySelector('.brand-button').addEventListener('click', () => router.navigate('/'));
router.subscribe(renderRoute);
renderRoute(router.path);

const loader = document.querySelector('.intro-loader');
const loaderText = loader.querySelector('span');
let percent = 0;
const loadingTimer = window.setInterval(() => {
  percent = Math.min(100, percent + Math.max(1, Math.ceil((100 - percent) * 0.19)));
  loaderText.textContent = `${percent}%`;
  if (percent >= 100) {
    window.clearInterval(loadingTimer);
    loader.classList.add('is-complete');
    document.documentElement.classList.add('site-ready');
  }
}, 45);

window.addEventListener('pagehide', () => {
  currentView?.destroy?.();
  overlays.destroy();
  router.destroy();
}, { once: true });
