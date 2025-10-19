
import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="none"
    {...props}
  >
    <defs>
      <linearGradient id="logo-gradient-fill" x1="12%" y1="10%" x2="88%" y2="90%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary-start))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary-end))', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="logo-arc-stroke" x1="20%" y1="20%" x2="80%" y2="95%">
        <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.8)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgba(226,232,240,0.4)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#logo-gradient-fill)" />
    <path
      d="M17 28.5L32 16L47 28.5L43.4 30.9L32 22L20.6 30.9L17 28.5Z"
      fill="rgba(255,255,255,0.9)"
    />
    <path
      d="M20 27.5C20 24.4624 22.4624 22 25.5 22H32V45.5L24.8 41.8C21.6339 40.1944 20 36.812 20 33.3382V27.5Z"
      fill="rgba(248,250,252,0.95)"
    />
    <path
      d="M44 27.5C44 24.4624 41.5376 22 38.5 22H32V45.5L39.2 41.8C42.3661 40.1944 44 36.812 44 33.3382V27.5Z"
      fill="rgba(241,245,249,0.95)"
    />
    <path
      d="M22 32V34.4C22 40.1808 26.5231 45 32 45C37.4769 45 42 40.1808 42 34.4V32"
      stroke="rgba(15,23,42,0.55)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 41.5C21.3 46.8 26.15 49.5 32 49.5C37.85 49.5 42.7 46.8 46 41.5"
      stroke="url(#logo-arc-stroke)"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);
