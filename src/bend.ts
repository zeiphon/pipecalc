export type Turn = 'left' | 'right';

export interface BendInput {
  /** Straight section lengths, in order along the piece (turns.length + 1 of them). */
  sections: number[];
  /** Direction of each 90° bend, in order along the piece. */
  turns: Turn[];
  /** Length lost per 90° bend (e.g. 11). */
  loss: number;
  /**
   * Material thickness. A section between two bends that turn opposite ways
   * (a Z/S shape) is measured on one face, but the two bend corners sit on
   * opposite faces, so this is added to that section.
   */
  thickness: number;
}

export interface BendResult {
  /** Section lengths after the thickness correction. */
  adjustedSections: number[];
  /** Length to cut the straight stock. */
  cutLength: number;
  /** Position of each bend centre, measured along the cut piece from the first end. */
  marks: number[];
}

export function calculate({ sections, turns, loss, thickness }: BendInput): BendResult {
  const last = sections.length - 1;
  const adjustedSections = sections.map((length, i) =>
    i > 0 && i < last && turns[i - 1] !== turns[i] ? length + thickness : length,
  );

  const cutLength = adjustedSections.reduce((a, b) => a + b, 0) - turns.length * loss;

  let outside = 0;
  const marks = turns.map((_, i) => {
    outside += adjustedSections[i];
    // Earlier bends have already used up `i` losses; the mark sits half a loss before the corner.
    return outside - i * loss - loss / 2;
  });

  return { adjustedSections, cutLength, marks };
}

export interface Point {
  x: number;
  y: number;
}

/** Corner-to-corner path of the piece in 2D, starting at the origin and heading up. */
export function layout(lengths: number[], turns: Turn[]): Point[] {
  const points: Point[] = [{ x: 0, y: 0 }];
  let dx = 0;
  let dy = -1;
  lengths.forEach((length, i) => {
    const p = points[points.length - 1];
    points.push({ x: p.x + dx * length, y: p.y + dy * length });
    if (i < turns.length) {
      // Screen coordinates (y down): turning left from "up" gives "left".
      [dx, dy] = turns[i] === 'left' ? [dy, -dx] : [-dy, dx];
    }
  });
  return points;
}
