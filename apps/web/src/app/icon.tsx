import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          width="64"
          height="64"
        >
          <defs>
            <linearGradient id="icon-gradient-fill" x1="12%" y1="10%" x2="88%" y2="90%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="icon-arc-stroke" x1="20%" y1="20%" x2="80%" y2="95%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(226,232,240,0.4)" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="url(#icon-gradient-fill)" />
          <path
            d="M17 28.5L32 16L47 28.5L43.4 30.9L32 22L20.6 30.9L17 28.5Z"
            fill="rgba(255,255,255,0.95)"
          />
          <path
            d="M20 27.5C20 24.462 22.462 22 25.5 22H32V45.5L24.8 41.8C21.6339 40.194 20 36.812 20 33.338V27.5Z"
            fill="rgba(248,250,252,0.97)"
          />
          <path
            d="M44 27.5C44 24.462 41.538 22 38.5 22H32V45.5L39.2 41.8C42.3661 40.194 44 36.812 44 33.338V27.5Z"
            fill="rgba(241,245,249,0.96)"
          />
          <path
            d="M22 32V34.4C22 40.1808 26.5231 45 32 45C37.4769 45 42 40.1808 42 34.4V32"
            stroke="rgba(15,23,42,0.6)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 41.5C21.3 46.8 26.15 49.5 32 49.5C37.85 49.5 42.7 46.8 46 41.5"
            stroke="url(#icon-arc-stroke)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
