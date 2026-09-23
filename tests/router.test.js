import { describe, expect, test, vi } from 'vitest';
import { createRouter, normalizePath } from '../src/router.js';

describe('normalizePath', () => {
  test.each([
    ['/nto-stratus', '/nto-stratus'],
    ['/nto-stratus/', '/nto-stratus'],
    ['/nto-stratus?from=home', '/nto-stratus'],
    ['/unknown', '/'],
    ['', '/']
  ])('normalizes %s', (input, expected) => {
    expect(normalizePath(input)).toBe(expected);
  });
});

test('router publishes push and back navigation', () => {
  const router = createRouter(window);
  const listener = vi.fn();
  const unsubscribe = router.subscribe(listener);
  router.navigate('/nto-stratus');
  expect(router.path).toBe('/nto-stratus');
  expect(listener).toHaveBeenLastCalledWith('/nto-stratus');
  history.replaceState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
  expect(listener).toHaveBeenLastCalledWith('/');
  unsubscribe();
  router.destroy();
});

