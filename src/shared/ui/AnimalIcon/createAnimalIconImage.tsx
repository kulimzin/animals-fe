import { createRoot } from 'react-dom/client'

import { AnimalIcon } from './AnimalIcon'

export async function createAnimalIconImage(
  slug: string,
  color: string,
  size = 20,
  pixelRatio = 2,
) {
  const renderedSize = size * pixelRatio
  const container = document.createElement('div')
  const root = createRoot(container)

  root.render(<AnimalIcon color={color} size={renderedSize} slug={slug} strokeWidth={2.2} />)

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })

  const svg = container.querySelector('svg')

  if (!svg) {
    root.unmount()
    throw new Error(`Could not serialize icon: ${slug}`)
  }

  const markup = svg.outerHTML
  root.unmount()
  const image = new Image(renderedSize, renderedSize)
  const imageUrl = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }))

  try {
    await new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true })
      image.addEventListener('error', () => reject(new Error(`Could not render icon: ${slug}`)), {
        once: true,
      })
      image.src = imageUrl
    })
  } finally {
    URL.revokeObjectURL(imageUrl)
  }

  const canvas = document.createElement('canvas')
  canvas.width = renderedSize
  canvas.height = renderedSize
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas 2D context is unavailable')
  }

  context.drawImage(image, 0, 0, renderedSize, renderedSize)

  return context.getImageData(0, 0, renderedSize, renderedSize)
}
