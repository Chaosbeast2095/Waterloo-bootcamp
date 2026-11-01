import { cn } from "@/lib/utils";

const T = 2.4; // stroke weight in a 24-unit-tall grid

/** NEXUS wordmark: thin, square-cornered letters, spineless E, terracotta full stop. */
export function Logo({ className, title = "Nexus" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 121 24" role="img" aria-label={title} className={cn("block h-auto", className)} fill="currentColor">
      {/* N */}
      <rect x={0} y={0} width={T} height={24} />
      <rect x={18 - T} y={0} width={T} height={24} />
      <polygon points={`0,0 ${T * 1.6},0 18,24 ${18 - T * 1.6},24`} />
      {/* E (three bars, no spine) */}
      <rect x={25} y={0} width={15} height={T} />
      <rect x={25} y={12 - T / 2} width={11} height={T} />
      <rect x={25} y={24 - T} width={15} height={T} />
      {/* X */}
      <polygon points={`47,0 ${47 + T * 1.4},0 65,24 ${65 - T * 1.4},24`} />
      <polygon points={`${65 - T * 1.4},0 65,0 ${47 + T * 1.4},24 47,24`} />
      {/* U */}
      <rect x={72} y={0} width={T} height={24} />
      <rect x={72} y={24 - T} width={17} height={T} />
      <rect x={89 - T} y={0} width={T} height={24} />
      {/* S */}
      <rect x={96} y={0} width={16} height={T} />
      <rect x={96} y={0} width={T} height={12} />
      <rect x={96} y={12 - T / 2} width={16} height={T} />
      <rect x={112 - T} y={12} width={T} height={12} />
      <rect x={96} y={24 - T} width={16} height={T} />
      {/* full stop */}
      <rect x={116.6} y={24 - 4.4} width={4.4} height={4.4} fill="#E2725B" />
    </svg>
  );
}

/** Square N mark, same drawing as the favicon. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("block", className)}>
      <rect width="64" height="64" fill="#0D3C26" />
      <rect x="14" y="14" width="7" height="36" fill="#F4EADE" />
      <polygon points="14,14 23,14 50,50 41,50" fill="#F4EADE" />
      <rect x="43" y="24" width="7" height="26" fill="#F4EADE" />
      <rect x="43" y="14" width="7" height="7" fill="#E2725B" />
    </svg>
  );
}
