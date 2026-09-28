import type { SVGProps } from 'react'

const iconPaths = {
  plus: <path d="M12 5v14M5 12h14" />,
  filter: (
    <>
      <path d="M4 6h16M7 12h10M10 18h4" />
      <circle cx="8" cy="6" fill="currentColor" r="1.5" stroke="none" />
      <circle cx="15" cy="12" fill="currentColor" r="1.5" stroke="none" />
      <circle cx="12" cy="18" fill="currentColor" r="1.5" stroke="none" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  calendar: (
    <>
      <rect height="15" rx="2" width="16" x="4" y="5" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  thumbUp: (
    <path d="M7 10v10H4V10h3Zm3 10h6.2a2 2 0 0 0 1.95-1.55l1.2-5A2 2 0 0 0 17.4 11H14l.5-3.1A2.1 2.1 0 0 0 12.4 5.5L8.8 10H7v10h3Z" />
  ),
  thumbDown: (
    <path d="M7 4v10H4V4h3Zm3 0h6.2a2 2 0 0 1 1.95 1.55l1.2 5A2 2 0 0 1 17.4 13H14l.5 3.1a2.1 2.1 0 0 1-2.1 2.4L8.8 14H7V4h3Z" />
  ),
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
} as const

export type IconName = keyof typeof iconPaths

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  name: IconName
  size?: number
  title?: string
}

export function Icon({ name, size = 20, title, ...props }: IconProps) {
  const isDecorative = title === undefined

  return (
    <svg
      {...props}
      aria-hidden={isDecorative || undefined}
      fill="none"
      focusable="false"
      height={size}
      role={isDecorative ? undefined : 'img'}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      {title ? <title>{title}</title> : null}
      {iconPaths[name]}
    </svg>
  )
}
