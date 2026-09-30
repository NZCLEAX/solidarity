type PulseLogoProps = {
  variant?: 'light' | 'dark'
  compact?: boolean
  className?: string
}

export default function PulseLogo({
  variant,
  compact = false,
  className = '',
}: PulseLogoProps) {
  const lightSrc = compact
    ? '/branding/pulse-icon-light.svg'
    : '/branding/pulse-logo-light.svg'

  const darkSrc = compact
    ? '/branding/pulse-icon-dark.svg'
    : '/branding/pulse-logo-dark.svg'

  if (variant === 'light') {
    return (
      <img
        src={lightSrc}
        alt="PULSE"
        className={`block object-contain ${className}`}
      />
    )
  }

  if (variant === 'dark') {
    return (
      <img
        src={darkSrc}
        alt="PULSE"
        className={`block object-contain ${className}`}
      />
    )
  }

  return (
    <>
      <img
        src={lightSrc}
        alt="PULSE"
        className={`block object-contain dark:hidden ${className}`}
      />

      <img
        src={darkSrc}
        alt="PULSE"
        className={`hidden object-contain dark:block ${className}`}
      />
    </>
  )
}