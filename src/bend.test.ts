import { describe, expect, it } from 'vitest';
import { arcLength } from './bend';

describe('arcLength', () => {
  it('computes a quarter circle', () => {
    expect(arcLength(90, 10)).toBeCloseTo(15.70796, 4);
  });
});
