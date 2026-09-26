import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import { Icon } from '../Icon'
import styles from './Dialog.module.css'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

type DialogAccessibleName =
  | {
      ariaLabel?: string
      title: NonNullable<ReactNode>
    }
  | {
      ariaLabel: string
      title?: undefined
    }

export type DialogProps = DialogAccessibleName & {
  children?: ReactNode
  closeLabel: string
  footer?: ReactNode
  isOpen: boolean
  maxHeight?: CSSProperties['maxHeight']
  maxWidth?: CSSProperties['maxWidth']
  onClose: () => void
}

function getFocusableElements(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>(focusableSelector)].filter(
    (element) =>
      !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
  )
}

export function Dialog({
  ariaLabel,
  children,
  closeLabel,
  footer,
  isOpen,
  maxHeight,
  maxWidth,
  onClose,
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const hasTitle = title !== undefined
  const hasContent = children !== undefined && children !== null
  const dialogStyle: CSSProperties | undefined =
    maxHeight === undefined && maxWidth === undefined ? undefined : { maxHeight, maxWidth }

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const animationFrameId = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current
      if (!dialog) {
        return
      }

      getFocusableElements(dialog)[0]?.focus()
    })

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      document.body.style.overflow = previousBodyOverflow
      previouslyFocusedElement?.focus()
    }
  }, [isOpen])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    const focusableElements = getFocusableElements(dialog)
    if (focusableElements.length === 0) {
      event.preventDefault()
      dialog.focus()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)
    if (!lastElement) {
      return
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return createPortal(
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        aria-label={hasTitle ? undefined : ariaLabel}
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-modal="true"
        className={styles.dialog}
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
        style={dialogStyle}
        tabIndex={-1}
      >
        <div
          className={[styles.header, !hasTitle && styles.headerWithoutTitle]
            .filter(Boolean)
            .join(' ')}
        >
          {hasTitle ? (
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>
          ) : null}
          <button
            aria-label={closeLabel}
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>
        {hasContent ? <div className={styles.content}>{children}</div> : null}
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
