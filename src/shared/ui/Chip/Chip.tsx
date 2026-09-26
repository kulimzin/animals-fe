import type { HTMLAttributes, ReactNode } from 'react'

import { Icon } from '../Icon'
import styles from './Chip.module.css'

export type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  isSelected?: boolean
  leadingIcon?: ReactNode
} & (
    | {
        onRemove?: undefined
        removeLabel?: never
      }
    | {
        onRemove: () => void
        removeLabel: string
      }
  )

export function Chip({
  children,
  className,
  isSelected = false,
  leadingIcon,
  onRemove,
  removeLabel,
  ...props
}: ChipProps) {
  const chipClassName = [styles.root, isSelected && styles.isSelected, className]
    .filter(Boolean)
    .join(' ')

  return (
    <span {...props} className={chipClassName}>
      {leadingIcon ? (
        <span aria-hidden="true" className={styles.leadingIcon}>
          {leadingIcon}
        </span>
      ) : null}
      <span className={styles.label}>{children}</span>
      {onRemove ? (
        <button
          aria-label={removeLabel}
          className={styles.removeButton}
          onClick={onRemove}
          type="button"
        >
          <Icon name="close" size={16} />
        </button>
      ) : null}
    </span>
  )
}
