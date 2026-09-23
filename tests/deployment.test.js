import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

test('rewrites direct project requests to the SPA entry', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  expect(config.rewrites).toContainEqual({ source: '/nto-stratus', destination: '/index.html' });
  expect(config.rewrites).toContainEqual({ source: '/nto-stratus/', destination: '/index.html' });
});
