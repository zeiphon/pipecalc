import type { CSSProperties } from 'react';
import { layout, measuredSide, type Face, type Point, type Turn } from './bend';
import { NumberField } from './NumberField';

interface Props {
  /** Lengths as entered (shown and edited on the labels). */
  sections: number[];
  /** Lengths used for the geometry (after thickness correction). */
  drawn: number[];
  turns: Turn[];
  faces: Face[];
  canAdd: boolean;
  onLength: (i: number, length: number) => void;
  onFlip: (i: number) => void;
  onToggleFace: (i: number) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}

/** Shortest drawn section as a fraction of the longest, so short legs stay tappable. */
const MIN_FRACTION = 0.5;
/** Keep the drawing between these height/width ratios so it fits a phone screen. */
const MIN_ASPECT = 0.8;
const MAX_ASPECT = 1.1;

const unit = (a: Point, b: Point): Point => {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
};

/** Unit normal pointing to the given side of travel direction `d` (screen coordinates, y down). */
const toSide = (d: Point, side: 'left' | 'right'): Point =>
  side === 'left' ? { x: d.y, y: -d.x } : { x: -d.y, y: d.x };

export function Diagram({
  sections,
  drawn,
  turns,
  faces,
  canAdd,
  onLength,
  onFlip,
  onToggleFace,
  onRemove,
  onAdd,
}: Props) {
  const longest = Math.max(...drawn.map((l) => (l > 0 ? l : 0)), 1);
  const display = drawn.map((l) => Math.max(l, longest * MIN_FRACTION));
  const toScale = display.every((l, i) => l === drawn[i]);
  const pts = layout(display, turns);

  // Fit the view box around the shape, padded, with a phone-friendly aspect ratio.
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const pad = size * 0.22;
  let vb = {
    x: Math.min(...xs) - pad,
    y: Math.min(...ys) - pad,
    w: Math.max(...xs) - Math.min(...xs) + pad * 2,
    h: Math.max(...ys) - Math.min(...ys) + pad * 2,
  };
  if (vb.h / vb.w < MIN_ASPECT) {
    const h = vb.w * MIN_ASPECT;
    vb = { ...vb, y: vb.y - (h - vb.h) / 2, h };
  } else if (vb.h / vb.w > MAX_ASPECT) {
    const w = vb.h / MAX_ASPECT;
    vb = { ...vb, x: vb.x - (w - vb.w) / 2, w };
  }

  /** Absolutely position an overlay at a drawing point, nudged by a pixel offset. */
  const at = (p: Point, dx = 0, dy = 0): CSSProperties => ({
    left: `${((p.x - vb.x) / vb.w) * 100}%`,
    top: `${((p.y - vb.y) / vb.h) * 100}%`,
    transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px)`,
  });

  const stroke = size / 28;
  const first = unit(pts[0], pts[1]);
  const last = unit(pts[pts.length - 2], pts[pts.length - 1]);
  const end = pts[pts.length - 1];

  return (
    <div className="relative w-full select-none" style={{ aspectRatio: `${vb.w} / ${vb.h}` }}>
      <svg
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className="absolute inset-0 h-full w-full text-sky-600 dark:text-sky-400"
        role="img"
        aria-label="Pipe diagram"
      >
        <polyline
          points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinejoin="round"
          strokeLinecap="butt"
        />
        {pts.slice(0, -1).map((a, i) => {
          // Highlight the face each section is measured on.
          const n = toSide(unit(a, pts[i + 1]), measuredSide(turns, faces, i));
          const o = stroke * 0.55;
          const b = pts[i + 1];
          return (
            <line
              key={i}
              x1={a.x + n.x * o}
              y1={a.y + n.y * o}
              x2={b.x + n.x * o}
              y2={b.y + n.y * o}
              className="stroke-amber-500"
              strokeWidth={stroke * 0.3}
              strokeLinecap="round"
            />
          );
        })}
        <circle cx={pts[0].x} cy={pts[0].y} r={stroke * 0.9} className="fill-slate-500" />
      </svg>

      <span
        className="pointer-events-none absolute text-xs font-medium text-slate-500"
        style={at(pts[0], -first.x * 32, -first.y * 32)}
      >
        Start
      </span>

      {pts.slice(0, -1).map((a, i) => {
        const b = pts[i + 1];
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const d = unit(a, b);
        // Label sits on the face the section is measured on, with its In/Out toggle beside it.
        const n = toSide(d, measuredSide(turns, faces, i));
        const chars = Math.max(String(sections[i]).length, 2);
        const halfWidth = (chars * 10 + 20) / 2;
        const off = { x: n.x * (halfWidth + 14), y: n.y * 30 };
        const along = Math.abs(d.x) * (halfWidth + 28) + Math.abs(d.y) * 42;
        const face = faces[i] ?? 'outside';
        return (
          <div key={`len-${i}`}>
            <button
              type="button"
              onClick={() => onToggleFace(i)}
              aria-label={`Section ${i + 1} measured on the ${face}. Tap to switch.`}
              title="Switch measured face"
              className="absolute grid min-h-8 min-w-11 place-items-center rounded-lg bg-amber-100 px-2.5 text-xs font-bold uppercase leading-none text-amber-800 active:scale-95 dark:bg-amber-900/60 dark:text-amber-200"
              style={at(mid, off.x + d.x * along, off.y + d.y * along)}
            >
              {face === 'outside' ? 'Out' : 'In'}
            </button>
            <div className="absolute" style={at(mid, off.x, off.y)}>
              <NumberField
                value={sections[i]}
                onChange={(v) => onLength(i, v)}
                aria-label={`Section ${i + 1} length (mm)`}
                style={{ width: `calc(${chars}ch + 1.25rem)` }}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base font-semibold tabular-nums text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        );
      })}

      {turns.map((turn, i) => {
        const corner = pts[i + 1];
        const din = unit(pts[i], corner);
        const dout = unit(corner, pts[i + 2]);
        // Outside of the bend's corner, clear of the dimension labels at the section midpoints.
        const outside = unit({ x: 0, y: 0 }, { x: din.x - dout.x, y: din.y - dout.y });
        return (
          <div key={`bend-${i}`}>
            <button
              type="button"
              onClick={() => onFlip(i)}
              aria-label={`Bend ${i + 1}, turns ${turn}. Tap to flip.`}
              title="Tap to flip direction"
              className="absolute grid size-10 place-items-center rounded-full border-2 border-sky-600 bg-white text-sm font-bold text-sky-700 shadow active:scale-95 dark:border-sky-400 dark:bg-slate-900 dark:text-sky-300"
              style={at(corner)}
            >
              {i + 1}
            </button>
            {turns.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remove bend ${i + 1}`}
                className="absolute grid size-7 place-items-center rounded-full bg-slate-200 text-base leading-none text-slate-600 active:scale-95 dark:bg-slate-700 dark:text-slate-300"
                style={at(corner, outside.x * 34, outside.y * 34)}
              >
                ×
              </button>
            )}
          </div>
        );
      })}

      {canAdd && (
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add a bend at the end"
          className="absolute grid size-10 place-items-center rounded-full border-2 border-dashed border-slate-400 bg-white text-xl leading-none text-slate-600 active:scale-95 dark:bg-slate-900 dark:text-slate-300"
          style={at(end, last.x * 32, last.y * 32)}
        >
          +
        </button>
      )}

      {!toScale && (
        <span className="pointer-events-none absolute left-3 top-2 text-xs text-slate-400">Not to scale</span>
      )}
    </div>
  );
}
