/** The Faun mark: four petals around a seed, drawn on a 24-unit grid. */
export function FaunMark({ size = 24 }: { size?: number }) {
  return (
    <svg className="faun-mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="currentColor">
        <path d="M12 11.2C12 6.6 9.1 3 4.6 3 4.6 7.6 7.5 11.2 12 11.2Z" opacity="0.92" />
        <path d="M12.8 12C17.4 12 21 9.1 21 4.6 16.4 4.6 12.8 7.5 12.8 12Z" opacity="0.7" />
        <path d="M12 12.8C12 17.4 14.9 21 19.4 21 19.4 16.4 16.5 12.8 12 12.8Z" opacity="0.92" />
        <path d="M11.2 12C6.6 12 3 14.9 3 19.4 7.6 19.4 11.2 16.5 11.2 12Z" opacity="0.7" />
      </g>
    </svg>
  );
}
