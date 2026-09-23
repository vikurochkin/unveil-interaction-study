import { formatTime } from './utils.js';

export function createVideoPlayer(video, controls) {
  const playButton = controls.querySelector('.play-toggle');
  const soundButton = controls.querySelector('.sound-toggle');
  const timecode = controls.querySelector('.timecode');
  const fullscreenButton = controls.querySelector('.fullscreen-toggle');
  video.muted = true;
  const updateTime = () => {
    const duration = Number.isFinite(video.duration) ? video.duration : Number(video.dataset.duration || 0);
    timecode.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
  };
  const updatePlay = () => { playButton.textContent = video.paused ? 'Play' : 'Pause'; };
  const updateSound = () => { soundButton.textContent = video.muted ? 'Sound on' : 'Sound off'; };
  const togglePlay = async () => {
    controls.classList.remove('has-error');
    if (!video.paused) {
      video.pause();
      updatePlay();
      return;
    }
    try {
      await video.play();
      playButton.textContent = 'Pause';
    } catch {
      controls.classList.add('has-error');
      playButton.textContent = 'Play';
      playButton.disabled = false;
    }
  };
  const toggleSound = () => { video.muted = !video.muted; updateSound(); };
  const enterFullscreen = async () => {
    const mediaFrame = video.closest('.media-frame') || video;
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
      else await mediaFrame.requestFullscreen?.();
    } catch {
      controls.classList.add('has-error');
    }
  };
  playButton.addEventListener('click', togglePlay);
  soundButton.addEventListener('click', toggleSound);
  fullscreenButton.addEventListener('click', enterFullscreen);
  video.addEventListener('timeupdate', updateTime);
  video.addEventListener('durationchange', updateTime);
  video.addEventListener('loadedmetadata', updateTime);
  video.addEventListener('play', updatePlay);
  video.addEventListener('pause', updatePlay);
  updateTime(); updatePlay(); updateSound();
  return {
    destroy() {
      playButton.removeEventListener('click', togglePlay);
      soundButton.removeEventListener('click', toggleSound);
      fullscreenButton.removeEventListener('click', enterFullscreen);
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('durationchange', updateTime);
      video.removeEventListener('loadedmetadata', updateTime);
      video.removeEventListener('play', updatePlay);
      video.removeEventListener('pause', updatePlay);
    }
  };
}

