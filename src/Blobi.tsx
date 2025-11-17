import { useEffect, useRef, useState } from 'react';

export type EmotionType = 'happy' | 'calm' | 'worried' | 'panic' | 'muted';

interface BlobColors {
  primary: string;
  secondary: string;
  tertiary: string;
}

interface BlobiProps {
  emotion?: EmotionType;
  size?: number;
  className?: string;
  animate?: boolean;
  rollIn?: boolean;
  showZipper?: boolean;
}

const emotionColors: Record<Exclude<EmotionType, 'muted'>, BlobColors> = {
  happy: { primary: '#a78bfa', secondary: '#8b5cf6', tertiary: '#7c3aed' },
  calm: { primary: '#60a5fa', secondary: '#3b82f6', tertiary: '#2563eb' },
  worried: { primary: '#fbbf24', secondary: '#f59e0b', tertiary: '#d97706' },
  panic: { primary: '#f87171', secondary: '#ef4444', tertiary: '#dc2626' },
};

const mouthShapes: Record<Exclude<EmotionType, 'muted'>, string> = {
  happy: 'M35,62 Q50,68 65,62',
  calm: 'M40,65 L60,65',
  worried: 'M35,68 Q50,65 65,68',
  panic: 'M40,62 Q50,68 60,62',
};

export default function Blobi({
  emotion = 'happy',
  size = 80,
  className = '',
  animate = true,
  rollIn = false,
  showZipper = false,
}: BlobiProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [hasRolledIn, setHasRolledIn] = useState(false);

  const actualEmotion = emotion === 'muted' ? 'calm' : emotion;
  const colors = emotionColors[actualEmotion];

  useEffect(() => {
    if (rollIn && !hasRolledIn) {
      setHasRolledIn(true);
    }
  }, [rollIn, hasRolledIn]);

  useEffect(() => {
    if (!animate) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setMousePos({ x: e.clientX - centerX, y: e.clientY - centerY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [animate]);

  useEffect(() => {
    if (!animate) return;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, [animate]);

  const distance = Math.sqrt(mousePos.x ** 2 + mousePos.y ** 2);
  const maxMove = 4;
  const scale = Math.min(maxMove / (distance / 60), 1);
  const irisX = animate ? (mousePos.x / distance) * maxMove * scale : 0;
  const irisY = animate ? (mousePos.y / distance) * maxMove * scale : 0;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size,
        animation: rollIn && hasRolledIn ? 'rollIn 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : undefined,
      }}
    >
      {/* Hero glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.primary}60, transparent 70%)`,
          transform: 'scale(1.8)',
          filter: 'blur(20px)',
          opacity: 0.6,
        }}
      />

      {/* Shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 -z-10"
        style={{
          width: '80%',
          height: size * 0.2,
          background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.4), transparent)',
          filter: 'blur(8px)',
        }}
      />

      {/* Main blob body */}
      <div className="relative w-full h-full">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={`blobGradient-${emotion}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="50%" stopColor={colors.secondary} />
              <stop offset="100%" stopColor={colors.tertiary} />
            </linearGradient>
          </defs>

          {/* Body */}
          <circle cx="50" cy="50" r="42" fill={`url(#blobGradient-${emotion})`} opacity="0.95" />

          {/* Mouth or Zipper */}
          {showZipper || emotion === 'muted' ? (
            <g id="zipperMouth">
              <line x1="35" y1="65" x2="65" y2="65" stroke="rgba(0, 0, 0, 0.4)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="38" y1="63" x2="38" y2="67" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="1.5" />
              <line x1="42" y1="63" x2="42" y2="67" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="1.5" />
              <line x1="46" y1="63" x2="46" y2="67" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="1.5" />
              <line x1="50" y1="63" x2="50" y2="67" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="1.5" />
              <line x1="54" y1="63" x2="54" y2="67" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="1.5" />
              <line x1="58" y1="63" x2="58" y2="67" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="1.5" />
              <line x1="62" y1="63" x2="62" y2="67" stroke="rgba(0, 0, 0, 0.3)" strokeWidth="1.5" />
            </g>
          ) : (
            <path d={mouthShapes[actualEmotion]} fill="none" stroke="rgba(0, 0, 0, 0.25)" strokeWidth="2.5" strokeLinecap="round" />
          )}
        </svg>

        {/* Eye - 35% from top */}
        <div
          className="absolute transition-transform duration-150"
          style={{
            width: size * 0.45,
            height: size * 0.45,
            top: '35%',
            left: '50%',
            transform: `translate(-50%, -50%) ${isBlinking ? 'scaleY(0.1)' : 'scaleY(1)'}`,
          }}
        >
          <div className="w-full h-full rounded-full border-4 border-white/70 flex items-center justify-center bg-white" style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15)' }}>
            <div
              ref={irisRef}
              className="w-[65%] h-[65%] rounded-full relative transition-transform duration-150"
              style={{
                background: `radial-gradient(circle at 40% 40%, ${colors.secondary}, ${colors.tertiary})`,
                boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.4)',
                transform: `translate(${irisX}px, ${irisY}px)`,
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[45%] rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #1a1a2e, #000000)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.6)' }}>
                <div className="absolute top-[25%] left-[30%] w-[35%] h-[35%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 1), transparent 60%)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white shadow-lg opacity-80" />
      </div>

      <style>{`
        @keyframes rollIn {
          0% { transform: translateX(-200%) rotate(-720deg); opacity: 0; }
          60% { transform: translateX(10%) rotate(-360deg); opacity: 1; }
          80% { transform: translateX(-5%) rotate(-390deg); }
          100% { transform: translateX(0) rotate(-360deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
