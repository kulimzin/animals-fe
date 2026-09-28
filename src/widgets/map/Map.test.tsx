// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '../../shared/i18n/i18n'
import { Map } from './Map'

const mapLibreMocks = vi.hoisted(() => ({
  addControl: vi.fn(),
  attributionControlOptions: undefined as object | undefined,
  disableKeyboardRotation: vi.fn(),
  disableTouchRotation: vi.fn(),
  geolocateControlOptions: undefined as object | undefined,
  mapOptions: undefined as Record<string, unknown> | undefined,
  navigationControlOptions: undefined as object | undefined,
  remove: vi.fn(),
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
    getLayer = vi.fn(() => undefined)
    getSource = vi.fn(() => undefined)
    on = vi.fn()
    remove = mapLibreMocks.remove
    setFilter = vi.fn()
  }

  return {
    AttributionControl: AttributionControlMock,
    GeolocateControl: GeolocateControlMock,
    Map: MapMock,
    NavigationControl: NavigationControlMock,
    setWorkerUrl: vi.fn(),
  }
})

afterEach(async () => {
  cleanup()
  vi.clearAllMocks()
  await i18n.changeLanguage('ru')
})

function renderMap() {
  render(
    <Map
      observations={[]}
      selectedObservationId={null}
      onBoundsChange={() => undefined}
      onObservationSelect={() => undefined}
    />,
  )
}

describe('Map controls', () => {
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
