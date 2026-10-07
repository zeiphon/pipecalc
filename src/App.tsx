import { useState } from 'react';
import { calculate, type Turn } from './bend';
import { Diagram } from './Diagram';

const MAX_BENDS = 4;

const fmt = (n: number) => String(Math.round(n * 100) / 100);

export function App() {
  const [loss, setLoss] = useState(11);
  const [thickness, setThickness] = useState(6);
  const [bends, setBends] = useState(2);
  const [lengths, setLengths] = useState<number[]>([125, 206, 131, 100, 100]);
  const [turns, setTurns] = useState<Turn[]>(['right', 'left', 'right', 'left']);

  const sections = lengths.slice(0, bends + 1);
  const activeTurns = turns.slice(0, bends);
  const result = calculate({ sections, turns: activeTurns, loss, thickness });

  const setAt = <T,>(list: T[], i: number, v: T) => list.map((x, j) => (j === i ? v : x));

  return (
    <main>
      <h1>Pipecalc</h1>

      <section className="settings">
        <label>
          Loss per 90° bend (mm)
          <input type="number" value={loss} onChange={(e) => setLoss(Number(e.target.value))} />
        </label>
        <label>
          Material thickness (mm)
          <input type="number" value={thickness} onChange={(e) => setThickness(Number(e.target.value))} />
        </label>
        <label>
          Number of bends
          <select value={bends} onChange={(e) => setBends(Number(e.target.value))}>
            {Array.from({ length: MAX_BENDS }, (_, i) => i + 1).map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="rows">
        {sections.map((length, i) => (
          <div key={i} className="row-group">
            <label>
              Section {i + 1} (mm)
              <input
                type="number"
                value={length}
                onChange={(e) => setLengths(setAt(lengths, i, Number(e.target.value)))}
              />
            </label>
            {i < bends && (
              <label>
                Bend {i + 1}
                <select
                  value={turns[i]}
                  onChange={(e) => setTurns(setAt(turns, i, e.target.value as Turn))}
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </label>
            )}
          </div>
        ))}
      </section>

      <Diagram sections={sections} drawn={result.adjustedSections} turns={activeTurns} />

      <section className="result">
        <p>
          Cut length: <strong>{fmt(result.cutLength)} mm</strong>
        </p>
        <table>
          <thead>
            <tr>
              <th>Bend</th>
              <th>Mark from first end (mm)</th>
            </tr>
          </thead>
          <tbody>
            {result.marks.map((m, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{fmt(m)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
