import { useState, useEffect } from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';
type Unit = 'px' | 'cm' | 'inch';

interface ControlsProps {
  activeSides: Set<Position>;
  onToggleSide: (side: Position) => void;
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  guidelinesEnabled: boolean;
  onToggleGuidelines: () => void;
}

const sides: Position[] = ['top', 'bottom', 'left', 'right'];
const units: Unit[] = ['px', 'cm', 'inch'];

export default function Controls({
  activeSides,
  onToggleSide,
  unit,
  onUnitChange,
  darkMode,
  onToggleDarkMode,
  guidelinesEnabled,
  onToggleGuidelines,
}: ControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [fs, setFs] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const update = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  const btnBase = (active: boolean): React.CSSProperties => ({
    padding: isMobile ? '4px 8px' : '6px 12px',
    fontSize: isMobile ? '11px' : '12px',
    fontFamily: 'inherit',
    background: active
      ? (darkMode ? '#ffffff' : '#000000')
      : 'transparent',
    color: active
      ? (darkMode ? '#000000' : '#ffffff')
      : (darkMode ? '#ffffff' : '#000000'),
    border: `1px solid ${darkMode ? '#ffffff' : '#000000'}`,
    cursor: 'pointer',
    borderRadius: '3px',
    transition: 'all 0.15s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 500,
    lineHeight: 1,
  });

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 2000,
    background: darkMode ? 'rgba(17,17,17,0.95)' : 'rgba(240,240,240,0.95)',
    border: `1px solid ${darkMode ? '#333' : '#ccc'}`,
    borderRadius: '8px',
    padding: isMobile ? '12px' : '16px',
    display: isMobile || hidden ? 'none' : 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: '200px',
    userSelect: 'none',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: darkMode ? '#888' : '#666',
    fontWeight: 600,
  };

  const groupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  };

  const toggleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  };

  const toggleStyle = (on: boolean): React.CSSProperties => ({
    width: '36px',
    height: '20px',
    borderRadius: '10px',
    background: on ? (darkMode ? '#fff' : '#000') : (darkMode ? '#333' : '#ccc'),
    border: `1px solid ${darkMode ? '#555' : '#999'}`,
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
    padding: 0,
    outline: 'none',
  });

  const toggleKnobStyle = (on: boolean): React.CSSProperties => ({
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: on ? (darkMode ? '#000' : '#fff') : (darkMode ? '#888' : '#666'),
    position: 'absolute',
    top: '2px',
    left: on ? '18px' : '2px',
    transition: 'left 0.2s',
  });

  const bottomSheetStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    zIndex: 2000,
    background: darkMode ? 'rgba(17,17,17,0.95)' : 'rgba(240,240,240,0.95)',
    borderTop: `1px solid ${darkMode ? '#333' : '#ccc'}`,
    padding: '10px 12px',
    display: isMobile && !hidden ? 'flex' : 'none',
    flexDirection: 'column',
    gap: '8px',
    userSelect: 'none',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };

  const isFullscreen = fs;

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen not supported
    }
  };

  const toggleBtnStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: isMobile ? '8px' : '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2001,
    background: darkMode ? 'rgba(17,17,17,0.8)' : 'rgba(240,240,240,0.8)',
    border: `1px solid ${darkMode ? '#444' : '#bbb'}`,
    borderRadius: '4px',
    color: darkMode ? '#fff' : '#000',
    cursor: 'pointer',
    fontSize: '10px',
    padding: '4px 10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: 'inherit',
    userSelect: 'none',
  };

  return (
    <>
      <div style={panelStyle}>
        <div style={sectionStyle}>
          <span style={labelStyle}>Edges</span>
          <div style={groupStyle}>
            {sides.map((side) => (
              <button
                key={side}
                onClick={() => onToggleSide(side)}
                style={btnBase(activeSides.has(side))}
              >
                {side}
              </button>
            ))}
          </div>
        </div>

        <div style={sectionStyle}>
          <span style={labelStyle}>Unit</span>
          <div style={groupStyle}>
            {units.map((u) => (
              <button
                key={u}
                onClick={() => onUnitChange(u)}
                style={btnBase(unit === u)}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div style={toggleRowStyle}>
          <span style={labelStyle}>Dark Mode</span>
          <button
            onClick={onToggleDarkMode}
            style={toggleStyle(darkMode)}
            aria-label="Toggle dark mode"
          >
            <div style={toggleKnobStyle(darkMode)} />
          </button>
        </div>
        <div style={toggleRowStyle}>
          <span style={labelStyle}>Fullscreen</span>
          <button
            onClick={toggleFullscreen}
            style={{
              ...btnBase(isFullscreen),
              padding: isMobile ? '2px 8px' : '4px 10px',
              fontSize: isMobile ? '10px' : '11px',
            }}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? 'Exit' : 'Enter'}
          </button>
        </div>
        <div style={toggleRowStyle}>
          <span style={labelStyle}>Guides</span>
          <button
            onClick={onToggleGuidelines}
            style={{
              ...btnBase(guidelinesEnabled),
              padding: isMobile ? '2px 8px' : '4px 10px',
              fontSize: isMobile ? '10px' : '11px',
            }}
            aria-label="Toggle guidelines"
          >
            {guidelinesEnabled ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div style={bottomSheetStyle}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {sides.map((side) => (
            <button
              key={side}
              onClick={() => onToggleSide(side)}
              style={btnBase(activeSides.has(side))}
            >
              {side}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
          {units.map((u) => (
            <button
              key={u}
              onClick={() => onUnitChange(u)}
              style={btnBase(unit === u)}
            >
              {u}
            </button>
          ))}
          <button
            onClick={onToggleDarkMode}
            style={{
              ...btnBase(darkMode),
              marginLeft: '4px',
              padding: isMobile ? '4px 8px' : '6px 12px',
            }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? 'Dark' : 'Light'}
          </button>
          <button
            onClick={onToggleGuidelines}
            style={{
              ...btnBase(guidelinesEnabled),
              marginLeft: '4px',
              padding: isMobile ? '4px 8px' : '6px 12px',
            }}
            aria-label="Toggle guidelines"
          >
            {guidelinesEnabled ? 'Guide' : 'Guide'}
          </button>
        </div>
      </div>

      {!hidden && (
        <button
          onClick={() => setHidden(true)}
          style={toggleBtnStyle}
        >
          Hide
        </button>
      )}

      {hidden && (
        <button
          onClick={() => setHidden(false)}
          style={{
            ...toggleBtnStyle,
            background: darkMode ? 'rgba(17,17,17,0.5)' : 'rgba(240,240,240,0.5)',
          }}
        >
          Show
        </button>
      )}
    </>
  );
}
