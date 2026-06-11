import { useState, useCallback, useEffect } from 'react';
import RulerCanvas from './RulerCanvas';
import Controls from './Controls';
import Guidelines from './Guidelines';

type Position = 'top' | 'bottom' | 'left' | 'right';
type Unit = 'px' | 'cm' | 'inch';

const allSides: Position[] = ['top', 'bottom', 'left', 'right'];
const PPI_KEY = 'ruler-ppi';

export default function RulerApp() {
  const [activeSides, setActiveSides] = useState<Set<Position>>(
    new Set(['top', 'left']),
  );
  const [unit, setUnit] = useState<Unit>('px');
  const [darkMode, setDarkMode] = useState(true);
  const [guidelinesEnabled, setGuidelinesEnabled] = useState(false);
  const [ppi, setPpi] = useState(96);

  useEffect(() => {
    const stored = localStorage.getItem(PPI_KEY);
    if (stored) {
      const val = Number(stored);
      if (val >= 50 && val <= 600) setPpi(val);
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = darkMode ? 'dark-theme' : 'light-theme';
  }, [darkMode]);

  const handleSetPpi = useCallback((value: number) => {
    setPpi(value);
    localStorage.setItem(PPI_KEY, String(value));
  }, []);

  const toggleSide = useCallback((side: Position) => {
    setActiveSides((prev) => {
      const next = new Set(prev);
      if (next.has(side)) next.delete(side);
      else next.add(side);
      return next;
    });
  }, []);

  return (
    <>
      {allSides.map((side) => (
        <RulerCanvas
          key={side}
          position={side}
          unit={unit}
          darkMode={darkMode}
          visible={activeSides.has(side)}
          ppi={ppi}
        />
      ))}
      <Controls
        activeSides={activeSides}
        onToggleSide={toggleSide}
        unit={unit}
        onUnitChange={setUnit}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((p) => !p)}
        guidelinesEnabled={guidelinesEnabled}
        onToggleGuidelines={() => setGuidelinesEnabled((p) => !p)}
        ppi={ppi}
        onSetPpi={handleSetPpi}
      />
      <Guidelines
        unit={unit}
        darkMode={darkMode}
        enabled={guidelinesEnabled}
        ppi={ppi}
      />
      <div
        id="ad-space"
        style={{
          position: 'fixed',
          top: 'calc(50% + 70px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1500,
          background: darkMode ? '#111' : '#f0f0f0',
          border: `1px solid ${darkMode ? '#333' : '#ccc'}`,
          borderRadius: '4px',
          padding: '8px 48px',
          fontSize: '10px',
          color: darkMode ? '#666' : '#999',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        Ad Space
      </div>
    </>
  );
}
