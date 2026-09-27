import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type UIEvent,
} from 'react'

import { Chip } from '../Chip'
import { Icon } from '../Icon'
import styles from './MultiSelectAutocomplete.module.css'

const optionHeight = 48
const visibleOptionCount = 5
const virtualizationThreshold = 50
const virtualizationOverscan = 3

export type MultiSelectAutocompleteOption = {
  label: string
  leadingContent?: ReactNode
  searchTerms?: readonly string[]
  value: string
}

export type MultiSelectAutocompleteProps = {
  ariaLabel: string
  disabled?: boolean
  limitReachedText: string
  maxSelected: number
  noOptionsText: string
  onChange: (values: string[]) => void
  options: MultiSelectAutocompleteOption[]
  placeholder: string
  removeOptionLabel: (option: MultiSelectAutocompleteOption) => string
  resultsLabel: string
  searchLabel: string
  searchPlaceholder: string
  selectedCountText: string
  suggestionLimit?: number
  suggestionsLabel: string
  value: string[]
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
}

export function MultiSelectAutocomplete({
  ariaLabel,
  disabled = false,
  limitReachedText,
  maxSelected,
  noOptionsText,
  onChange,
  options,
  placeholder,
  removeOptionLabel,
  resultsLabel,
  searchLabel,
  searchPlaceholder,
  selectedCountText,
  suggestionLimit,
  suggestionsLabel,
  value,
}: MultiSelectAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrollTop, setScrollTop] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const controlRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const limitMessageId = useId()
  const normalizedQuery = normalizeSearchText(searchQuery.trim())
  const hasReachedLimit = value.length >= maxSelected
  const selectedOptions = value
    .map((selectedValue) => options.find((option) => option.value === selectedValue))
    .filter((option): option is MultiSelectAutocompleteOption => option !== undefined)
  const visibleOptions = useMemo(() => {
    if (!normalizedQuery) {
      return suggestionLimit === undefined ? options : options.slice(0, suggestionLimit)
    }

    return options.filter((option) =>
      [option.label, ...(option.searchTerms ?? [])].some((term) =>
        normalizeSearchText(term).includes(normalizedQuery),
      ),
    )
  }, [normalizedQuery, options, suggestionLimit])
  const shouldVirtualize = visibleOptions.length > virtualizationThreshold
  const maximumFirstVirtualOptionIndex = Math.max(
    0,
    visibleOptions.length - visibleOptionCount - virtualizationOverscan * 2,
  )
  const firstVirtualOptionIndex = shouldVirtualize
    ? Math.min(
        maximumFirstVirtualOptionIndex,
        Math.max(0, Math.floor(scrollTop / optionHeight) - virtualizationOverscan),
      )
    : 0
  const lastVirtualOptionIndex = shouldVirtualize
    ? Math.min(
        visibleOptions.length,
        firstVirtualOptionIndex + visibleOptionCount + virtualizationOverscan * 2,
      )
    : visibleOptions.length
  const renderedOptions = visibleOptions.slice(firstVirtualOptionIndex, lastVirtualOptionIndex)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    searchInputRef.current?.focus()

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen])

  function openListbox() {
    if (!disabled) {
      setIsOpen(true)
    }
  }

  function closeListbox({ restoreFocus = false } = {}) {
    setIsOpen(false)
    setSearchQuery('')

    if (restoreFocus) {
      controlRef.current?.focus()
    }
  }

  function toggleOption(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((selectedValue) => selectedValue !== optionValue))
      return
    }

    if (!hasReachedLimit) {
      onChange([...value, optionValue])
    }
  }

  function handleControlKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      openListbox()
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeListbox({ restoreFocus: true })
      return
    }

    if (event.key === 'Backspace' && searchQuery === '' && value.length > 0) {
      onChange(value.slice(0, -1))
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const startIndex = event.key === 'ArrowDown' ? 0 : visibleOptions.length - 1
      const direction = event.key === 'ArrowDown' ? 1 : -1
      focusOption(startIndex, direction)
    }
  }

  function getEnabledOptionIndex(startIndex: number, direction: 1 | -1) {
    for (let offset = 0; offset < visibleOptions.length; offset += 1) {
      const index =
        (startIndex + offset * direction + visibleOptions.length) % visibleOptions.length
      const option = visibleOptions[index]

      if (option && (!hasReachedLimit || value.includes(option.value))) {
        return index
      }
    }

    return undefined
  }

  function focusOption(startIndex: number, direction: 1 | -1) {
    const optionIndex = getEnabledOptionIndex(startIndex, direction)

    if (optionIndex === undefined) {
      return
    }

    if (shouldVirtualize && listboxRef.current) {
      const nextScrollTop = optionIndex * optionHeight
      listboxRef.current.scrollTop = nextScrollTop
      setScrollTop(nextScrollTop)
    }

    window.requestAnimationFrame(() => {
      rootRef.current
        ?.querySelector<HTMLButtonElement>(`[data-option-index="${optionIndex}"]`)
        ?.focus()
    })
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, optionIndex: number) {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeListbox({ restoreFocus: true })
      return
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return
    }

    event.preventDefault()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    focusOption(optionIndex + direction, direction)
  }

  function handleListboxScroll(event: UIEvent<HTMLDivElement>) {
    if (shouldVirtualize) {
      setScrollTop(event.currentTarget.scrollTop)
    }
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <div
        aria-controls={isOpen ? listboxId : undefined}
        aria-autocomplete="list"
        aria-disabled={disabled || undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={[styles.control, isOpen && styles.isOpen, disabled && styles.isDisabled]
          .filter(Boolean)
          .join(' ')}
        onClick={openListbox}
        onKeyDown={handleControlKeyDown}
        ref={controlRef}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
      >
        <div className={styles.values}>
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span
                className={styles.chipWrapper}
                key={option.value}
                onClick={(event) => {
                  event.stopPropagation()
                }}
              >
                <Chip
                  isSelected
                  leadingIcon={option.leadingContent}
                  onRemove={() => {
                    toggleOption(option.value)
                  }}
                  removeLabel={removeOptionLabel(option)}
                >
                  {option.label}
                </Chip>
              </span>
            ))
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </div>
        <Icon className={styles.chevron} name="chevronDown" size={18} />
      </div>

      {isOpen ? (
        <div className={styles.popover}>
          <label className={styles.search}>
            <span className={styles.visuallyHidden}>{searchLabel}</span>
            <Icon aria-hidden="true" className={styles.searchIcon} name="search" size={18} />
            <input
              aria-describedby={hasReachedLimit ? limitMessageId : undefined}
              autoComplete="off"
              className={styles.searchInput}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setScrollTop(0)

                if (listboxRef.current) {
                  listboxRef.current.scrollTop = 0
                }
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              ref={searchInputRef}
              type="search"
              value={searchQuery}
            />
          </label>

          <div className={styles.summary}>
            <span>{normalizedQuery ? resultsLabel : suggestionsLabel}</span>
            <span className={styles.counter}>{selectedCountText}</span>
          </div>

          {visibleOptions.length > 0 ? (
            <div
              aria-label={normalizedQuery ? resultsLabel : suggestionsLabel}
              aria-multiselectable="true"
              className={[styles.listbox, shouldVirtualize && styles.virtualizedListbox]
                .filter(Boolean)
                .join(' ')}
              id={listboxId}
              onScroll={handleListboxScroll}
              ref={listboxRef}
              role="listbox"
              style={
                shouldVirtualize
                  ? { height: Math.min(visibleOptions.length, visibleOptionCount) * optionHeight }
                  : undefined
              }
            >
              {shouldVirtualize ? (
                <div
                  aria-hidden="true"
                  className={styles.virtualSpacer}
                  style={{ height: visibleOptions.length * optionHeight }}
                />
              ) : null}
              {renderedOptions.map((option, renderedOptionIndex) => {
                const optionIndex = firstVirtualOptionIndex + renderedOptionIndex
                const isSelected = value.includes(option.value)
                const isDisabled = hasReachedLimit && !isSelected

                return (
                  <button
                    aria-selected={isSelected}
                    aria-posinset={optionIndex + 1}
                    aria-setsize={visibleOptions.length}
                    className={[
                      styles.option,
                      shouldVirtualize && styles.virtualOption,
                      isSelected && styles.isSelected,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    data-option-index={optionIndex}
                    disabled={isDisabled}
                    key={option.value}
                    onClick={() => {
                      toggleOption(option.value)
                      searchInputRef.current?.focus()
                    }}
                    onKeyDown={(event) => {
                      handleOptionKeyDown(event, optionIndex)
                    }}
                    role="option"
                    style={
                      shouldVirtualize
                        ? { transform: `translateY(${optionIndex * optionHeight}px)` }
                        : undefined
                    }
                    type="button"
                  >
                    {option.leadingContent ? (
                      <span aria-hidden="true" className={styles.optionLeading}>
                        {option.leadingContent}
                      </span>
                    ) : null}
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span aria-hidden="true" className={styles.selectionMark}>
                      {isSelected ? '✓' : '+'}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className={styles.empty}>{noOptionsText}</p>
          )}

          {hasReachedLimit ? (
            <p aria-live="polite" className={styles.limitMessage} id={limitMessageId}>
              {limitReachedText}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
