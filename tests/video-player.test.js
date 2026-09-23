import { expect, test, vi } from 'vitest';
import { createVideoPlayer } from '../src/video-player.js';

function fixture({ rejects = false } = {}) {
  const video = document.createElement('video');
  Object.defineProperty(video, 'duration', { configurable: true, value: 273 });
  Object.defineProperty(video, 'currentTime', { configurable: true, writable: true, value: 12 });
  video.play = rejects ? vi.fn().mockRejectedValue(new Error('blocked')) : vi.fn().mockResolvedValue(undefined);
  video.pause = vi.fn();
  const controls = document.createElement('div');
  controls.innerHTML = '<button class="play-toggle"></button><span class="timecode"></span><button class="sound-toggle"></button><button class="fullscreen-toggle"></button>';
  document.body.append(video, controls);
  return { video, controls };
}

test('shows the original 4:33 duration and toggles audio', () => {
  const { video, controls } = fixture();
  const player = createVideoPlayer(video, controls);
  video.dispatchEvent(new Event('loadedmetadata'));
  expect(controls.querySelector('.timecode').textContent).toBe('0:12 / 4:33');
  controls.querySelector('.sound-toggle').click();
  expect(video.muted).toBe(false);
  expect(controls.querySelector('.sound-toggle').textContent).toBe('Sound off');
  player.destroy();
});

test('keeps controls usable when playback is blocked', async () => {
  const { video, controls } = fixture({ rejects: true });
  const player = createVideoPlayer(video, controls);
  controls.querySelector('.play-toggle').click();
  await Promise.resolve();
  await Promise.resolve();
  expect(controls.classList.contains('has-error')).toBe(true);
  expect(controls.querySelector('.play-toggle').disabled).toBe(false);
  player.destroy();
});
