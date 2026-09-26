import type { HTMLAttributes, ReactNode } from 'react'

import styles from './Badge.module.css'

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'danger'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  variant?: BadgeVariant
}

export function Badge({ children, className, variant = 'neutral', ...props }: BadgeProps) {
  const badgeClassName = [styles.root, styles[variant], className].filter(Boolean).join(' ')

  return (
    <span {...props} className={badgeClassName}>
      {children}
    </span>
  )
}
