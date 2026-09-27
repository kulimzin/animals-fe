import { useCallback, useState } from 'react'
import { useAnimals } from '../../entities/animal'
import {
  useObservations,
  type ObservationMapQuery,
  type ObservationPeriod,
} from '../../entities/observation'
import type { GeoBounds } from '../../shared/lib/geo'
import { Map } from '../../widgets/map'
import { MapFilterPanel } from '../../widgets/map-filter-panel'
import styles from './MapPage.module.css'

export function MapPage() {
  const [selectedObservationId, setSelectedObservationId] = useState<string | null>(null)
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([])
  const [period, setPeriod] = useState<ObservationPeriod>('24h')
  const [bounds, setBounds] = useState<GeoBounds | null>(null)

  const animalsQuery = useAnimals()
  const observationQuery: ObservationMapQuery | null =
    selectedAnimalIds.length > 0 && bounds ? { animalIds: selectedAnimalIds, period, bounds } : null
  const observationsQuery = useObservations(observationQuery)

  const handleAnimalIdsChange = (nextAnimalIds: string[]) => {
    setSelectedObservationId(null)
    setSelectedAnimalIds(nextAnimalIds.slice(0, 5))
  }

  const handlePeriodChange = (nextPeriod: ObservationPeriod) => {
    setSelectedObservationId(null)
    setPeriod(nextPeriod)
  }

  const handleBoundsChange = useCallback((nextBounds: GeoBounds) => {
    setBounds(nextBounds)
  }, [])

  return (
    <main className={styles.page}>
      <Map
        observations={observationsQuery.data ?? []}
        selectedObservationId={selectedObservationId}
        onBoundsChange={handleBoundsChange}
        onObservationSelect={setSelectedObservationId}
      />
      <MapFilterPanel
        animals={animalsQuery.data ?? []}
        isAnimalsLoading={animalsQuery.isPending}
        period={period}
        selectedAnimalIds={selectedAnimalIds}
        onAnimalIdsChange={handleAnimalIdsChange}
        onPeriodChange={handlePeriodChange}
      />
    </main>
  )
}
