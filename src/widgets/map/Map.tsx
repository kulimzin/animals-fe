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
import { createAnimalIconImage } from '../../shared/ui/AnimalIcon'
import styles from './Map.module.css'

setWorkerUrl(mapLibreWorkerUrl)

const OBSERVATION_SOURCE_ID = 'observations'
const CLUSTER_LAYER_ID = 'observation-clusters'
const CLUSTER_COUNT_LAYER_ID = 'observation-cluster-count'
const OBSERVATION_LAYER_ID = 'observation-points'
const OBSERVATION_ICON_LAYER_ID = 'observation-icons'
const SELECTED_OBSERVATION_LAYER_ID = 'selected-observation-point'
const LOCATION_SELECTION_SOURCE_ID = 'location-selection'
const LOCATION_SELECTION_LAYER_ID = 'location-selection-point'

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

const ANIMAL_ICON_ID_PREFIX = 'animal-icon-'
const FALLBACK_ANIMAL_ICON_ID = `${ANIMAL_ICON_ID_PREFIX}fallback`

function getAnimalIconId(slug: string) {
  return `${ANIMAL_ICON_ID_PREFIX}${slug}`
}

function toMapFeatureCollection(observations: ObservationMapItem[], animals: Animal[]) {
  const animalSlugById = new globalThis.Map(animals.map((animal) => [animal.id, animal.slug]))
  const collection = toObservationFeatureCollection(observations)

  return {
    ...collection,
    features: collection.features.map((feature) => {
      const slug = animalSlugById.get(feature.properties.animalId)

      return {
        ...feature,
        properties: {
          ...feature.properties,
          animalIcon: slug ? getAnimalIconId(slug) : FALLBACK_ANIMAL_ICON_ID,
        },
      }
    }),
  }
}

function addObservationIconLayer(map: MapLibreMap) {
  if (map.getLayer(OBSERVATION_ICON_LAYER_ID)) {
    return
  }

  map.addLayer({
    id: OBSERVATION_ICON_LAYER_ID,
    type: 'symbol',
    source: OBSERVATION_SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-allow-overlap': true,
      'icon-image': ['get', 'animalIcon'],
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
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap>(null)
  const animalsRef = useRef(animals)
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
    map.setMissingStyleImageResolver(async (imageId) => {
      if (!imageId.startsWith(ANIMAL_ICON_ID_PREFIX) || map.hasImage(imageId)) {
        return
      }

      const slug =
        imageId === FALLBACK_ANIMAL_ICON_ID ? '' : imageId.slice(ANIMAL_ICON_ID_PREFIX.length)
      const color = getComputedStyle(container).getPropertyValue('--color-action-on-primary').trim()
      const image = await createAnimalIconImage(slug, color)

      if (mapRef.current === map && !map.hasImage(imageId)) {
        map.addImage(imageId, image, { pixelRatio: 2 })
      }
    })
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

      map.addSource(OBSERVATION_SOURCE_ID, {
        type: 'geojson',
        data: toMapFeatureCollection(observationsRef.current, animalsRef.current),
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
          'circle-color': styles.getPropertyValue('--color-animal').trim(),
          'circle-radius': 13,
          'circle-stroke-color': styles.getPropertyValue('--color-surface').trim(),
          'circle-stroke-width': 3,
        },
      })

      map.addLayer({
        id: SELECTED_OBSERVATION_LAYER_ID,
        type: 'circle',
        source: OBSERVATION_SOURCE_ID,
        filter: ['==', ['get', 'observationId'], ''],
        paint: {
          'circle-color': styles.getPropertyValue('--color-animal').trim(),
          'circle-radius': 16,
          'circle-stroke-color': styles.getPropertyValue('--color-text-selected').trim(),
          'circle-stroke-width': 4,
        },
      })

      addObservationIconLayer(map)

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

      map.on('click', OBSERVATION_LAYER_ID, (event) => {
        if (isLocationSelectionEnabledRef.current) {
          return
        }

        const observationId = getFeatureProperty(event.features?.[0]?.properties, 'observationId')

        if (typeof observationId === 'string') {
          onObservationSelect(observationId)
        }
      })

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
      void source.setData(toMapFeatureCollection(observations, animalsRef.current))
    }
  }, [observations])

  useEffect(() => {
    animalsRef.current = animals
    const source = mapRef.current?.getSource<GeoJSONSource>(OBSERVATION_SOURCE_ID)

    if (source) {
      void source.setData(toMapFeatureCollection(observationsRef.current, animals))
    }
  }, [animals])

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
  }, [selectedObservationId])

  return <div ref={containerRef} className={styles.map} />
}
