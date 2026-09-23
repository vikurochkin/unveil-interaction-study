import { createVideoPlayer } from './video-player.js';

export function renderProject(root, project, { onHome }) {
  root.className = 'project-view';
  root.innerHTML = `
    <section class="project-intro">
      <button class="project-home" type="button">${project.title}</button>
      <p>${project.description}</p>
    </section>
    <section class="media-frame hero-media">
      <video preload="metadata" playsinline loop poster="${project.poster}" data-duration="${project.duration}">
        <source src="${project.video}" type="video/mp4">
      </video>
      <div class="media-controls">
        <button class="play-toggle" type="button">Play</button>
        <span class="timecode">0:00 / 4:33</span>
        <button class="sound-toggle" type="button">Sound on</button>
        <button class="fullscreen-toggle" type="button">Fullscreen</button>
      </div>
    </section>
    <section class="project-gallery" aria-label="NTO Stratus gallery">
      ${project.stills.map((source, index) => `
        <figure class="gallery-cell">
          <img class="project-still" src="${source}" alt="NTO / Stratus artwork ${index + 1}" loading="lazy" decoding="async">
        </figure>`).join('')}
    </section>
    <a class="next-project" href="https://unveil.fr/spells"><span>Spells</span><span>Next project</span></a>
    <footer class="study-credit">Independent study — original work by <a href="https://unveil.fr">UNVEIL®</a></footer>`;
  const homeButton = root.querySelector('.project-home');
  const video = root.querySelector('video');
  const player = createVideoPlayer(video, root.querySelector('.media-controls'));
  homeButton.addEventListener('click', onHome);
  return {
    destroy() {
      player.destroy();
      if (!video.paused && video.readyState > 0) video.pause();
      homeButton.removeEventListener('click', onHome);
    }
  };
}
