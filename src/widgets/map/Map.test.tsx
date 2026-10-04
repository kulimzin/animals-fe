// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '../../shared/i18n/i18n'
import { Map } from './Map'

const mapLibreMocks = vi.hoisted(() => ({
  addLayer: vi.fn<(layer: unknown) => void>(),
  addSource: vi.fn<(id: string, source: unknown) => void>(),
  addControl: vi.fn(),
  addImage: vi.fn(),
  attributionControlOptions: undefined as object | undefined,
  disableKeyboardRotation: vi.fn(),
  disableTouchRotation: vi.fn(),
  getCanvas: vi.fn(() => ({ style: { cursor: '' } })),
  getBounds: vi.fn(() => ({
    getWest: () => 37.4,
    getSouth: () => 55.6,
    getEast: () => 37.85,
    getNorth: () => 55.9,
  })),
  hasImage: vi.fn(() => false),
  geolocateControlOptions: undefined as object | undefined,
  geolocateTrigger: vi.fn(),
  mapOptions: undefined as Record<string, unknown> | undefined,
  missingStyleImageResolver: undefined as
    ((imageId: string) => void | Promise<void>) | null | undefined,
  navigationControlOptions: undefined as object | undefined,
  on: vi.fn(),
  remove: vi.fn(),
  triggerRepaint: vi.fn(),
}))

vi.mock('maplibre-gl', () => {
  class AttributionControlMock {
    constructor(options: object) {
      mapLibreMocks.attributionControlOptions = options
    }
  }

  class GeolocateControlMock {
    constructor(options: object) {
      mapLibreMocks.geolocateControlOptions = options
    }

    trigger = mapLibreMocks.geolocateTrigger
  }

  class NavigationControlMock {
    constructor(options: object) {
      mapLibreMocks.navigationControlOptions = options
    }
  }

  class MapMock {
    keyboard = { disableRotation: mapLibreMocks.disableKeyboardRotation }
    touchZoomRotate = { disableRotation: mapLibreMocks.disableTouchRotation }

    constructor(options: Record<string, unknown>) {
      mapLibreMocks.mapOptions = options
    }

    addControl = mapLibreMocks.addControl
    addImage = mapLibreMocks.addImage
    addLayer = mapLibreMocks.addLayer
    addSource = mapLibreMocks.addSource
    getBounds = mapLibreMocks.getBounds
    hasImage = mapLibreMocks.hasImage
    getLayer = vi.fn(() => undefined)
    getCanvas = mapLibreMocks.getCanvas
    getSource = vi.fn(() => undefined)
    on = mapLibreMocks.on
    remove = mapLibreMocks.remove
    setFilter = vi.fn()
    setMissingStyleImageResolver(resolver: ((imageId: string) => void | Promise<void>) | null) {
      mapLibreMocks.missingStyleImageResolver = resolver
      return this
    }
    triggerRepaint = mapLibreMocks.triggerRepaint
  }

  return {
    AttributionControl: AttributionControlMock,
    GeolocateControl: GeolocateControlMock,
    Map: MapMock,
    NavigationControl: NavigationControlMock,
    setWorkerUrl: vi.fn(),
  }
})

beforeEach(async () => {
  await i18n.changeLanguage('ru')
})

afterEach(async () => {
  cleanup()
  vi.clearAllMocks()
  await i18n.changeLanguage('ru')
})

function renderMap() {
  render(
    <Map
      animals={[]}
      observations={[]}
      selectedObservationId={null}
      onBoundsChange={() => undefined}
      onObservationSelect={() => undefined}
    />,
  )
}

function getMapEventHandler(eventName: string) {
  const registration = mapLibreMocks.on.mock.calls.find(
    ([registeredEvent, secondArgument]) =>
      registeredEvent === eventName && typeof secondArgument === 'function',
  )

  return registration?.[1] as
    ((event: { lngLat: { lat: number; lng: number } }) => void) | undefined
}

function triggerMapEvent(eventName: string) {
  const handler = getMapEventHandler(eventName)
  handler?.({ lngLat: { lat: 55.75, lng: 37.62 } })
}

