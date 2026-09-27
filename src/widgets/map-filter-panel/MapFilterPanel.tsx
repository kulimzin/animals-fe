import { useTranslation } from 'react-i18next'
import type { Animal } from '../../entities/animal'
import type { ObservationPeriod } from '../../entities/observation'
import { AnimalSelector } from '../../features/select-animals'
import styles from './MapFilterPanel.module.css'

const periods: ObservationPeriod[] = ['1h', '24h', '7d', '30d']

type MapFilterPanelProps = {
  animals: Animal[]
  isAnimalsLoading: boolean
  selectedAnimalIds: string[]
  period: ObservationPeriod
  onAnimalIdsChange: (animalIds: string[]) => void
  onPeriodChange: (period: ObservationPeriod) => void
}

export function MapFilterPanel({
  animals,
  isAnimalsLoading,
  selectedAnimalIds,
  period,
  onAnimalIdsChange,
  onPeriodChange,
}: MapFilterPanelProps) {
  const { t } = useTranslation()

  return (
    <section className={styles.panel}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>{t('filters.animals')}</legend>
        <div className={styles.animalSelector}>
          <AnimalSelector
            animals={animals}
            isLoading={isAnimalsLoading}
            onChange={onAnimalIdsChange}
            selectedAnimalIds={selectedAnimalIds}
          />
        </div>
      </fieldset>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>{t('filters.period')}</legend>
        <div className={styles.options}>
          {periods.map((periodOption) => {
            const isSelected = periodOption === period

            return (
              <button
                aria-pressed={isSelected}
                className={[styles.option, isSelected && styles.isSelected]
                  .filter(Boolean)
                  .join(' ')}
                key={periodOption}
                onClick={() => {
                  onPeriodChange(periodOption)
                }}
                type="button"
              >
                {t(`filters.periods.${periodOption}`)}
              </button>
            )
          })}
        </div>
      </fieldset>
    </section>
  )
}
