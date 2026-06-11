import { useState, useEffect, useRef } from 'react';

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
  ppi: number;
  onSetPpi: (ppi: number) => void;
}

// ISO 7810 ID-1 credit card dimensions
const CARD_MM_W = 85.6;
const CARD_MM_H = 54;
const CARD_ASPECT = CARD_MM_H / CARD_MM_W;

// Physical PPI per device. CSS PPI = physicalPpi / window.devicePixelRatio at runtime.
const DEVICE_LIST: { group: string; name: string; ppi: number }[] = [
  // MacBook — Apple-stated PPI values
  { group: 'MacBook', name: 'MacBook Air 13″ (M1)', ppi: 227 },
  { group: 'MacBook', name: 'MacBook Air 13″ (M2 / M3)', ppi: 224 },
  { group: 'MacBook', name: 'MacBook Air 15″ (M2 / M3)', ppi: 224 },
  { group: 'MacBook', name: 'MacBook Pro 13″', ppi: 227 },
  { group: 'MacBook', name: 'MacBook Pro 14″ (M1+)', ppi: 254 },
  { group: 'MacBook', name: 'MacBook Pro 16″ (M1+)', ppi: 254 },
  // iMac / Apple displays
  { group: 'iMac / Apple Display', name: 'iMac 24″ (M1+)', ppi: 218 },
  { group: 'iMac / Apple Display', name: 'iMac 27″ (5K)', ppi: 218 },
  { group: 'iMac / Apple Display', name: 'Apple Studio Display 27″', ppi: 218 },
  { group: 'iMac / Apple Display', name: 'Apple Pro Display XDR 32″', ppi: 218 },
  // iPad
  { group: 'iPad', name: 'iPad Pro 11″', ppi: 264 },
  { group: 'iPad', name: 'iPad Pro 12.9″', ppi: 264 },
  { group: 'iPad', name: 'iPad Air 11″ (M2)', ppi: 264 },
  { group: 'iPad', name: 'iPad Air 13″ (M2)', ppi: 264 },
  { group: 'iPad', name: 'iPad mini 6 (8.3″)', ppi: 326 },
  { group: 'iPad', name: 'iPad (10th gen, 10.9″)', ppi: 264 },
  // iPhone 17 — estimated; Apple has kept 460 PPI on all OLED iPhones since iPhone 12
  { group: 'iPhone', name: 'iPhone 17 Air (est.)', ppi: 460 },
  { group: 'iPhone', name: 'iPhone 17 (est.)', ppi: 460 },
  { group: 'iPhone', name: 'iPhone 17 Pro (est.)', ppi: 460 },
  { group: 'iPhone', name: 'iPhone 17 Pro Max (est.)', ppi: 460 },
  // iPhone 16 — Apple-confirmed 460 PPI across all variants
  { group: 'iPhone', name: 'iPhone 16 (6.1″)', ppi: 460 },
  { group: 'iPhone', name: 'iPhone 16 Plus (6.7″)', ppi: 460 },
  { group: 'iPhone', name: 'iPhone 16 Pro (6.3″)', ppi: 460 },
  { group: 'iPhone', name: 'iPhone 16 Pro Max (6.9″)', ppi: 460 },
  // iPhone 12–15
  { group: 'iPhone', name: 'iPhone 12 / 13 / 14 / 15 (standard & Plus)', ppi: 460 },
  { group: 'iPhone', name: 'iPhone 12 / 13 / 14 / 15 Pro & Pro Max', ppi: 460 },
  { group: 'iPhone', name: 'iPhone 12 mini / 13 mini', ppi: 476 },
  { group: 'iPhone', name: 'iPhone 11 Pro / 11 Pro Max', ppi: 458 },
  { group: 'iPhone', name: 'iPhone 11 / XR', ppi: 326 },
  { group: 'iPhone', name: 'iPhone SE (2nd / 3rd gen)', ppi: 326 },
  // Samsung Galaxy phones — manufacturer-stated PPI
  { group: 'Samsung Galaxy', name: 'Galaxy S24 Ultra (6.8″)', ppi: 505 },
  { group: 'Samsung Galaxy', name: 'Galaxy S24+ (6.7″)', ppi: 505 },
  { group: 'Samsung Galaxy', name: 'Galaxy S24 (6.2″)', ppi: 416 },
  { group: 'Samsung Galaxy', name: 'Galaxy S23 Ultra (6.8″)', ppi: 500 },
  { group: 'Samsung Galaxy', name: 'Galaxy S23+ (6.6″)', ppi: 393 },
  { group: 'Samsung Galaxy', name: 'Galaxy S23 (6.1″)', ppi: 425 },
  { group: 'Samsung Galaxy', name: 'Galaxy S22 Ultra (6.8″)', ppi: 500 },
  { group: 'Samsung Galaxy', name: 'Galaxy S22+ / S22 (6.6″ / 6.1″)', ppi: 393 },
  { group: 'Samsung Galaxy', name: 'Galaxy A55 (6.6″)', ppi: 390 },
  { group: 'Samsung Galaxy', name: 'Galaxy A35 (6.6″)', ppi: 390 },
  // Google Pixel phones
  { group: 'Google Pixel', name: 'Pixel 9 Pro XL (6.8″)', ppi: 486 },
  { group: 'Google Pixel', name: 'Pixel 9 / 9 Pro (6.3″)', ppi: 422 },
  { group: 'Google Pixel', name: 'Pixel 8 Pro (6.7″)', ppi: 489 },
  { group: 'Google Pixel', name: 'Pixel 8 / 8a (6.2″)', ppi: 428 },
  { group: 'Google Pixel', name: 'Pixel 7 Pro (6.7″)', ppi: 512 },
  { group: 'Google Pixel', name: 'Pixel 7 / 7a (6.3″)', ppi: 429 },
  // Other Android phones
  { group: 'Other Android', name: 'OnePlus 12 (6.82″)', ppi: 510 },
  { group: 'Other Android', name: 'OnePlus 12R (6.78″)', ppi: 450 },
  { group: 'Other Android', name: 'Xiaomi 14 Ultra (6.73″)', ppi: 522 },
  { group: 'Other Android', name: 'Xiaomi 14 (6.36″)', ppi: 460 },
  // Samsung Galaxy tablets
  { group: 'Android Tablet', name: 'Galaxy Tab S9 Ultra (14.6″)', ppi: 240 },
  { group: 'Android Tablet', name: 'Galaxy Tab S9+ (12.4″)', ppi: 266 },
  { group: 'Android Tablet', name: 'Galaxy Tab S9 (11″)', ppi: 274 },
  { group: 'Android Tablet', name: 'Galaxy Tab S9 FE (10.9″)', ppi: 249 },
  { group: 'Android Tablet', name: 'Google Pixel Tablet (10.95″)', ppi: 276 },
  // Windows laptops
  { group: 'Windows Laptop', name: 'Dell XPS 13 (FHD, 13.4″)', ppi: 169 },
  { group: 'Windows Laptop', name: 'Dell XPS 13 (OLED 2.8K, 13.4″)', ppi: 253 },
  { group: 'Windows Laptop', name: 'Dell XPS 15 (OLED 3.5K, 15.6″)', ppi: 261 },
  { group: 'Windows Laptop', name: 'Surface Pro 9 / 10 (13″)', ppi: 267 },
  { group: 'Windows Laptop', name: 'Surface Laptop 5 (13.5″)', ppi: 201 },
  { group: 'Windows Laptop', name: 'Surface Laptop 5 (15″)', ppi: 200 },
  // Common external monitors (physical PPI ≈ CSS PPI at 100% scaling)
  { group: 'Monitor', name: '24″ 1080p (1920×1080)', ppi: 92 },
  { group: 'Monitor', name: '27″ 1080p (1920×1080)', ppi: 82 },
  { group: 'Monitor', name: '27″ 1440p QHD (2560×1440)', ppi: 109 },
  { group: 'Monitor', name: '27″ 4K (3840×2160)', ppi: 163 },
  { group: 'Monitor', name: '32″ 1440p QHD (2560×1440)', ppi: 92 },
  { group: 'Monitor', name: '32″ 4K (3840×2160)', ppi: 138 },
  { group: 'Monitor', name: '34″ Ultrawide 1440p (3440×1440)', ppi: 110 },
];