describe('Map controls', () => {
  it('renders the first letter of the localized animal name inside encounter markers', () => {
    render(
      <Map
        animals={[{ id: 'cat-id', slug: 'cat', name: { ru: 'Кошка', en: 'Cat' } }]}
        observations={[
          {
            id: 'observation-id',
            animalId: 'cat-id',
            location: { latitude: 55.75, longitude: 37.62 },
            observedAt: '2026-10-02T08:00:00.000Z',
            votes: { confirm: 1, reject: 0 },
            confirmationPercent: 100,
          },
        ]}
        selectedObservationId={null}
        onBoundsChange={() => undefined}
        onObservationSelect={() => undefined}
      />,
    )

    triggerMapEvent('load')

    const observationSource = mapLibreMocks.addSource.mock.calls.find(
      ([sourceId]) => sourceId === 'observations',
    )?.[1]
    const initialLayer = mapLibreMocks.addLayer.mock.calls
      .map(([layer]) => layer)
      .find(
        (layer) =>
          typeof layer === 'object' &&
          layer !== null &&
          'id' in layer &&
          layer.id === 'observation-initials',
      )

    expect(observationSource).toMatchObject({
      data: {
        features: [{ properties: { animalInitial: 'К' } }],
      },
    })
    expect(initialLayer).toMatchObject({
      id: 'observation-initials',
      layout: {
        'text-allow-overlap': true,
        'text-field': ['get', 'animalInitial'],
      },
      type: 'symbol',
    })
  })

  it('returns coordinates clicked in location selection mode', () => {
    const onLocationSelect = vi.fn()

    render(
      <Map
        animals={[]}
        isLocationSelectionEnabled
        observations={[]}
        selectedObservationId={null}
        onBoundsChange={() => undefined}
        onLocationSelect={onLocationSelect}
        onObservationSelect={() => undefined}
      />,
    )
    getMapEventHandler('click')?.({ lngLat: { lat: 55.75, lng: 37.62 } })

    expect(onLocationSelect).toHaveBeenCalledWith({ latitude: 55.75, longitude: 37.62 })
  })

  it('disables rotation and configures navigation controls', () => {
    renderMap()

    expect(mapLibreMocks.mapOptions).toMatchObject({
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    })
    expect(mapLibreMocks.disableKeyboardRotation).toHaveBeenCalledOnce()
    expect(mapLibreMocks.disableTouchRotation).toHaveBeenCalledOnce()
    expect(mapLibreMocks.navigationControlOptions).toEqual({ showCompass: false })
    expect(mapLibreMocks.geolocateControlOptions).toEqual({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    })
  })

  it('requests the current position when the map loads', () => {
    renderMap()

    expect(mapLibreMocks.geolocateTrigger).not.toHaveBeenCalled()

    triggerMapEvent('load')

    expect(mapLibreMocks.geolocateTrigger).toHaveBeenCalledOnce()
  })

  it('passes Russian UI labels to MapLibre', () => {
    renderMap()

    expect(mapLibreMocks.mapOptions?.locale).toMatchObject({
      'AttributionControl.ToggleAttribution': 'Источники карты',
      'GeolocateControl.FindMyLocation': 'Найти моё местоположение',
      'GeolocateControl.LocationNotAvailable': 'Местоположение недоступно',
      'Map.Title': 'Карта',
      'NavigationControl.ZoomIn': 'Приблизить',
      'NavigationControl.ZoomOut': 'Отдалить',
    })
  })

  it('passes English UI labels to MapLibre', async () => {
    await i18n.changeLanguage('en')
    renderMap()

    expect(mapLibreMocks.mapOptions?.locale).toMatchObject({
      'AttributionControl.ToggleAttribution': 'Map sources',
      'GeolocateControl.FindMyLocation': 'Find my location',
      'GeolocateControl.LocationNotAvailable': 'Location is not available',
      'Map.Title': 'Map',
      'NavigationControl.ZoomIn': 'Zoom in',
      'NavigationControl.ZoomOut': 'Zoom out',
    })
  })
})
