import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AttributionControl,
  GeolocateControl,
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
} from 'maplibre-gl'
import type { GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import type { Animal } from '../../entities/animal'
import { toObservationFeatureCollection, type ObservationMapItem } from '../../entities/observation'
import { MAP_INITIAL_CENTER, MAP_INITIAL_ZOOM, MAP_STYLE_URL } from '../../shared/config/map'
import type { GeoBounds, GeoPoint } from '../../shared/lib/geo'
import styles from './Map.module.css'

setWorkerUrl(mapLibreWorkerUrl)

const OBSERVATION_SOURCE_ID = 'observations'
const CLUSTER_LAYER_ID = 'observation-clusters'
const CLUSTER_COUNT_LAYER_ID = 'observation-cluster-count'
const OBSERVATION_LAYER_ID = 'observation-points'
const OBSERVATION_LABEL_LAYER_ID = 'observation-labels'
const SELECTED_OBSERVATION_LABEL_LAYER_ID = 'selected-observation-label'
const SELECTED_OBSERVATION_LAYER_ID = 'selected-observation-point'
const LOCATION_SELECTION_SOURCE_ID = 'location-selection'
const LOCATION_SELECTION_LAYER_ID = 'location-selection-point'
const OBSERVATION_LABEL_BACKGROUND_ID = 'observation-label-background'
const SELECTED_OBSERVATION_LABEL_BACKGROUND_ID = 'selected-observation-label-background'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getFeatureProperty(properties: unknown, propertyName: string): unknown {
  return isRecord(properties) ? properties[propertyName] : undefined
}

type MapProps = {
  animals: Animal[]
  isLocationSelectionEnabled?: boolean
  observations: ObservationMapItem[]
  selectedLocation?: GeoPoint | null
  selectedObservationId: string | null
  onBoundsChange: (bounds: GeoBounds) => void
  onLocationSelect?: (location: GeoPoint) => void
  onObservationSelect: (observationId: string) => void
}

type Language = 'en' | 'ru'

function parseHexColor(color: string) {
  const value = color.trim().replace('#', '')

  if (!/^[\da-f]{6}$/i.test(value)) {
    return [0, 0, 0, 255] as const
  }

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    255,
  ] as const
}

function createLabelBackgroundImage(backgroundColor: string, borderColor: string) {
  const width = 40
  const height = 28
  const borderWidth = 2
  const radius = height / 2
  const background = parseHexColor(backgroundColor)
  const border = parseHexColor(borderColor)
  const imageData = new Uint8Array(width * height * 4)

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nearestX = Math.max(radius, Math.min(width - radius, x + 0.5))
      const nearestY = height / 2
      const distance = Math.hypot(x + 0.5 - nearestX, y + 0.5 - nearestY)
      const color =
        distance <= radius - borderWidth ? background : distance <= radius ? border : null

      if (color) {
        imageData.set(color, (y * width + x) * 4)
      }
    }
  }

  return { data: imageData, height, width }
}

function addLabelBackground(
  map: MapLibreMap,
  imageId: string,
  backgroundColor: string,
  borderColor: string,
) {
  map.addImage(imageId, createLabelBackgroundImage(backgroundColor, borderColor), {
    content: [10, 5, 30, 23],
    pixelRatio: 2,
    stretchX: [[14, 26]],
    stretchY: [[12, 16]],
  })
}

function toMapFeatureCollection(
  observations: ObservationMapItem[],
  animals: Animal[],
  language: Language,
  fallbackAnimalName: string,
) {
  const animalNameById = new globalThis.Map(
    animals.map((animal) => [animal.id, animal.name[language]]),
  )
  const collection = toObservationFeatureCollection(observations)

  return {
    ...collection,
    features: collection.features.map((feature) => {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          animalName: animalNameById.get(feature.properties.animalId) ?? fallbackAnimalName,
        },
      }
    }),
  }
}

