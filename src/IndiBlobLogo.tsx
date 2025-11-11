// Indi Blob Logo Component - matches the extension's blob design
export default function IndiBlobLogo({ size = 40, style }: { size?: number, style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <defs>
        <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="eyeGradient" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f5f5f5" />
        </radialGradient>
        <radialGradient id="irisGradient" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#8b5cf6dd" />
          <stop offset="100%" stopColor="#7c3aedaa" />
        </radialGradient>
      </defs>

      {/* Main blob body */}
      <ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="42"
        fill="url(#blobGradient)"
        opacity="0.95"
      />

      {/* Eye white */}
      <circle cx="50" cy="40" r="22" fill="url(#eyeGradient)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="3" />

      {/* Iris */}
      <circle cx="50" cy="40" r="14" fill="url(#irisGradient)" />

      {/* Pupil */}
      <circle cx="50" cy="40" r="7" fill="#2d3748" />

      {/* Highlight in pupil */}
      <circle cx="47" cy="37" r="3" fill="rgba(255, 255, 255, 0.95)" />

      {/* Happy mouth */}
      <path
        d="M35,65 Q50,72 65,65"
        fill="none"
        stroke="rgba(0, 0, 0, 0.3)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Blush left */}
      <ellipse cx="25" cy="58" rx="7" ry="5" fill="rgba(255, 182, 193, 0.5)" />

      {/* Blush right */}
      <ellipse cx="75" cy="58" rx="7" ry="5" fill="rgba(255, 182, 193, 0.5)" />
    </svg>
  );
}
