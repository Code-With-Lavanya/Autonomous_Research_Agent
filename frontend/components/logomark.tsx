interface LogomarkProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

/**
 * Abstract 4-node reading of the backend's 6-node LangGraph pipeline —
 * a forward path plus one loop-back edge, echoing the real
 * critic -> research conditional edge in graph.py. Used as the app mark
 * everywhere (header, favicon-style contexts, hero).
 */
export function Logomark({ size = 28, className, animated = false }: LogomarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Autonomous Research Agent"
    >
      <path
        d="M5 21 L11.5 9.5 L18 15 L23 6"
        stroke="var(--color-brand)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 6 C 19 11, 15.5 12.5, 12 15.5"
        stroke="var(--color-brand)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="0.5 3.4"
        opacity="0.55"
      />
      <circle cx="5" cy="21" r="2.4" fill="var(--color-surface)" stroke="var(--color-brand)" strokeWidth="1.6" />
      <circle cx="11.5" cy="9.5" r="2" fill="var(--color-brand)" />
      <circle cx="18" cy="15" r="2" fill="var(--color-brand)" />
      <circle
        cx="23"
        cy="6"
        r="2.7"
        fill="var(--color-brand)"
        className={animated ? "origin-center animate-node-pulse" : undefined}
      />
    </svg>
  );
}
