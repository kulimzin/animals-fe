import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react'

import styles from './Textarea.module.css'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: ReactNode
  hint?: ReactNode
  label?: ReactNode
}

export function Textarea({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className,
  error,
  hint,
  id,
  label,
  required,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const hintId = hint && !error ? `${textareaId}-hint` : undefined
  const errorId = error ? `${textareaId}-error` : undefined
  const describedBy = [ariaDescribedBy, hintId, errorId].filter(Boolean).join(' ') || undefined
  const fieldClassName = [styles.field, error && styles.hasError].filter(Boolean).join(' ')
  const textareaClassName = [styles.textarea, className].filter(Boolean).join(' ')

  return (
    <div className={fieldClassName}>
      {label ? (
        <label className={styles.label} htmlFor={textareaId}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      <textarea
        {...props}
        aria-describedby={describedBy}
        aria-invalid={error ? true : ariaInvalid}
        className={textareaClassName}
        id={textareaId}
        required={required}
        rows={rows}
      />
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
