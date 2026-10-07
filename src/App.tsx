import { useState } from 'react';
import { arcLength } from './bend';

export function App() {
  const [angle, setAngle] = useState(90);
  const [radius, setRadius] = useState(100);

  return (
    <main>
      <h1>Pipecalc</h1>
      <label>
        Bend angle (°)
        <input type="number" value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
      </label>
      <label>
        Centerline radius (mm)
        <input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
      </label>
      <p>
        Arc length: <strong>{arcLength(angle, radius).toFixed(2)} mm</strong>
      </p>
    </main>
  );
}
