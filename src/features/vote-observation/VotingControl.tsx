import { useTranslation } from 'react-i18next'
import { type ObservationDetails, type ObservationVote } from '../../entities/observation'
import { Button } from '../../shared/ui/Button'
import { useVoteObservation } from './model/useVoteObservation'
import styles from './VotingControl.module.css'

type VotingControlProps = {
  observation: ObservationDetails
}

export function VotingControl({ observation }: VotingControlProps) {
  const { t } = useTranslation()
  const voteMutation = useVoteObservation(observation.id)

  function handleVote(vote: ObservationVote) {
    voteMutation.mutate(vote)
  }

  return (
    <section aria-label={t('observation.voting.hint')} className={styles.root}>
      <p className={styles.hint}>{t('observation.voting.hint')}</p>
      <div aria-label={t('observation.voting.hint')} className={styles.actions} role="group">
        <Button
          aria-pressed={observation.userVote === 'confirm'}
          className={styles.confirm}
          disabled={voteMutation.isPending}
          onClick={() => handleVote('confirm')}
          variant="success"
        >
          {t('observation.voting.confirm')} · {observation.votes.confirm}
        </Button>
        <Button
          aria-pressed={observation.userVote === 'reject'}
          className={styles.reject}
          disabled={voteMutation.isPending}
          onClick={() => handleVote('reject')}
          variant="danger"
        >
          {t('observation.voting.reject')} · {observation.votes.reject}
        </Button>
      </div>
      {voteMutation.isError ? (
        <p className={styles.error} role="alert">
          {t('observation.voting.error')}
        </p>
      ) : null}
    </section>
  )
}
