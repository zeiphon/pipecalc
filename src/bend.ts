export type Turn = 'left' | 'right';

/** Which face of the bar a section is measured on, relative to its reference bend. */
export type Face = 'outside' | 'inside';

/** A side of the bar relative to the direction of travel. */
export type Side = 'left' | 'right';

export interface BendInput {
  /** Straight section lengths, in order along the piece (turns.length + 1 of them). */
  sections: number[];
  /** Direction of each 90° bend, in order along the piece. */
  turns: Turn[];
  /** Face each section is measured on (default: all outside). See `measuredSide`. */
  faces?: Face[];
  /** Length lost per 90° bend (e.g. 11). */
  loss: number;
  /** Material thickness, used to convert inside-face dimensions to outside ones. */
  thickness: number;
}

export interface BendResult {
  /** Section lengths converted to outside-corner to outside-corner lengths. */
  adjustedSections: number[];
  /** Length to cut the straight stock. */
  cutLength: number;
  /** Position of each bend centre, measured along the cut piece from the first end. */
  marks: number[];
}

/** The outside of a bend is the side it turns away from. */
export const outsideSide = (turn: Turn): Side => (turn === 'right' ? 'left' : 'right');

const otherSide = (side: Side): Side => (side === 'left' ? 'right' : 'left');

/** Section `i` takes its outside/inside from the bend before it (or bend 0 for the first section). */
export const referenceBend = (i: number) => Math.max(i - 1, 0);

/** The side of the bar section `i` is measured on. */
export function measuredSide(turns: Turn[], faces: Face[] | undefined, i: number): Side {
  const side = outsideSide(turns[referenceBend(i)]);
  return faces?.[i] === 'inside' ? otherSide(side) : side;
}

export function calculate({ sections, turns, faces, loss, thickness }: BendInput): BendResult {
  const adjustedSections = sections.map((length, i) => {
    const side = measuredSide(turns, faces, i);
    // Each bend at either end of the section whose outside is on the other face
    // is measured to its inside corner, which is one thickness short.
    const ends = [turns[i - 1], turns[i]].filter((t): t is Turn => t !== undefined);
    return length + ends.filter((t) => outsideSide(t) !== side).length * thickness;
  });

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
