import { expect, test, vi } from 'vitest';
import { NTO_PROJECT } from '../src/data.js';
import { renderProject } from '../src/project.js';

test('renders exact NTO Stratus copy, poster, gallery, and next project', () => {
  const root = document.createElement('main');
  document.body.append(root);
  const view = renderProject(root, NTO_PROJECT, { onHome: vi.fn() });
  expect(root.textContent).toContain('NTO / Stratus');
  expect(root.textContent).toContain("AI visualizer for 'Stratus' by NTO.");
  expect(root.querySelector('video').poster).toBe(NTO_PROJECT.poster);
  expect(root.querySelectorAll('.project-still')).toHaveLength(6);
  expect(root.textContent).toContain('Spells');
  expect(root.textContent).toContain('Next project');
  view.destroy();
});

test('project brand button returns home', () => {
  const onHome = vi.fn();
  const root = document.createElement('main');
  document.body.append(root);
  const view = renderProject(root, NTO_PROJECT, { onHome });
  root.querySelector('.project-home').click();
  expect(onHome).toHaveBeenCalledOnce();
  view.destroy();
});

