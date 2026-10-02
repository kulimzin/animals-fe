import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnimals } from '../../entities/animal'
import {
  useObservations,
  type ObservationMapQuery,
  type ObservationPeriod,
} from '../../entities/observation'
import {
  AddObservationDialog,
  ObservationCreatedDialog,
  type ObservationDraftLocation,
} from '../../features/add-observation'
import { ObservationDetailsDialog } from '../../features/view-observation'
import type { GeoBounds, GeoPoint } from '../../shared/lib/geo'
import { Button } from '../../shared/ui/Button'
import { Dialog } from '../../shared/ui/Dialog'
import { Icon } from '../../shared/ui/Icon'
import { Map } from '../../widgets/map'
import { MapFilterPanel } from '../../widgets/map-filter-panel'
import styles from './MapPage.module.css'

export function MapPage() {
  const { t } = useTranslation()
  const [overlay, setOverlay] = useState<
    | { type: 'none' }
    | { type: 'filters' }
    | { type: 'observation'; observationId: string }
    | {
        type: 'add-observation'
        mode: 'form' | 'select-location'
        location: ObservationDraftLocation | null
      }
    | { type: 'success'; observationId: string }
  >({ type: 'none' })
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([])
  const [period, setPeriod] = useState<ObservationPeriod>('24h')
  const [bounds, setBounds] = useState<GeoBounds | null>(null)
  const [isFiltersPromptOpen, setIsFiltersPromptOpen] = useState(true)

  const animalsQuery = useAnimals()
  const observationQuery: ObservationMapQuery | null =
    selectedAnimalIds.length > 0 && bounds ? { animalIds: selectedAnimalIds, period, bounds } : null
  const observationsQuery = useObservations(observationQuery)
  const selectedObservationId = overlay.type === 'observation' ? overlay.observationId : null
  const isSelectingLocation =
    overlay.type === 'add-observation' && overlay.mode === 'select-location'

  const handleAnimalIdsChange = (nextAnimalIds: string[]) => {
    setSelectedAnimalIds(nextAnimalIds.slice(0, 5))
  }

  const handlePeriodChange = (nextPeriod: ObservationPeriod) => {
    setPeriod(nextPeriod)
  }

  const handleBoundsChange = useCallback((nextBounds: GeoBounds) => {
    setBounds(nextBounds)
  }, [])

  const handleObservationSelect = useCallback((observationId: string) => {
    setOverlay({ type: 'observation', observationId })
  }, [])

  const handleLocationSelect = useCallback(
    (point: GeoPoint) => {
      setOverlay((currentOverlay) =>
        currentOverlay.type === 'add-observation'
          ? {
              ...currentOverlay,
              location: { label: t('addObservation.selectedOnMap'), point },
              mode: 'form',
            }
          : currentOverlay,
      )
    },
    [t],
  )

  return (
    <main className={styles.page}>
      <Map
        animals={animalsQuery.data ?? []}
        isLocationSelectionEnabled={isSelectingLocation}
        observations={observationsQuery.data ?? []}
        selectedLocation={overlay.type === 'add-observation' ? overlay.location?.point : null}
        selectedObservationId={selectedObservationId}
        onBoundsChange={handleBoundsChange}
        onLocationSelect={handleLocationSelect}
        onObservationSelect={handleObservationSelect}
      />
      {!isSelectingLocation ? (
        <>
          <div className={styles.filterControl}>
            <Button
              aria-expanded={overlay.type === 'filters'}
              aria-haspopup="dialog"
              aria-label={t('map.filters')}
              leadingIcon={<Icon name="filter" />}
              onClick={() => {
                setOverlay({ type: 'filters' })
              }}
            >
              {t('map.filters')}
            </Button>
          </div>
          <div className={styles.addControl}>
            <Button
              aria-label={t('map.addObservation')}
              aria-haspopup="dialog"
              leadingIcon={<Icon name="plus" />}
              onClick={() => {
                setOverlay({ type: 'add-observation', mode: 'form', location: null })
              }}
            >
              {t('map.addObservation')}
            </Button>
          </div>
        </>
      ) : null}
      <Dialog
        closeLabel={t('map.closeFiltersRequired')}
        isOpen={selectedAnimalIds.length === 0 && overlay.type === 'none' && isFiltersPromptOpen}
        maxWidth="28rem"
        onClose={() => setIsFiltersPromptOpen(false)}
        title={t('map.filtersRequiredTitle')}
      >
        <p>{t('map.filtersRequired')}</p>
      </Dialog>
      <Dialog
        closeLabel={t('filters.close')}
        isOpen={overlay.type === 'filters'}
        maxWidth="40rem"
        minHeight="min(38rem, calc(100svh - 3rem))"
        onClose={() => {
          setOverlay({ type: 'none' })
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
      {overlay.type === 'observation' ? (
        <ObservationDetailsDialog
          observationId={overlay.observationId}
          onClose={() => setOverlay({ type: 'none' })}
        />
      ) : null}
      {overlay.type === 'add-observation' ? (
        <AddObservationDialog
          isOpen={overlay.mode === 'form'}
          location={overlay.location}
          onClose={() => setOverlay({ type: 'none' })}
          onLocationChange={(location) =>
            setOverlay((currentOverlay) =>
              currentOverlay.type === 'add-observation'
                ? { ...currentOverlay, location }
                : currentOverlay,
            )
          }
          onSelectLocationOnMap={() =>
            setOverlay((currentOverlay) =>
              currentOverlay.type === 'add-observation'
                ? { ...currentOverlay, mode: 'select-location' }
                : currentOverlay,
            )
          }
          onSuccess={(observationId) => setOverlay({ type: 'success', observationId })}
        />
      ) : null}
      {overlay.type === 'add-observation' && overlay.mode === 'select-location' ? (
        <div className={styles.locationSelection} role="status">
          <span>{t('addObservation.selectingLocation')}</span>
          <Button onClick={() => setOverlay({ ...overlay, mode: 'form' })} variant="secondary">
            {t('common.cancel')}
          </Button>
        </div>
      ) : null}
      {overlay.type === 'success' ? (
        <ObservationCreatedDialog
          onClose={() => setOverlay({ type: 'none' })}
          onViewObservation={() =>
            setOverlay({ type: 'observation', observationId: overlay.observationId })
          }
        />
      ) : null}
    </main>
  )
}
