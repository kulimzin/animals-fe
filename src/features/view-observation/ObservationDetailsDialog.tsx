import { useTranslation } from 'react-i18next'
import { useAnimals } from '../../entities/animal'
import { useObservation } from '../../entities/observation'
import { Button } from '../../shared/ui/Button'
import { AnimalIcon } from '../../shared/ui/AnimalIcon'
import { Dialog } from '../../shared/ui/Dialog'
import { VotingControl } from '../vote-observation'
import styles from './ObservationDetailsDialog.module.css'

type ObservationDetailsDialogProps = {
  observationId: string
  onClose: () => void
}

export function ObservationDetailsDialog({
  observationId,
  onClose,
}: ObservationDetailsDialogProps) {
  const { i18n, t } = useTranslation()
  const observationQuery = useObservation(observationId)
  const animalsQuery = useAnimals()
  const observation = observationQuery.data
  const animal = animalsQuery.data?.find(({ id }) => id === observation?.animalId)
  const language = i18n.resolvedLanguage === 'en' ? 'en' : 'ru'
  const locale = language === 'en' ? 'en-GB' : 'ru-RU'
  const dialogLabel = animal
    ? t('observation.labelWithAnimal', { animal: animal.name[language] })
    : t('observation.label')

  let content

  if (observationQuery.isPending || animalsQuery.isPending) {
    content = (
      <p className={styles.status} role="status">
        {t('observation.loading')}
      </p>
    )
  } else if (observationQuery.isError || animalsQuery.isError) {
    content = (
      <div className={styles.state}>
        <p className={styles.error} role="alert">
          {t('observation.error')}
        </p>
        <Button
          onClick={() => {
            void observationQuery.refetch()
            void animalsQuery.refetch()
          }}
          variant="secondary"
        >
          {t('common.retry')}
        </Button>
      </div>
    )
  } else if (!observation || !animal) {
    content = <p className={styles.status}>{t('observation.notFound')}</p>
  } else {
    const observedAt = new Date(observation.observedAt)
    const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(observedAt)
    const formattedTime = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(observedAt)

    content = (
      <div className={styles.content}>
        <div className={styles.animal}>
          <span aria-hidden="true" className={styles.animalIcon}>
            <AnimalIcon size={28} slug={animal.slug} />
          </span>
          <strong>{animal.name[language]}</strong>
        </div>
        <dl className={styles.details}>
          <div className={styles.detail}>
            <dt>{t('observation.date')}</dt>
            <dd>{formattedDate}</dd>
          </div>
          <div className={styles.detail}>
            <dt>{t('observation.time')}</dt>
            <dd>{formattedTime}</dd>
          </div>
          <div className={[styles.detail, styles.fullWidth].join(' ')}>
            <dt>{t('observation.location')}</dt>
            <dd>
              {observation.location.label}
              <span className={styles.coordinates}>
                {observation.location.latitude.toFixed(5)},{' '}
                {observation.location.longitude.toFixed(5)}
              </span>
            </dd>
          </div>
          {observation.note ? (
            <div className={[styles.detail, styles.fullWidth].join(' ')}>
              <dt>{t('observation.note')}</dt>
              <dd>{observation.note}</dd>
            </div>
          ) : null}
        </dl>
        <VotingControl observation={observation} />
      </div>
    )
  }

  return (
    <Dialog
      ariaLabel={dialogLabel}
      closeLabel={t('observation.close')}
      isOpen
      maxWidth="35rem"
      onClose={onClose}
    >
      {content}
    </Dialog>
  )
}
