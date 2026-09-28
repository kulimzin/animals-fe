import { useTranslation } from 'react-i18next'
import { Button } from '../../shared/ui/Button'
import { Dialog } from '../../shared/ui/Dialog'
import styles from './AddObservationDialog.module.css'

type ObservationCreatedDialogProps = {
  onClose: () => void
  onViewObservation: () => void
}

export function ObservationCreatedDialog({
  onClose,
  onViewObservation,
}: ObservationCreatedDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog
      closeLabel={t('addObservation.successClose')}
      footer={
        <div className={styles.actions}>
          <Button onClick={onClose} variant="secondary">
            {t('common.done')}
          </Button>
          <Button onClick={onViewObservation}>{t('addObservation.view')}</Button>
        </div>
      }
      isOpen
      maxWidth="30rem"
      onClose={onClose}
      title={t('addObservation.successTitle')}
    >
      <p className={styles.successMessage}>{t('addObservation.successMessage')}</p>
    </Dialog>
  )
}
