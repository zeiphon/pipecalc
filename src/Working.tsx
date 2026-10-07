import type { ReactNode } from 'react';
import type { BendResult, Face } from './bend';

interface Props {
  sections: number[];
  faces: Face[];
  loss: number;
  thickness: number;
  result: BendResult;
}

const fmt = (n: number) => String(Math.round(n * 100) / 100);
const join = (bends: number[]) => bends.map((b) => `bend ${b + 1}`).join(' and ');

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="grid gap-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </li>
  );
}

const sum = 'font-mono text-sm tabular-nums text-slate-800 dark:text-slate-200';
const note = 'text-xs text-slate-500';

/** Step-by-step working for the current shape, for checking the numbers by hand. */
export function Working({ sections, faces, loss, thickness, result }: Props) {
  const { adjustedSections, insideBends, cutLength, marks } = result;
  const total = adjustedSections.reduce((a, b) => a + b, 0);
  const bends = marks.length;

  return (
    <ol className="mt-3 grid list-none gap-4">
      <Step title="1. Convert each dimension to outside corners">
        <p className={note}>
          Every bend corner is taken on its outside face. A dimension measured to an inside corner is one thickness (
          {fmt(thickness)}) short of it, so the thickness is added for each such corner.
        </p>
        <ul className="grid gap-1.5">
          {sections.map((length, i) => {
            const inside = insideBends[i];
            return (
              <li key={i}>
                <div className={sum}>
                  S{i + 1}: {fmt(length)}
                  {inside.map(() => ` + ${fmt(thickness)}`).join('')} = <strong>{fmt(adjustedSections[i])}</strong>
                </div>
                <div className={note}>
                  Measured {faces[i] ?? 'outside'}
                  {inside.length > 0 ? `; inside corner at ${join(inside)}` : '; no correction'}
                </div>
              </li>
            );
          })}
        </ul>
      </Step>

      <Step title="2. Total outside length">
        <div className={sum}>
          {adjustedSections.map(fmt).join(' + ')} = <strong>{fmt(total)}</strong>
        </div>
      </Step>

      <Step title="3. Cut length">
        <p className={note}>Each 90° bend loses {fmt(loss)}.</p>
        <div className={sum}>
          {fmt(total)} − {bends} × {fmt(loss)} = <strong>{fmt(cutLength)}</strong>
        </div>
      </Step>

      <Step title="4. Bend marks (from the start end)">
        <p className={note}>
          Run along the outside lengths to the bend's corner, subtract the loss of every earlier bend, then subtract
          half a loss ({fmt(loss / 2)}) to reach the centre of this bend.
        </p>
        <ul className="grid gap-1.5">
          {marks.map((mark, i) => {
            const run = adjustedSections.slice(0, i + 1);
            const runTotal = run.reduce((a, b) => a + b, 0);
            return (
              <li key={i} className={sum}>
                Bend {i + 1}: {run.length > 1 ? `(${run.map(fmt).join(' + ')})` : fmt(runTotal)}
                {i > 0 && ` − ${i} × ${fmt(loss)}`} − {fmt(loss / 2)} = <strong>{fmt(mark)}</strong>
              </li>
            );
          })}
        </ul>
      </Step>

      <Step title="Check">
        <p className={note}>
          The last section, run back from the far end, should meet the last mark: {fmt(cutLength)} − (
          {fmt(adjustedSections[adjustedSections.length - 1])} − {fmt(loss / 2)}) ={' '}
          {fmt(cutLength - (adjustedSections[adjustedSections.length - 1] - loss / 2))}.
        </p>
      </Step>
    </ol>
  );
}
