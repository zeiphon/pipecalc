import type { Face, Turn } from './bend';

export const MAX_BENDS = 4;
export const NEW_SECTION_LENGTH = 100;

export interface Shape {
  sections: number[];
  turns: Turn[];
  faces: Face[];
}

const flipTurn = (t: Turn): Turn => (t === 'left' ? 'right' : 'left');

export function setLength(shape: Shape, i: number, length: number): Shape {
  return { ...shape, sections: shape.sections.map((l, j) => (j === i ? length : l)) };
}

export function toggleFace(shape: Shape, i: number): Shape {
  return {
    ...shape,
    faces: shape.faces.map((f, j) => (j === i ? (f === 'outside' ? 'inside' : 'outside') : f)),
  };
}

export function flip(shape: Shape, i: number): Shape {
  return { ...shape, turns: shape.turns.map((t, j) => (j === i ? flipTurn(t) : t)) };
}

/** Adds a bend at the free end. It turns opposite to the previous bend, giving a Z by default. */
export function addBend(shape: Shape): Shape {
  if (shape.turns.length >= MAX_BENDS) return shape;
  const prev = shape.turns[shape.turns.length - 1];
  return {
    sections: [...shape.sections, NEW_SECTION_LENGTH],
    turns: [...shape.turns, prev ? flipTurn(prev) : 'right'],
    faces: [...shape.faces, 'outside'],
  };
}

/** Removes bend `i` together with the section after it. */
export function removeBend(shape: Shape, i: number): Shape {
  if (shape.turns.length <= 1) return shape;
  return {
    sections: shape.sections.filter((_, j) => j !== i + 1),
    turns: shape.turns.filter((_, j) => j !== i),
    faces: shape.faces.filter((_, j) => j !== i + 1),
  };
}
