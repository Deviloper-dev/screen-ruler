import { useEffect, useRef } from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';
type Unit = 'px' | 'cm' | 'inch';

interface Tick {
  offset: number;
  label: string | null;
  isMajor: boolean;
  isMedium: boolean;
}

interface RulerCanvasProps {
  position: Position;
  unit: Unit;
  darkMode: boolean;
  visible: boolean;
  ppi: number;
}

const BASE_RULER_SIZE = 36;
const BASE_TICK_MAJOR = 18;
const BASE_TICK_MEDIUM = 11;
const BASE_TICK_MINOR = 7;
const BASE_FONT_SIZE = 9;

function generateTicks(length: number, unit: Unit, ppi: number): Tick[] {
  const ticks: Tick[] = [];

  switch (unit) {
    case 'px': {
      for (let px = 0; px <= length; px += 10) {
        const isMajor = px % 100 === 0;
        const isMedium = px % 50 === 0 && !isMajor;
        ticks.push({ offset: px, label: isMajor ? String(px) : null, isMajor, isMedium });
      }
      break;
    }
    case 'cm': {
      // ppi/25.4 = CSS pixels per mm (25.4mm per inch)
      const pxPerMm = ppi / 25.4;
      for (let mm = 0; ; mm++) {
        const offset = mm * pxPerMm;
        if (offset > length) break;
        const isMajor = mm % 10 === 0;
        const isMedium = mm % 5 === 0 && !isMajor;
        ticks.push({ offset, label: isMajor ? String(mm / 10) : null, isMajor, isMedium });
      }
      break;
    }
    case 'inch': {
      // ppi/16 = CSS pixels per 1/16 inch
      const pxPerSixteenth = ppi / 16;
      for (let sixt = 0; ; sixt++) {
        const offset = sixt * pxPerSixteenth;
        if (offset > length) break;
        const isMajor = sixt % 16 === 0;
        const isMedium = sixt % 4 === 0 && !isMajor;
        ticks.push({ offset, label: isMajor ? String(sixt / 16) : null, isMajor, isMedium });
      }
      break;
    }
  }

  return ticks;
}

