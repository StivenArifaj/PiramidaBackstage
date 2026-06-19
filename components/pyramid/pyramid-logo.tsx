interface PyramidLogoProps {
  size?: number
  className?: string
}

export function PyramidLogo({ size = 32, className }: PyramidLogoProps) {
  const h = Math.round(size * 0.833)
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Piramida logo"
    >
      <polygon points="12,0 24,20 0,20" fill="currentColor" />
      <rect x="7" y="13" width="4" height="5" fill="#378ADD" />
      <rect x="12" y="13" width="3" height="5" fill="#f4a261" />
      <rect x="16" y="14" width="2.5" height="4" fill="#97C459" />
    </svg>
  )
}
