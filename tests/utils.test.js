import { expect, test } from 'vitest';
import { formatTime } from '../src/utils.js';

test.each([
  [273, '4:33'],
  [0, '0:00'],
  [-10, '0:00'],
  [Number.NaN, '0:00'],
  [3601, '60:01']
])('formats %s seconds as %s', (input, expected) => {
  expect(formatTime(input)).toBe(expected);
});