function drawRuler(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  position: Position,
  unit: Unit,
  darkMode: boolean,
  dpr: number,
  zoom: number,
  ppi: number,
) {
  const fg = darkMode ? '#ffffff' : '#000000';
  const bg = darkMode ? '#000000' : '#ffffff';
  const dim = darkMode ? '#888888' : '#aaaaaa';

  const isHorizontal = position === 'top' || position === 'bottom';
  const length = isHorizontal ? width : height;

  const rulerSize = Math.max(12, Math.round(BASE_RULER_SIZE / zoom));
  const tickMajor = Math.max(5, Math.round(BASE_TICK_MAJOR / zoom));
  const tickMedium = Math.max(4, Math.round(BASE_TICK_MEDIUM / zoom));
  const tickMinor = Math.max(3, Math.round(BASE_TICK_MINOR / zoom));
  const fontSize = Math.max(5, Math.round(BASE_FONT_SIZE / zoom));

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = fg;
  ctx.lineWidth = Math.max(1, 1 / dpr * 2);
  ctx.beginPath();

  if (isHorizontal) {
    const lineY = position === 'top' ? Math.max(0.5, 1 / dpr) : rulerSize - Math.max(0.5, 1 / dpr);
    ctx.moveTo(0, lineY);
    ctx.lineTo(length, lineY);
  } else {
    const lineX = position === 'left' ? Math.max(0.5, 1 / dpr) : rulerSize - Math.max(0.5, 1 / dpr);
    ctx.moveTo(lineX, 0);
    ctx.lineTo(lineX, length);
  }
  ctx.stroke();

  const ticks = generateTicks(length, unit, ppi);
  const tickOffset = Math.max(2, Math.round(3 / zoom));

  for (const tick of ticks) {
    const offset = tick.offset;
    const tickLen = tick.isMajor ? tickMajor : tick.isMedium ? tickMedium : tickMinor;

    ctx.strokeStyle = tick.isMajor || tick.isMedium ? fg : dim;
    ctx.lineWidth = Math.max(0.5, 1 / dpr);
    ctx.beginPath();

    if (isHorizontal) {
      if (position === 'top') {
        ctx.moveTo(offset, tickOffset);
        ctx.lineTo(offset, tickOffset + tickLen);
      } else {
        ctx.moveTo(offset, rulerSize - tickOffset);
        ctx.lineTo(offset, rulerSize - tickOffset - tickLen);
      }
    } else {
      if (position === 'left') {
        ctx.moveTo(tickOffset, offset);
        ctx.lineTo(tickOffset + tickLen, offset);
      } else {
        ctx.moveTo(rulerSize - tickOffset, offset);
        ctx.lineTo(rulerSize - tickOffset - tickLen, offset);
      }
    }
    ctx.stroke();

    if (tick.label !== null) {
      ctx.fillStyle = fg;
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, SFMono-Regular, Consolas, monospace`;
      ctx.textAlign = 'center';

      if (isHorizontal) {
        ctx.textBaseline = 'top';
        const labelY = position === 'top'
          ? Math.round(tickOffset + tickMajor + Math.max(2, Math.round(2 / zoom)))
          : Math.round(Math.max(2, Math.round(2 / zoom)));
        ctx.fillText(tick.label, offset, labelY);
      } else {
        ctx.textBaseline = 'middle';
        ctx.save();
        if (position === 'left') {
          ctx.translate(Math.round(tickOffset + tickMajor + Math.max(2, Math.round(2 / zoom))), offset);
          ctx.rotate(-Math.PI / 2);
        } else {
          ctx.translate(Math.round(rulerSize - tickOffset - tickMajor - Math.max(2, Math.round(2 / zoom))), offset);
          ctx.rotate(Math.PI / 2);
        }
        ctx.fillText(tick.label, 0, 0);
        ctx.restore();
      }
    }
  }
}

export default function RulerCanvas({ position, unit, darkMode, visible, ppi }: RulerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseDprRef = useRef(0);

  useEffect(() => {
    if (!visible) return;

    if (baseDprRef.current === 0) {
      baseDprRef.current = window.devicePixelRatio || 1;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number | null = null;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const baseDpr = baseDprRef.current;
      const zoom = dpr / baseDpr;
      const rulerSize = Math.max(12, Math.round(BASE_RULER_SIZE / zoom));
      const isHorizontal = position === 'top' || position === 'bottom';

      const width = isHorizontal ? window.innerWidth : rulerSize;
      const height = isHorizontal ? rulerSize : window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawRuler(ctx, width, height, position, unit, darkMode, dpr, zoom, ppi);
    };

    const scheduleDraw = () => {
      if (animationId !== null) cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(draw);
    };

    scheduleDraw();

    const handleResize = () => scheduleDraw();
    window.addEventListener('resize', handleResize);

    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mq.addEventListener('change', handleResize);
    } catch {
      // matchMedia not available
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      mq?.removeEventListener('change', handleResize);
      if (animationId !== null) cancelAnimationFrame(animationId);
    };
  }, [position, unit, darkMode, visible, ppi]);

  if (!visible) return null;

  const isHorizontal = position === 'top' || position === 'bottom';

  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1000,
    pointerEvents: 'none',
    touchAction: 'none',
  };

  const size = BASE_RULER_SIZE;
  if (isHorizontal) {
    style.left = '0';
    style.right = '0';
    style.height = `${size}px`;
    if (position === 'top') style.top = '0';
    else style.bottom = '0';
  } else {
    style.top = '0';
    style.bottom = '0';
    style.width = `${size}px`;
    if (position === 'left') style.left = '0';
    else style.right = '0';
  }

  return <canvas ref={canvasRef} style={style} />;
}
