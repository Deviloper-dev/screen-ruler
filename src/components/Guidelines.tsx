import { useState, useEffect, useCallback } from 'react';

type Unit = 'px' | 'cm' | 'inch';

interface Marker {
  x: number;
  y: number;
  id: number;
}

interface GuidelinesProps {
  unit: Unit;
  darkMode: boolean;
  enabled: boolean;
  ppi: number;
}

function formatCoord(value: number, unit: Unit, ppi: number): string {
  switch (unit) {
    case 'px':
      return String(Math.round(value));
    case 'cm':
      return (value / (ppi / 2.54)).toFixed(1);
    case 'inch':
      return (value / ppi).toFixed(2);
  }
}

export default function Guidelines({ unit, darkMode, enabled, ppi }: GuidelinesProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    setMarkers([]);
    setActive(false);

    const move = (e: MouseEvent | TouchEvent) => {
      let x: number, y: number;
      if ('touches' in e) {
        if (e.touches.length === 0) return;
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }
      setPos({ x, y });
      setActive(true);
    };

    const leave = () => setActive(false);

    const click = (e: MouseEvent) => {
      setMarkers((prev) => [...prev, { x: e.clientX, y: e.clientY, id: Date.now() }]);
    };

    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMarkers([]);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    document.addEventListener('click', click);
    document.addEventListener('keydown', keydown);
    document.addEventListener('touchmove', move, { passive: true });
    document.addEventListener('touchstart', move, { passive: true });

    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('click', click);
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchstart', move);
    };
  }, [enabled]);

  const clear = useCallback(() => setMarkers([]), []);

  if (!enabled) return null;

  const fg = darkMode ? '#ffffff' : '#000000';
  const dim = darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';
  const markerDim = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';

  return (
    <>
      {active && (
        <div
          style={{
            position: 'fixed',
            left: pos.x,
            top: 0,
            width: '1px',
            height: '100vh',
            background: dim,
            zIndex: 3000,
            pointerEvents: 'none',
          }}
        />
      )}
      {active && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: pos.y,
            width: '100vw',
            height: '1px',
            background: dim,
            zIndex: 3000,
            pointerEvents: 'none',
          }}
        />
      )}
      {active && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(pos.x + 16, window.innerWidth - 200),
            top: Math.min(pos.y + 20, window.innerHeight - 48),
            zIndex: 3001,
            background: darkMode ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)',
            border: `1px solid ${darkMode ? '#555' : '#999'}`,
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '11px',
            color: fg,
            fontFamily: 'SFMono-Regular, Consolas, monospace',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            lineHeight: 1.4,
          }}
        >
          X: {formatCoord(pos.x, unit, ppi)} {unit}&nbsp;&nbsp;Y: {formatCoord(pos.y, unit, ppi)} {unit}
        </div>
      )}
      {markers.map((m) => (
        <div key={m.id}>
          <div
            style={{
              position: 'fixed',
              left: m.x,
              top: 0,
              width: '1px',
              height: '100vh',
              background: markerDim,
              zIndex: 3000,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: m.y,
              width: '100vw',
              height: '1px',
              background: markerDim,
              zIndex: 3000,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'fixed',
              left: m.x - 10,
              top: m.y - 10,
              width: '20px',
              height: '20px',
              zIndex: 3000,
              pointerEvents: 'none',
            }}
          >
            <svg viewBox="0 0 20 20" width="20" height="20">
              <circle cx="10" cy="10" r="3" fill="none" stroke={fg} strokeWidth="1.5" />
              <circle cx="10" cy="10" r="1" fill={fg} />
            </svg>
          </div>
        </div>
      ))}
      {markers.length > 0 && (
        <button
          onClick={clear}
          style={{
            position: 'fixed',
            bottom: '56px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3001,
            background: darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${darkMode ? '#555' : '#999'}`,
            borderRadius: '4px',
            color: fg,
            cursor: 'pointer',
            fontSize: '10px',
            padding: '3px 10px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontFamily: 'inherit',
            lineHeight: 1.4,
          }}
        >
          Clear ({markers.length})
        </button>
      )}
    </>
  );
}