function addObservationLabelLayer(map: MapLibreMap, isSelected: boolean, textColor: string) {
  map.addLayer({
    id: isSelected ? SELECTED_OBSERVATION_LABEL_LAYER_ID : OBSERVATION_LABEL_LAYER_ID,
    type: 'symbol',
    source: OBSERVATION_SOURCE_ID,
    filter: [
      'all',
      ['!', ['has', 'point_count']],
      [isSelected ? '==' : '!=', ['get', 'observationId'], ''],
    ],
    layout: {
      'icon-image': isSelected
        ? SELECTED_OBSERVATION_LABEL_BACKGROUND_ID
        : OBSERVATION_LABEL_BACKGROUND_ID,
      'icon-allow-overlap': true,
      'icon-text-fit': 'both',
      'icon-text-fit-padding': [5, 9, 5, 9],
      'text-allow-overlap': true,
      'text-field': ['get', 'animalName'],
      'text-font': ['Noto Sans Regular'],
      'text-offset': [0, -1.7],
      'text-size': 13,
    },
    paint: {
      'text-color': textColor,
    },
  })
}

function toLocationFeatureCollection(location: GeoPoint | null) {
  return {
    type: 'FeatureCollection' as const,
    features: location
      ? [
          {
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'Point' as const,
              coordinates: [location.longitude, location.latitude],
            },
          },
        ]
      : [],
  }
}

function getMapBounds(map: MapLibreMap): GeoBounds {
  const bounds = map.getBounds()

  return {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  }
}

function collapseCompactAttribution(container: HTMLElement) {
  const attribution = container.querySelector<HTMLDetailsElement>(
    '.maplibregl-ctrl-attrib.maplibregl-compact',
  )

  attribution?.classList.remove('maplibregl-compact-show')
  attribution?.removeAttribute('open')
}

