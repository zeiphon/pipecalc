import { describe, expect, it } from 'vitest';
import { calculate, layout } from './bend';

describe('calculate', () => {
  it('single bend: 1937 + 100 - 11 = 2026, marked at 1931.5', () => {
    const r = calculate({ sections: [1937, 100], turns: ['right'], loss: 11, thickness: 6 });
    expect(r.cutLength).toBe(2026);
    expect(r.marks).toEqual([1931.5]);
  });

  it('Z shape adds thickness to the middle section', () => {
    const r = calculate({ sections: [125, 206, 131], turns: ['right', 'left'], loss: 11, thickness: 6 });
    expect(r.cutLength).toBe(446);
    expect(r.marks).toEqual([119.5, 320.5]);
  });

  it('U shape (same direction) needs no thickness correction', () => {
    const r = calculate({ sections: [125, 206, 131], turns: ['right', 'right'], loss: 11, thickness: 6 });
    expect(r.cutLength).toBe(440);
    expect(r.marks).toEqual([119.5, 320.5 - 6]);
  });
});

describe('layout', () => {
  it('heads up, then turns right then left', () => {
    expect(layout([10, 20, 30], ['right', 'left'])).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: -10 },
      { x: 20, y: -10 },
      { x: 20, y: -40 },
    ]);
  });
});
