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

test('renders every project as a native project link and selects NTO Stratus', () => {
  const { root, view, onSelect } = makeView();
  expect(root.querySelectorAll('.project-card')).toHaveLength(PROJECTS.length);
  const link = root.querySelector('[data-project="nto-stratus"]');
  expect(link.tagName).toBe('A');
  expect(link.getAttribute('href')).toBe('/nto-stratus');
  expect(link.getAttribute('aria-label')).toContain('NTO / Stratus');
  link.click();
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ slug: 'nto-stratus' }), link);
  view.destroy();
});

test('hover marks the card so its media can slide out from the catalogue', () => {
  const { root, view } = makeView();
  const link = root.querySelector('[data-project="nto-stratus"]');
  expect(link.querySelector('.project-card__media')).not.toBeNull();
  link.dispatchEvent(new MouseEvent('mouseenter'));
  expect(link.hasAttribute('data-hovered')).toBe(true);
  link.dispatchEvent(new MouseEvent('mouseleave'));
  expect(link.hasAttribute('data-hovered')).toBe(false);
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

test('a simple press does not capture the pointer before the card click', () => {
  const root = document.createElement('main');
  root.setPointerCapture = vi.fn();
  document.body.append(root);
  const view = renderHome(root, {
    projects: PROJECTS,
    onSelect: vi.fn(),
    requestFrame: () => 1,
    cancelFrame: vi.fn()
  });
  root.querySelector('[data-project="nto-stratus"]').dispatchEvent(new PointerEvent('pointerdown', {
    pointerId: 8,
    clientY: 100,
    bubbles: true
  }));
  expect(root.setPointerCapture).not.toHaveBeenCalled();
  view.destroy();
});

test('dragging over a card suppresses its following click', () => {
  const { root, view, onSelect } = makeView();
  const link = root.querySelector('[data-project="nto-stratus"]');
  link.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 9, clientY: 160, bubbles: true }));
  link.dispatchEvent(new PointerEvent('pointermove', { pointerId: 9, clientY: 120, bubbles: true }));
  link.dispatchEvent(new PointerEvent('pointerup', { pointerId: 9, clientY: 120, bubbles: true }));
  link.click();
  expect(onSelect).not.toHaveBeenCalled();
  view.destroy();
});

test('drag inertia cannot push the scene beyond the last project', () => {
  let nextFrame;
  const root = document.createElement('main');
  document.body.append(root);
  const view = renderHome(root, {
    projects: PROJECTS,
    onSelect: vi.fn(),
    requestFrame: (callback) => { nextFrame = callback; return 1; },
    cancelFrame: vi.fn()
  });
  root.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 4, clientY: 800, bubbles: true }));
  root.dispatchEvent(new PointerEvent('pointermove', { pointerId: 4, clientY: -800, bubbles: true }));
  for (let frame = 0; frame < 12; frame += 1) nextFrame();
  expect(view.getState().target).toBeLessThanOrEqual(PROJECTS.length - 1);
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
