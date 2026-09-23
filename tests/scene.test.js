import { describe, expect, test } from 'vitest';
import { getCardTransform, wrapIndex } from '../src/scene.js';

describe('wrapIndex', () => {
  test.each([
    [0, 5, 0],
    [6, 5, 1],
    [-1, 5, 4],
    [-11, 5, 4]
  ])('wraps %s across %s', (value, length, expected) => {
    expect(wrapIndex(value, length)).toBe(expected);
  });

  test('returns zero for an empty collection', () => {
    expect(wrapIndex(3, 0)).toBe(0);
  });
});

describe('getCardTransform', () => {
  const viewport = { width: 1280, height: 720 };
  const pointer = { x: 0, y: 0 };

  test('centers the active card on the tunnel path', () => {
    expect(getCardTransform(2, 2, viewport, pointer)).toMatchObject({
      x: 0,
      y: 0,
      z: 0,
      rotateY: 0,
      opacity: 1
    });
  });

  test('places neighbors diagonally through depth', () => {
    const next = getCardTransform(3, 2, viewport, pointer);
    expect(next.x).toBeGreaterThan(100);
    expect(next.y).toBeLessThan(0);
    expect(next.z).toBeLessThan(0);
  });

  test('stays finite for distant positions and zero-sized viewports', () => {
    const result = getCardTransform(400, -10000, { width: 0, height: 0 }, { x: 20, y: -20 });
    Object.values(result).forEach((value) => expect(Number.isFinite(value)).toBe(true));
  });
});

