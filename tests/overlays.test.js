import { expect, test, vi } from 'vitest';
import { PROJECTS } from '../src/data.js';
import { createOverlayController } from '../src/overlays.js';

test('contact overlay exposes original links and closes with Escape', () => {
  const controller = createOverlayController(document, { projects: PROJECTS, onSelect: vi.fn() });
  controller.openContact();
  const overlay = document.querySelector('[data-overlay="contact"]');
  expect(overlay.hidden).toBe(false);
  expect(overlay.querySelector('a[href="mailto:contact@unveil.fr"]')).not.toBeNull();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(overlay.hidden).toBe(true);
  controller.destroy();
});

test('index overlay lists projects and forwards selection', () => {
  const onSelect = vi.fn();
  const controller = createOverlayController(document, { projects: PROJECTS, onSelect });
  controller.openIndex();
  const button = document.querySelector('[data-index-project="nto-stratus"]');
  button.click();
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ slug: 'nto-stratus' }), button);
  expect(document.querySelector('[data-overlay="index"]').hidden).toBe(true);
  controller.destroy();
});
