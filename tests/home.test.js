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

test('hover moves the image and its glass shell as one card object', () => {
  const { root, view } = makeView();
  const link = root.querySelector('[data-project="nto-stratus"]');
  const object = link.querySelector('.project-card__object');
  expect(object).not.toBeNull();
  expect(object.querySelector(':scope > .project-card__media')).not.toBeNull();
  link.dispatchEvent(new MouseEvent('mouseenter'));
  expect(link.hasAttribute('data-hovered')).toBe(true);
  link.dispatchEvent(new MouseEvent('mouseleave'));
  expect(link.hasAttribute('data-hovered')).toBe(false);
  view.destroy();
});

test('hovered project title follows the pointer and disappears on leave', () => {
  const { root, view } = makeView();
  const link = root.querySelector('[data-project="nto-stratus"]');
  const label = root.querySelector('.cursor-label');
  link.dispatchEvent(new MouseEvent('mouseenter'));
  root.dispatchEvent(new PointerEvent('pointermove', { clientX: 321, clientY: 234, bubbles: true }));
  expect(label.textContent).toContain('NTO / Stratus');
  expect(label.style.getPropertyValue('--cursor-x')).toBe('321px');
  expect(label.style.getPropertyValue('--cursor-y')).toBe('234px');
  expect(label.hasAttribute('data-visible')).toBe(true);
  link.dispatchEvent(new MouseEvent('mouseleave'));
  expect(label.hasAttribute('data-visible')).toBe(false);
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

test('wheel motion continues past the final project without changing direction', () => {
  const { root, view } = makeView();
  for (let step = 0; step < 12; step += 1) {
    root.dispatchEvent(new WheelEvent('wheel', { deltaY: 440, cancelable: true }));
  }
  expect(view.getState().target).toBeGreaterThan(PROJECTS.length - 1);
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
