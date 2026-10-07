import { layout, type Turn } from './bend';

interface Props {
  /** Lengths as the user entered them (used for labels). */
  sections: number[];
  /** Lengths used for the geometry. */
  drawn: number[];
  turns: Turn[];
}

const PAD = 48;
const MIN_SIZE = 40;

export function Diagram({ sections, drawn, turns }: Props) {
  const pts = layout(drawn, turns);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(Math.max(...xs) - minX, MIN_SIZE);
  const h = Math.max(Math.max(...ys) - minY, MIN_SIZE);
  const stroke = Math.max(w, h) / 40;
  const font = Math.max(w, h) / 14;
  const pad = Math.max(w, h) / 5 + PAD / 4;

  return (
    <svg
      role="img"
      aria-label="Pipe diagram"
      viewBox={`${minX - pad} ${minY - pad} ${w + pad * 2} ${h + pad * 2}`}
      className="diagram"
    >
      <polyline
        points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinejoin="miter"
      />
      {pts.slice(0, -1).map((a, i) => {
        const b = pts[i + 1];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const horizontal = a.y === b.y;
        return (
          <text
            key={i}
            x={horizontal ? mx : mx + (stroke + font * 0.6)}
            y={horizontal ? my - (stroke + font * 0.4) : my}
            fontSize={font}
            textAnchor={horizontal ? 'middle' : 'start'}
            dominantBaseline="middle"
            fill="currentColor"
          >
            {sections[i]}
          </text>
        );
      })}
    </svg>
  );
}
