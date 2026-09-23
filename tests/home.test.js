import { describe, expect, test, vi } from 'vitest';
import { PROJECTS } from '../src/data.js';
import { renderHome } from '../src/home.js';

function makeView(overrides = {}) {
  const root = document.createElement('main');
  document.body.append(root);
  const onSelect = vi.fn();
  const view = renderHome(root, {
    projects: PROJECTS,
    onSelect,
    requestFrame: () => 1,
    cancelFrame: vi.fn(),
    ...overrides
  });
  return { root, view, onSelect };
}

test('renders every project as a named button and selects NTO Stratus', () => {
  const { root, view, onSelect } = makeView();
  expect(root.querySelectorAll('.project-card')).toHaveLength(PROJECTS.length);
  const button = root.querySelector('[data-project="nto-stratus"]');
  expect(button.getAttribute('aria-label')).toContain('NTO / Stratus');
  button.click();
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ slug: 'nto-stratus' }), button);
  view.destroy();
});

test('wheel motion updates the target scene position', () => {
  const { root, view } = makeView();
  const before = view.getState().target;
  root.dispatchEvent(new WheelEvent('wheel', { deltaY: 240, cancelable: true }));
  expect(view.getState().target).toBeGreaterThan(before);
  view.destroy();
});

test('a pointer gesture with no movement keeps finite state', () => {
  const { root, view } = makeView();
  root.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientY: 100, bubbles: true }));
  root.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientY: 100, bubbles: true }));
  expect(Number.isFinite(view.getState().velocity)).toBe(true);
  expect(view.getState().velocity).toBe(0);
  view.destroy();
});

describe('keyboard motion', () => {
  test('ArrowDown advances the scene', () => {
    const { root, view } = makeView();
    const before = view.getState().target;
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(view.getState().target).toBe(before + 1);
    view.destroy();
  });
});
