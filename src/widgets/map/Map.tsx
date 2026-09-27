import { useEffect, useRef } from 'react'
import { Map as MapLibreMap, NavigationControl, ScaleControl, setWorkerUrl } from 'maplibre-gl'
import type { GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { toObservationFeatureCollection, type ObservationMapItem } from '../../entities/observation'
import { MAP_INITIAL_CENTER, MAP_INITIAL_ZOOM, MAP_STYLE_URL } from '../../shared/config/map'
import type { GeoBounds } from '../../shared/lib/geo'
import styles from './Map.module.css'

setWorkerUrl(mapLibreWorkerUrl)

const OBSERVATION_SOURCE_ID = 'observations'
const CLUSTER_LAYER_ID = 'observation-clusters'
const CLUSTER_COUNT_LAYER_ID = 'observation-cluster-count'
const OBSERVATION_LAYER_ID = 'observation-points'
const SELECTED_OBSERVATION_LAYER_ID = 'selected-observation-point'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getFeatureProperty(properties: unknown, propertyName: string): unknown {
  return isRecord(properties) ? properties[propertyName] : undefined
}

type MapProps = {
  observations: ObservationMapItem[]
  selectedObservationId: string | null
  onBoundsChange: (bounds: GeoBounds) => void
  onObservationSelect: (observationId: string) => void
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

export function Map({
  observations,
  selectedObservationId,
  onBoundsChange,
  onObservationSelect,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap>(null)
  const observationsRef = useRef(observations)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const map = new MapLibreMap({
      center: MAP_INITIAL_CENTER,
      container,
      style: MAP_STYLE_URL,
      zoom: MAP_INITIAL_ZOOM,
    })
    mapRef.current = map

    map.addControl(new NavigationControl(), 'top-right')
    map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left')

    map.on('load', () => {
      const styles = getComputedStyle(container)

      map.addSource(OBSERVATION_SOURCE_ID, {
        type: 'geojson',
        data: toObservationFeatureCollection(observationsRef.current),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
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
          'circle-radius': 8,
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
          'circle-radius': 11,
          'circle-stroke-color': styles.getPropertyValue('--color-text-selected').trim(),
          'circle-stroke-width': 4,
        },
      })

      map.on('click', CLUSTER_LAYER_ID, (event) => {
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
        const observationId = getFeatureProperty(event.features?.[0]?.properties, 'observationId')

        if (typeof observationId === 'string') {
          onObservationSelect(observationId)
        }
      })

      const showPointerCursor = () => {
        map.getCanvas().style.cursor = 'pointer'
      }
      const hidePointerCursor = () => {
        map.getCanvas().style.cursor = ''
      }

      map.on('mouseenter', CLUSTER_LAYER_ID, showPointerCursor)
      map.on('mouseleave', CLUSTER_LAYER_ID, hidePointerCursor)
      map.on('mouseenter', OBSERVATION_LAYER_ID, showPointerCursor)
      map.on('mouseleave', OBSERVATION_LAYER_ID, hidePointerCursor)

      onBoundsChange(getMapBounds(map))
    })

    map.on('moveend', () => {
      onBoundsChange(getMapBounds(map))
    })

    return () => {
      mapRef.current = null
      map.remove()
    }
  }, [onBoundsChange, onObservationSelect])

  useEffect(() => {
    observationsRef.current = observations
    const source = mapRef.current?.getSource<GeoJSONSource>(OBSERVATION_SOURCE_ID)

    if (source) {
      void source.setData(toObservationFeatureCollection(observations))
    }
  }, [observations])

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
