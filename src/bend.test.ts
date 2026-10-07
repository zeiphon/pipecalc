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

describe('measured face', () => {
  it('inside dimensions on an L add one thickness per bend end', () => {
    const r = calculate({ sections: [100, 200], turns: ['right'], faces: ['inside', 'inside'], loss: 11, thickness: 6 });
    expect(r.adjustedSections).toEqual([106, 206]);
    expect(r.cutLength).toBe(301);
  });

  it('a U middle measured inside adds a thickness at both ends', () => {
    const r = calculate({
      sections: [125, 206, 131],
      turns: ['right', 'right'],
      faces: ['outside', 'inside', 'outside'],
      loss: 11,
      thickness: 6,
    });
    expect(r.adjustedSections).toEqual([125, 218, 131]);
    expect(r.insideBends).toEqual([[], [0, 1], []]);
  });

  it('a Z middle is one thickness short whichever face it is measured on', () => {
    const base = { sections: [125, 206, 131], turns: ['right', 'left'] as const, loss: 11, thickness: 6 };
    const out = calculate({ ...base, turns: [...base.turns], faces: ['outside', 'outside', 'outside'] });
    const ins = calculate({ ...base, turns: [...base.turns], faces: ['outside', 'inside', 'outside'] });
    expect(out.cutLength).toBe(446);
    expect(ins.cutLength).toBe(446);
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
