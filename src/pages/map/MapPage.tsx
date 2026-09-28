import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnimals } from '../../entities/animal'
import {
  useObservations,
  type ObservationMapQuery,
  type ObservationPeriod,
} from '../../entities/observation'
import { ObservationDetailsDialog } from '../../features/view-observation'
import type { GeoBounds } from '../../shared/lib/geo'
import { Button } from '../../shared/ui/Button'
import { Dialog } from '../../shared/ui/Dialog'
import { Icon } from '../../shared/ui/Icon'
import { Map } from '../../widgets/map'
import { MapFilterPanel } from '../../widgets/map-filter-panel'
import styles from './MapPage.module.css'

export function MapPage() {
  const { t } = useTranslation()
  const [selectedObservationId, setSelectedObservationId] = useState<string | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
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
      <div className={styles.filterControl}>
        <Button
          aria-expanded={isFiltersOpen}
          aria-haspopup="dialog"
          aria-label={t('map.filters')}
          leadingIcon={<Icon name="filter" />}
          onClick={() => {
            setIsFiltersOpen(true)
          }}
        >
          {t('map.filters')}
        </Button>
      </div>
      <Dialog
        closeLabel={t('filters.close')}
        isOpen={isFiltersOpen}
        maxWidth="40rem"
        minHeight="min(38rem, calc(100svh - 3rem))"
        onClose={() => {
          setIsFiltersOpen(false)
        }}
        title={t('filters.label')}
      >
        <MapFilterPanel
          animals={animalsQuery.data ?? []}
          isAnimalsLoading={animalsQuery.isPending}
          period={period}
          selectedAnimalIds={selectedAnimalIds}
          onAnimalIdsChange={handleAnimalIdsChange}
          onPeriodChange={handlePeriodChange}
        />
      </Dialog>
      {selectedObservationId ? (
        <ObservationDetailsDialog
          observationId={selectedObservationId}
          onClose={() => setSelectedObservationId(null)}
        />
      ) : null}
    </main>
  )
}
