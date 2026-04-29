import { useId } from 'react';

interface Props {
  /** Tailwind size classes, e.g. "h-8 w-8" */
  className?: string;
}

/**
 * Inline SVG replica of public/favicon.svg.
 * Outer ring uses theme CSS vars; needle keeps its original red-pink gradient
 * so it pops on any background.
 * useId() ensures gradient IDs are unique when rendered more than once.
 */
export function AppIcon({ className = 'h-8 w-8' }: Props) {
  const uid       = useId().replace(/:/g, '');
  const outerGrad = `aig_outer_${uid}`;
  const needleGrad= `aig_needle_${uid}`;
  const glowGrad  = `aig_glow_${uid}`;

  return (
    <svg
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Outer ring — primary → tertiary (changes with theme) */}
        <linearGradient id={outerGrad} x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="var(--primary)"  />
          <stop offset="100%" stopColor="var(--tertiary)" />
        </linearGradient>

        {/* Needle — fixed warm red-pink so it always stands out */}
        <linearGradient id={needleGrad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#FF512F" />
          <stop offset="100%" stopColor="#DD2476" />
        </linearGradient>

        {/* Soft center glow */}
        <radialGradient id={glowGrad} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer circle */}
      <circle cx="64" cy="64" r="60" fill={`url(#${outerGrad})`} />

      {/* Inner translucent ring */}
      <circle cx="64" cy="64" r="50" fill="white" fillOpacity="0.08" />

      {/* Cardinal tick marks */}
      <g stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <line x1="64" y1="10"  x2="64"  y2="22"  />
        <line x1="64" y1="106" x2="64"  y2="118" />
        <line x1="10" y1="64"  x2="22"  y2="64"  />
        <line x1="106" y1="64" x2="118" y2="64"  />
      </g>

      {/* Diagonal ticks */}
      <g stroke="white" strokeWidth="2" opacity="0.5">
        <line x1="24"  y1="24"  x2="32" y2="32" />
        <line x1="104" y1="24"  x2="96" y2="32" />
        <line x1="24"  y1="104" x2="32" y2="96" />
        <line x1="104" y1="104" x2="96" y2="96" />
      </g>

      {/* Needle north — colored */}
      <path d="M64 18 L74 64 L64 58 L54 64 Z" fill={`url(#${needleGrad})`} />
      {/* Needle south — white dimmed */}
      <path d="M64 110 L74 64 L64 70 L54 64 Z" fill="#ffffff" opacity="0.7" />

      {/* Centre dot */}
      <circle cx="64" cy="64" r="6" fill="white" />

      {/* Glow */}
      <circle cx="64" cy="64" r="20" fill={`url(#${glowGrad})`} opacity="0.2" />
    </svg>
  );
}
