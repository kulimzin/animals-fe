import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

import styles from './Input.module.css'

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  error?: ReactNode
  hint?: ReactNode
  label?: ReactNode
  leadingIcon?: ReactNode
  trailingElement?: ReactNode
}

export function Input({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className,
  error,
  hint,
  id,
  label,
  leadingIcon,
  required,
  trailingElement,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint && !error ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [ariaDescribedBy, hintId, errorId].filter(Boolean).join(' ') || undefined
  const fieldClassName = [styles.field, error && styles.hasError].filter(Boolean).join(' ')
  const inputClassName = [
    styles.input,
    leadingIcon && styles.hasLeadingIcon,
    trailingElement && styles.hasTrailingElement,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={fieldClassName}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      <div className={styles.control}>
        {leadingIcon ? (
          <span aria-hidden="true" className={styles.leadingIcon}>
            {leadingIcon}
          </span>
        ) : null}
        <input
          {...props}
          aria-describedby={describedBy}
          aria-invalid={error ? true : ariaInvalid}
          className={inputClassName}
          id={inputId}
          required={required}
        />
        {trailingElement ? <span className={styles.trailingElement}>{trailingElement}</span> : null}
      </div>
      {error ? (
        <p aria-live="polite" className={styles.error} id={errorId}>
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
