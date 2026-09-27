import type { ButtonHTMLAttributes, ReactNode } from 'react'

import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger'

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children?: ReactNode
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  variant?: ButtonVariant
  isIconOnly?: boolean
  isLoading?: boolean
}

export function Button({
  children,
  className,
  disabled,
  isIconOnly = false,
  isLoading = false,
  leadingIcon,
  trailingIcon,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const buttonClassName = [styles.root, styles[variant], isIconOnly && styles.iconOnly, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...props}
      aria-busy={isLoading || undefined}
      className={buttonClassName}
      disabled={disabled || isLoading}
      type={type}
    >
      {isLoading ? <span aria-hidden="true" className={styles.loader} /> : null}
      {!isLoading && leadingIcon ? (
        <span aria-hidden="true" className={styles.icon}>
          {leadingIcon}
        </span>
      ) : null}
      {children ? <span className={styles.label}>{children}</span> : null}
      {!isLoading && trailingIcon ? (
        <span aria-hidden="true" className={styles.icon}>
          {trailingIcon}
        </span>
      ) : null}
    </button>
  )
}
