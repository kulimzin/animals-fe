// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { AnimalIcon } from './AnimalIcon'

afterEach(cleanup)

describe('AnimalIcon', () => {
  it('renders a named animal icon with an accessible title', () => {
    render(<AnimalIcon slug="snow-leopard" title="Снежный барс" />)

    expect(screen.getByRole('img', { name: 'Снежный барс' }).getAttribute('data-animal-slug')).toBe(
      'snow-leopard',
    )
  })

  it('renders a decorative fallback for an unknown slug', () => {
    const { container } = render(<AnimalIcon slug="unknown-animal" />)

    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })
})
