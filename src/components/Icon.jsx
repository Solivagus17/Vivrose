import React from 'react';

const PATHS = {
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.4-3 8.1-7 10-4-1.9-7-5.6-7-10V6l7-3z" />
      <path d="M9.5 12l2 2 3.5-3.5" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4L2.5 20h19L12 4z" />
      <path d="M12 10v4" />
      <path d="M12 17.5v.5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
    </>
  ),
  stethoscope: (
    <>
      <path d="M5 4v6a5 5 0 0 0 10 0V4" />
      <path d="M5 4H3.5M15 4h1.5" />
      <path d="M10 15v2a4 4 0 0 0 8 0v-1" />
      <circle cx="19" cy="13" r="2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  brain: (
    <>
      <path d="M9.5 3A3 3 0 0 0 7 6.2 3.5 3.5 0 0 0 5 9.5 3 3 0 0 0 6.6 13a3 3 0 0 0-1.6 5.3A3 3 0 0 0 9.5 21V3z" />
      <path d="M9.5 3A3 3 0 0 1 12 6.2 3.5 3.5 0 0 1 14 9.5 3 3 0 0 1 12.4 13a3 3 0 0 1 1.6 5.3A3 3 0 0 1 9.5 21" />
    </>
  ),
  flask: (
    <>
      <path d="M10 2v5.5L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 7.5V2" />
      <path d="M8 2h8" />
      <path d="M7 15h10" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
      <path d="M9 12h6M9 16h4" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ),
  trend: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  document: (
    <>
      <path d="M6 2h8l4 4v16H6V2z" />
      <path d="M14 2v4h4" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  vial: (
    <>
      <path d="M10 2v6.5L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8.5V2" />
      <path d="M8 2h8" />
      <path d="M7 15h10" />
    </>
  ),
  syringe: (
    <>
      <path d="M18 2l4 4" />
      <path d="M14 6l4 4" />
      <path d="M3 21l9-9" />
      <path d="M12 12l3-3M9 15l3-3" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20.5S3 14.5 3 8.7C3 5.8 5.3 4 7.8 4 9.8 4 11.3 5 12 6.2 12.7 5 14.2 4 16.2 4 18.7 4 21 5.8 21 8.7c0 5.8-9 11.8-9 11.8z" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  droplet: (
    <>
      <path d="M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11z" />
    </>
  ),
  leaf: (
    <>
      <path d="M4 20c8 0 16-4 16-16-12 0-16 8-16 16z" />
      <path d="M4 20c2-8 6-12 12-14" />
    </>
  ),
  run: (
    <>
      <circle cx="15" cy="5" r="2" />
      <path d="M13 9l2.5 3 2.5 2.5M11 9l3 3 3 6" />
      <path d="M8 21l3-5 2 1 1-3" />
      <path d="M14 9.5V7" />
    </>
  ),
  noSmoking: (
    <>
      <path d="M18 10V8a4 4 0 0 0-4-4h-1M2 2l20 20" />
      <path d="M18 10h-3M14 14v6M6 10h1" />
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
    </>
  ),
  alert: (
    <>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 12v3M12 18.5v.5" />
      <path d="M9 5h6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  printer: (
    <>
      <path d="M7 8V3h10v5" />
      <rect x="4" y="8" width="16" height="8" rx="1.5" />
      <path d="M7 14h10v7H7z" />
    </>
  ),
  bolt: (
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
  ),
  dna: (
    <>
      <path d="M4 3c0 6 16 6 16 12M4 21c0-6 16-6 16-12" />
      <path d="M9 4h6M9 20h6M8 12h8" />
    </>
  ),
  check: <path d="M4 12l5 5L20 6" />,
  pill: (
    <>
      <path d="M10.5 13.5l-5 5a3.2 3.2 0 0 0 4.5 4.5l5-5" />
      <path d="M13.5 10.5l5-5a3.2 3.2 0 0 0-4.5-4.5l-5 5" />
      <path d="M7 13l4-4 4 4-4 4z" />
    </>
  ),
  ruler: (
    <>
      <rect x="3" y="9" width="18" height="6" rx="1" transform="rotate(-45 12 12)" />
      <path d="M8 8l2 2M12 12l2 2M14 6l2 2" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  userPlus: (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21c0-3.3 3-5 7-5s7 1.7 7 5" />
      <path d="M19 8v6M16 11h6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3 2.9-4.5 6.5-4.5s6.5 1.5 6.5 4.5" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M17.5 15.8c2.2.5 4 1.6 4 4.2" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 4l1.7 4.3L18 10l-4.3 1.7L12 16l-1.7-4.3L6 10l4.3-1.7L12 4z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01M8 18h8" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  mail: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </>
  ),
  edit: (
    <>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      <path d="M15 5l4 4" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6L6 18" />,
};

const SIZE_MAP = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

export default function Icon({ name, size = 'md', color = 'currentColor', strokeWidth = 1.8, className = '' }) {
  const numeric = SIZE_MAP[size] || size;
  return (
    <svg
      className={className}
      width={numeric}
      height={numeric}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name] || PATHS.sparkle}
    </svg>
  );
}