const DEVICE_GROUPS = [...new Set(DEVICE_LIST.map((d) => d.group))];

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
  ppi,
  onSetPpi,
}: ControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [fs, setFs] = useState(false);

  const [calibrating, setCalibrating] = useState(false);
  const [calibMethod, setCalibMethod] = useState<'device' | 'diagonal' | 'card'>('device');

  // device lookup method
  const [selectedDevice, setSelectedDevice] = useState('');
  const selectedDeviceEntry = DEVICE_LIST.find((d) => d.name === selectedDevice);
  const deviceCssPpi = selectedDeviceEntry
    ? Math.round(selectedDeviceEntry.ppi / (window.devicePixelRatio || 1))
    : null;

  // diagonal method
  const [diagonal, setDiagonal] = useState('');
  const diagonalPpi = (() => {
    const d = Number(diagonal);
    if (!d || d < 1 || d > 300) return null;
    const w = typeof window !== 'undefined' ? window.screen.width : 1920;
    const h = typeof window !== 'undefined' ? window.screen.height : 1080;
    return Math.round(Math.sqrt(w * w + h * h) / d);
  })();

  // credit card drag method
  const [cardWidth, setCardWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWidth, setDragStartWidth] = useState(0);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const cardPpi = Math.round(cardWidth * 25.4 / CARD_MM_W);

  const openCalibration = () => {
    setCardWidth(Math.round(CARD_MM_W * ppi / 25.4));
    setDiagonal('');
    setSelectedDevice('');
    setCalibMethod('device');
    setCalibrating(true);
  };

  const startDrag = (e: React.PointerEvent) => {
    dragHandleRef.current?.setPointerCapture(e.pointerId);
    setDragging(true);
    setDragStartX(e.clientX);
    setDragStartWidth(cardWidth);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - dragStartX;
    const maxW = window.innerWidth - 80;
    setCardWidth(Math.max(60, Math.min(maxW, dragStartWidth + delta)));
  };

  const stopDrag = () => setDragging(false);

  const applyDevice = () => {
    if (deviceCssPpi && deviceCssPpi >= 50 && deviceCssPpi <= 600) {
      onSetPpi(deviceCssPpi);
      setCalibrating(false);
    }
  };

  const applyDiagonal = () => {
    if (diagonalPpi && diagonalPpi >= 50 && diagonalPpi <= 600) {
      onSetPpi(diagonalPpi);
      setCalibrating(false);
    }
  };

  const applyCard = () => {
    onSetPpi(cardPpi);
    setCalibrating(false);
  };

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

        <div style={toggleRowStyle}>
          <span style={labelStyle}>PPI ({ppi})</span>
          <button
            onClick={openCalibration}
            style={{
              ...btnBase(false),
              padding: isMobile ? '2px 8px' : '4px 10px',
              fontSize: isMobile ? '10px' : '11px',
            }}
          >
            Calibrate
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
          <button
            onClick={openCalibration}
            style={{
              ...btnBase(false),
              marginLeft: '4px',
              padding: isMobile ? '4px 8px' : '6px 12px',
            }}
          >
            PPI
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

      {calibrating && (() => {
        const fg = darkMode ? '#fff' : '#000';
        const muted = darkMode ? '#888' : '#666';
        const inputStyle: React.CSSProperties = {
          padding: '5px 8px',
          fontSize: '13px',
          fontFamily: 'SFMono-Regular, Consolas, monospace',
          background: darkMode ? '#111' : '#f5f5f5',
          color: fg,
          border: `1px solid ${darkMode ? '#444' : '#bbb'}`,
          borderRadius: '3px',
          outline: 'none',
          width: '80px',
        };
        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 5000,
              background: darkMode ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.92)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              padding: '24px',
            }}
          >
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: muted }}>
              Calibrate ruler
            </div>

            {/* Method tabs */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {(['device', 'diagonal', 'card'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setCalibMethod(m)}
                  style={{
                    ...btnBase(calibMethod === m),
                    fontSize: '11px',
                    padding: '4px 14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {m === 'device' ? 'My device' : m === 'diagonal' ? 'Screen size' : 'Credit card'}
                </button>
              ))}
            </div>

            {/* ── Device lookup method ── */}
            {calibMethod === 'device' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '360px', width: '100%' }}>
                <div style={{ fontSize: '13px', color: fg, textAlign: 'center', lineHeight: 1.6 }}>
                  Select your device from the list below.
                </div>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    maxWidth: '320px',
                    padding: '7px 10px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">— Select device —</option>
                  {DEVICE_GROUPS.map((group) => (
                    <optgroup key={group} label={group}>
                      {DEVICE_LIST.filter((d) => d.group === group).map((d) => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {deviceCssPpi && selectedDeviceEntry && (
                  <div style={{ fontSize: '13px', color: fg, fontFamily: 'SFMono-Regular, Consolas, monospace', fontWeight: 600, textAlign: 'center', lineHeight: 1.7 }}>
                    → {deviceCssPpi} CSS PPI
                    <br />
                    <span style={{ fontWeight: 400, color: muted, fontSize: '11px' }}>
                      physical: {selectedDeviceEntry.ppi} PPI · DPR: {window.devicePixelRatio}×
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={applyDevice}
                    disabled={!deviceCssPpi}
                    style={{ ...btnBase(!!deviceCssPpi), fontSize: '12px', padding: '6px 16px', opacity: deviceCssPpi ? 1 : 0.4, cursor: deviceCssPpi ? 'pointer' : 'default' }}
                  >
                    Apply
                  </button>
                  <button onClick={() => setCalibrating(false)} style={{ ...btnBase(false), fontSize: '12px', padding: '6px 16px' }}>
                    Cancel
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: muted, textAlign: 'center' }}>
                  Not in the list? Use <b>Screen size</b> or <b>Credit card</b> above.
                </div>
              </div>
            )}

            {/* ── Screen diagonal method ── */}
            {calibMethod === 'diagonal' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '340px' }}>
                <div style={{ fontSize: '13px', color: fg, textAlign: 'center', lineHeight: 1.6 }}>
                  Enter your screen's diagonal size in inches.<br />
                  <span style={{ fontSize: '11px', color: muted }}>
                    Found in: About This Mac · Display Settings · monitor model name
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={diagonal}
                    onChange={(e) => setDiagonal(e.target.value)}
                    placeholder='e.g. 27'
                    min={1}
                    max={300}
                    step={0.1}
                    style={inputStyle}
                    autoFocus
                  />
                  <span style={{ fontSize: '13px', color: fg }}>inches</span>
                </div>
                {diagonalPpi && (
                  <div style={{ fontSize: '13px', color: fg, fontFamily: 'SFMono-Regular, Consolas, monospace', fontWeight: 600 }}>
                    → {diagonalPpi} PPI
                    <span style={{ fontWeight: 400, color: muted, fontSize: '11px', marginLeft: '6px' }}>
                      ({window.screen.width} × {window.screen.height} px)
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={applyDiagonal}
                    disabled={!diagonalPpi}
                    style={{ ...btnBase(!!diagonalPpi), fontSize: '12px', padding: '6px 16px', opacity: diagonalPpi ? 1 : 0.4, cursor: diagonalPpi ? 'pointer' : 'default' }}
                  >
                    Apply
                  </button>
                  <button onClick={() => setCalibrating(false)} style={{ ...btnBase(false), fontSize: '12px', padding: '6px 16px' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ── Credit card drag method ── */}
            {calibMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '13px', color: fg, textAlign: 'center', maxWidth: '340px', lineHeight: 1.5 }}>
                  Hold a credit card against your screen and drag the right edge until the outline matches.
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div
                    style={{
                      width: cardWidth,
                      height: Math.round(cardWidth * CARD_ASPECT),
                      border: `2px solid ${fg}`,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: muted,
                      fontSize: '11px',
                      fontFamily: 'SFMono-Regular, Consolas, monospace',
                      userSelect: 'none',
                    }}
                  >
                    85.6 × 54 mm
                  </div>
                  <div
                    ref={dragHandleRef}
                    onPointerDown={startDrag}
                    onPointerMove={onPointerMove}
                    onPointerUp={stopDrag}
                    onPointerCancel={stopDrag}
                    style={{
                      position: 'absolute',
                      right: -18,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 28,
                      height: 44,
                      cursor: 'ew-resize',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: fg,
                      color: darkMode ? '#000' : '#fff',
                      borderRadius: '5px',
                      fontSize: '14px',
                      userSelect: 'none',
                      touchAction: 'none',
                    }}
                    role="slider"
                    aria-label="Drag to resize card width"
                  >
                    ⟺
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: fg, fontFamily: 'SFMono-Regular, Consolas, monospace', fontWeight: 600 }}>
                  {cardPpi} PPI
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={applyCard} style={{ ...btnBase(true), fontSize: '12px', padding: '6px 16px' }}>
                    Apply
                  </button>
                  <button onClick={() => setCalibrating(false)} style={{ ...btnBase(false), fontSize: '12px', padding: '6px 16px' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </>
  );
}
