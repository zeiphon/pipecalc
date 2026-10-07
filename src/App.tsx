import { useEffect, useState } from 'react';
import { calculate } from './bend';
import { Diagram } from './Diagram';
import { NumberField } from './NumberField';
import { addBend, flip, MAX_BENDS, removeBend, setLength, toggleFace, type Shape } from './shape';

interface State extends Shape {
  loss: number;
  thickness: number;
}

const EXAMPLE: State = {
  sections: [125, 206, 131],
  turns: ['right', 'left'],
  faces: ['outside', 'outside', 'outside'],
  loss: 11,
  thickness: 6,
};
const STORAGE_KEY = 'pipecalc:v1';

function load(): State {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as State | null;
    if (saved && saved.sections.length === saved.turns.length + 1) {
      // Shapes saved before faces existed were all measured on the outside.
      return { ...saved, faces: saved.faces ?? saved.sections.map(() => 'outside') };
    }
  } catch {
    // Fall back to the example when storage is unavailable or corrupt.
  }
  return EXAMPLE;
}

const fmt = (n: number) => String(Math.round(n * 100) / 100);

const card = 'rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800';
const field =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base tabular-nums focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-800';

export function App() {
  const [state, setState] = useState<State>(load);
  const { sections, turns, faces, loss, thickness } = state;
  const result = calculate(state);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Remembering the last shape is a convenience only.
    }
  }, [state]);

  const edit = (f: (s: Shape) => Shape) => setState((s) => ({ ...s, ...f(s) }));

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto grid max-w-xl gap-4 px-4 py-4 sm:py-8">
        <header className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold tracking-tight">Pipecalc</h1>
          <button
            type="button"
            onClick={() => setState(EXAMPLE)}
            className="text-sm text-slate-500 underline-offset-2 hover:underline"
          >
            Reset
          </button>
        </header>

        <section className={`${card} p-2`}>
          <Diagram
            sections={sections}
            drawn={result.adjustedSections}
            turns={turns}
            faces={faces}
            canAdd={turns.length < MAX_BENDS}
            onLength={(i, v) => edit((s) => setLength(s, i, v))}
            onFlip={(i) => edit((s) => flip(s, i))}
            onToggleFace={(i) => edit((s) => toggleFace(s, i))}
            onRemove={(i) => edit((s) => removeBend(s, i))}
            onAdd={() => edit(addBend)}
          />
          <p className="px-2 pb-1 text-center text-xs text-slate-500">
            Tap a length to edit · <span className="font-semibold text-amber-700 dark:text-amber-300">Out/In</span>{' '}
            picks the measured face · tap a bend to flip · <span aria-hidden>+</span> adds a bend
          </p>
        </section>

        <section className={card} aria-live="polite">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-slate-500">Cut length</span>
            <span className="text-4xl font-bold tabular-nums">
              {fmt(result.cutLength)}
              <span className="ml-1 text-lg font-medium text-slate-500">mm</span>
            </span>
          </div>
          {result.cutLength <= 0 && (
            <p className="mt-2 text-sm text-red-600">The sections are too short for this many bends.</p>
          )}
          <h2 className="mt-4 text-sm font-medium text-slate-500">Bend marks, from the start end</h2>
          <ol className="mt-2 grid grid-cols-2 gap-2">
            {result.marks.map((m, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
                <span className="grid size-6 place-items-center rounded-full border-2 border-sky-600 text-xs font-bold text-sky-700 dark:border-sky-400 dark:text-sky-300">
                  {i + 1}
                </span>
                <span className="text-lg font-semibold tabular-nums">{fmt(m)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${card} grid grid-cols-2 gap-3`}>
          <label className="grid gap-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            Loss per bend (mm)
            <NumberField
              value={loss}
              onChange={(v) => setState((s) => ({ ...s, loss: v }))}
              allowNonPositive
              className={field}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            Thickness (mm)
            <NumberField
              value={thickness}
              onChange={(v) => setState((s) => ({ ...s, thickness: v }))}
              allowNonPositive
              className={field}
            />
          </label>
          <p className="col-span-2 text-xs text-slate-500">
            Thickness converts dimensions measured to an inside face into outside ones. The middle of a Z is always
            inside at one end.
          </p>
        </section>

        <details className={card}>
          <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400">
            Edit as a list
          </summary>
          <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
            {sections.map((length, i) => (
              <div key={i} className="col-span-3 grid grid-cols-subgrid items-end">
                <label className="grid gap-1 text-sm text-slate-600 dark:text-slate-400">
                  Section {i + 1} (mm)
                  <NumberField value={length} onChange={(v) => edit((s) => setLength(s, i, v))} className={field} />
                </label>
                <button
                  type="button"
                  onClick={() => edit((s) => toggleFace(s, i))}
                  aria-label={`Section ${i + 1} measured on the ${faces[i]}. Tap to switch.`}
                  className="h-[46px] min-w-14 rounded-lg bg-amber-100 px-2 text-sm font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                >
                  {faces[i] === 'outside' ? 'Out' : 'In'}
                </button>
                {i < turns.length ? (
                  <button
                    type="button"
                    onClick={() => edit((s) => flip(s, i))}
                    className="h-[46px] min-w-24 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-600"
                  >
                    Bend {i + 1}: {turns[i] === 'left' ? 'Left' : 'Right'}
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
        </details>
      </main>
    </div>
  );
}
