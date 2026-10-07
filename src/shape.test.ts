import { describe, expect, it } from 'vitest';
import { addBend, flip, MAX_BENDS, removeBend, setLength, toggleFace, type Shape } from './shape';

const z: Shape = { sections: [125, 206, 131], turns: ['right', 'left'], faces: ['outside', 'outside', 'outside'] };

describe('shape edits', () => {
  it('sets a section length', () => {
    expect(setLength(z, 1, 300).sections).toEqual([125, 300, 131]);
  });

  it('flips a bend', () => {
    expect(flip(z, 0).turns).toEqual(['left', 'left']);
  });

  it('toggles the measured face', () => {
    expect(toggleFace(z, 1).faces).toEqual(['outside', 'inside', 'outside']);
  });

  it('adds a bend opposite to the previous one', () => {
    expect(addBend(z)).toEqual({
      sections: [125, 206, 131, 100],
      turns: ['right', 'left', 'right'],
      faces: ['outside', 'outside', 'outside', 'outside'],
    });
  });

  it('stops adding at the maximum', () => {
    let s = z;
    for (let i = 0; i < 10; i++) s = addBend(s);
    expect(s.turns).toHaveLength(MAX_BENDS);
  });

  it('removes a bend with the section after it', () => {
    const s = toggleFace(z, 2);
    expect(removeBend(s, 0)).toEqual({ sections: [125, 131], turns: ['left'], faces: ['outside', 'inside'] });
  });

  it('keeps at least one bend', () => {
    const l: Shape = { sections: [100, 200], turns: ['right'], faces: ['outside', 'outside'] };
    expect(removeBend(l, 0)).toBe(l);
  });
});
