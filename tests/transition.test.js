import { afterEach, expect, test, vi } from 'vitest';
import { createTransitionController } from '../src/transition.js';

afterEach(() => vi.useRealTimers());

test('reduced motion navigates without entering zoom phases', async () => {
  const navigate = vi.fn();
  const controller = createTransitionController({ document, reducedMotion: true, navigate });
  await controller.open({ slug: 'nto-stratus' }, document.createElement('button'));
  expect(navigate).toHaveBeenCalledWith('/nto-stratus');
  expect(document.documentElement.dataset.transition).toBeUndefined();
});

test('isolates a clicked card before navigating and cleans the transition layer', async () => {
  vi.useFakeTimers();
  const source = document.createElement('button');
  source.innerHTML = '<img src="https://example.com/card.jpg" alt="">';
  source.style.setProperty('--ry', '-30deg');
  source.getBoundingClientRect = () => ({ left: 100, top: 80, width: 320, height: 180, right: 420, bottom: 260 });
  document.body.append(source);
  const navigate = vi.fn();
  const controller = createTransitionController({ document, reducedMotion: false, navigate, duration: 1000 });
  const pending = controller.open({ slug: 'nto-stratus' }, source);
  expect(document.documentElement.dataset.transition).toBe('isolating');
  expect(document.querySelector('.shared-card').style.getPropertyValue('--start-ry')).toBe('-30deg');
  await vi.advanceTimersByTimeAsync(620);
  expect(navigate).toHaveBeenCalledWith('/nto-stratus');
  await vi.advanceTimersByTimeAsync(500);
  await pending;
  expect(document.querySelector('.shared-card')).toBeNull();
  expect(document.documentElement.dataset.transition).toBeUndefined();
});