export function Map({
  animals,
  isLocationSelectionEnabled = false,
  observations,
  selectedLocation = null,
  selectedObservationId,
  onBoundsChange,
  onLocationSelect,
  onObservationSelect,
}: MapProps) {
  const { i18n, t } = useTranslation()
  const language: Language = i18n.resolvedLanguage === 'en' ? 'en' : 'ru'
  const fallbackAnimalName = t('observation.label')
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap>(null)
  const animalsRef = useRef(animals)
  const languageRef = useRef(language)
  const fallbackAnimalNameRef = useRef(fallbackAnimalName)
  const observationsRef = useRef(observations)
  const isLocationSelectionEnabledRef = useRef(isLocationSelectionEnabled)
  const onLocationSelectRef = useRef(onLocationSelect)
  const selectedLocationRef = useRef(selectedLocation)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const map = new MapLibreMap({
      attributionControl: false,
      center: MAP_INITIAL_CENTER,
      container,
      dragRotate: false,
      locale: {
        'AttributionControl.ToggleAttribution': t('map.controls.toggleAttribution'),
        'GeolocateControl.FindMyLocation': t('map.controls.findMyLocation'),
        'GeolocateControl.LocationNotAvailable': t('map.controls.locationNotAvailable'),
        'Map.Title': t('map.controls.label'),
        'NavigationControl.ZoomIn': t('map.controls.zoomIn'),
        'NavigationControl.ZoomOut': t('map.controls.zoomOut'),
      },
      pitchWithRotate: false,
      style: MAP_STYLE_URL,
      touchPitch: false,
      zoom: MAP_INITIAL_ZOOM,
    })
    mapRef.current = map
    map.keyboard.disableRotation()
    map.touchZoomRotate.disableRotation()

    map.addControl(new AttributionControl({}), 'bottom-right')
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    const geolocateControl = new GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    })
    map.addControl(geolocateControl, 'top-right')

    map.on('load', () => {
      collapseCompactAttribution(container)

      const styles = getComputedStyle(container)
      addLabelBackground(
        map,
        OBSERVATION_LABEL_BACKGROUND_ID,
        styles.getPropertyValue('--color-surface').trim(),
        styles.getPropertyValue('--color-action-success').trim(),
      )
      addLabelBackground(
        map,
        SELECTED_OBSERVATION_LABEL_BACKGROUND_ID,
        styles.getPropertyValue('--color-action-primary').trim(),
        styles.getPropertyValue('--color-surface').trim(),
      )

      map.addSource(OBSERVATION_SOURCE_ID, {
        type: 'geojson',
        data: toMapFeatureCollection(
          observationsRef.current,
          animalsRef.current,
          languageRef.current,
          fallbackAnimalNameRef.current,
        ),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      map.addSource(LOCATION_SELECTION_SOURCE_ID, {
        type: 'geojson',
        data: toLocationFeatureCollection(selectedLocationRef.current),
      })

      map.addLayer({
        id: LOCATION_SELECTION_LAYER_ID,
        type: 'circle',
        source: LOCATION_SELECTION_SOURCE_ID,
        paint: {
          'circle-color': styles.getPropertyValue('--color-action-primary').trim(),
          'circle-radius': 9,
          'circle-stroke-color': styles.getPropertyValue('--color-surface').trim(),
          'circle-stroke-width': 4,
        },
      })

      map.addLayer({
        id: CLUSTER_LAYER_ID,
        type: 'circle',
        source: OBSERVATION_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': styles.getPropertyValue('--color-action-primary').trim(),
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 22, 50, 28],
          'circle-stroke-color': styles.getPropertyValue('--color-surface').trim(),
          'circle-stroke-width': 3,
        },
      })

      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: 'symbol',
        source: OBSERVATION_SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 12,
        },
        paint: {
          'text-color': styles.getPropertyValue('--color-action-on-primary').trim(),
        },
      })

      map.addLayer({
        id: OBSERVATION_LAYER_ID,
        type: 'circle',
        source: OBSERVATION_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': styles.getPropertyValue('--color-action-success').trim(),
          'circle-radius': 7,
          'circle-stroke-color': styles.getPropertyValue('--color-surface').trim(),
          'circle-stroke-width': 2,
        },
      })

      map.addLayer({
        id: SELECTED_OBSERVATION_LAYER_ID,
        type: 'circle',
        source: OBSERVATION_SOURCE_ID,
        filter: ['==', ['get', 'observationId'], ''],
        paint: {
          'circle-color': styles.getPropertyValue('--color-action-primary').trim(),
          'circle-radius': 8,
          'circle-stroke-color': styles.getPropertyValue('--color-surface').trim(),
          'circle-stroke-width': 3,
        },
      })

      addObservationLabelLayer(map, false, styles.getPropertyValue('--color-text-selected').trim())
      addObservationLabelLayer(
        map,
        true,
        styles.getPropertyValue('--color-action-on-primary').trim(),
      )

      map.on('click', CLUSTER_LAYER_ID, (event) => {
        if (isLocationSelectionEnabledRef.current) {
          return
        }

        const cluster = event.features?.[0]
        const clusterId = getFeatureProperty(cluster?.properties, 'cluster_id')
        const source = map.getSource<GeoJSONSource>(OBSERVATION_SOURCE_ID)

        if (typeof clusterId !== 'number' || !source) {
          return
        }

        void source.getClusterExpansionZoom(clusterId).then((zoom) => {
          if (mapRef.current === map) {
            map.easeTo({ center: event.lngLat, zoom })
          }
        })
      })

      const handleObservationClick = (event: { features?: { properties?: unknown }[] }) => {
        if (isLocationSelectionEnabledRef.current) {
          return
        }

        const observationId = getFeatureProperty(event.features?.[0]?.properties, 'observationId')

        if (typeof observationId === 'string') {
          onObservationSelect(observationId)
        }
      }

      map.on('click', OBSERVATION_LAYER_ID, handleObservationClick)
      map.on('click', OBSERVATION_LABEL_LAYER_ID, handleObservationClick)
      map.on('click', SELECTED_OBSERVATION_LABEL_LAYER_ID, handleObservationClick)

      const showPointerCursor = () => {
        map.getCanvas().style.cursor = isLocationSelectionEnabledRef.current
          ? 'crosshair'
          : 'pointer'
      }
      const hidePointerCursor = () => {
        map.getCanvas().style.cursor = isLocationSelectionEnabledRef.current ? 'crosshair' : ''
      }

      map.on('mouseenter', CLUSTER_LAYER_ID, showPointerCursor)
      map.on('mouseleave', CLUSTER_LAYER_ID, hidePointerCursor)
      map.on('mouseenter', OBSERVATION_LAYER_ID, showPointerCursor)
      map.on('mouseleave', OBSERVATION_LAYER_ID, hidePointerCursor)
      map.on('mouseenter', OBSERVATION_LABEL_LAYER_ID, showPointerCursor)
      map.on('mouseleave', OBSERVATION_LABEL_LAYER_ID, hidePointerCursor)
      map.on('mouseenter', SELECTED_OBSERVATION_LABEL_LAYER_ID, showPointerCursor)
      map.on('mouseleave', SELECTED_OBSERVATION_LABEL_LAYER_ID, hidePointerCursor)

      onBoundsChange(getMapBounds(map))
      geolocateControl.trigger()
    })

    map.on('moveend', () => {
      onBoundsChange(getMapBounds(map))
    })
    map.on('click', (event) => {
      if (isLocationSelectionEnabledRef.current) {
        onLocationSelectRef.current?.({
          latitude: event.lngLat.lat,
          longitude: event.lngLat.lng,
        })
      }
    })
    map.on('resize', () => {
      collapseCompactAttribution(container)
    })

    return () => {
      mapRef.current = null
      map.remove()
    }
  }, [onBoundsChange, onObservationSelect, t])

  useEffect(() => {
    isLocationSelectionEnabledRef.current = isLocationSelectionEnabled
    onLocationSelectRef.current = onLocationSelect

    const map = mapRef.current
    if (map) {
      map.getCanvas().style.cursor = isLocationSelectionEnabled ? 'crosshair' : ''
    }
  }, [isLocationSelectionEnabled, onLocationSelect])

  useEffect(() => {
    observationsRef.current = observations
    const source = mapRef.current?.getSource<GeoJSONSource>(OBSERVATION_SOURCE_ID)

    if (source) {
      void source.setData(
        toMapFeatureCollection(
          observations,
          animalsRef.current,
          languageRef.current,
          fallbackAnimalNameRef.current,
        ),
      )
    }
  }, [observations])

  useEffect(() => {
    animalsRef.current = animals
    const source = mapRef.current?.getSource<GeoJSONSource>(OBSERVATION_SOURCE_ID)

    if (source) {
      void source.setData(
        toMapFeatureCollection(
          observationsRef.current,
          animals,
          languageRef.current,
          fallbackAnimalNameRef.current,
        ),
      )
    }
  }, [animals])

  useEffect(() => {
    languageRef.current = language
    fallbackAnimalNameRef.current = fallbackAnimalName
    const source = mapRef.current?.getSource<GeoJSONSource>(OBSERVATION_SOURCE_ID)

    if (source) {
      void source.setData(
        toMapFeatureCollection(
          observationsRef.current,
          animalsRef.current,
          language,
          fallbackAnimalName,
        ),
      )
    }
  }, [fallbackAnimalName, language])

  useEffect(() => {
    selectedLocationRef.current = selectedLocation
    const source = mapRef.current?.getSource<GeoJSONSource>(LOCATION_SELECTION_SOURCE_ID)

    if (source) {
      void source.setData(toLocationFeatureCollection(selectedLocation))
    }
  }, [selectedLocation])

  useEffect(() => {
    const map = mapRef.current

    if (!map?.getLayer(SELECTED_OBSERVATION_LAYER_ID)) {
      return
    }

    map.setFilter(SELECTED_OBSERVATION_LAYER_ID, [
      '==',
      ['get', 'observationId'],
      selectedObservationId ?? '',
    ])
    map.setFilter(OBSERVATION_LABEL_LAYER_ID, [
      'all',
      ['!', ['has', 'point_count']],
      ['!=', ['get', 'observationId'], selectedObservationId ?? ''],
    ])
    map.setFilter(SELECTED_OBSERVATION_LABEL_LAYER_ID, [
      'all',
      ['!', ['has', 'point_count']],
      ['==', ['get', 'observationId'], selectedObservationId ?? ''],
    ])
  }, [selectedObservationId])

  return <div ref={containerRef} className={styles.map} />
}
