import { useState, type FormEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useAnimals } from '../../entities/animal'
import type { GeoPoint } from '../../shared/lib/geo'
import { Button } from '../../shared/ui/Button'
import { Dialog } from '../../shared/ui/Dialog'
import { Icon } from '../../shared/ui/Icon'
import { Input } from '../../shared/ui/Input'
import { Textarea } from '../../shared/ui/Textarea'
import { AnimalSelector } from '../select-animals'
import styles from './AddObservationDialog.module.css'
import { useCreateObservation } from './model/useCreateObservation'

const formSchema = z.object({
  animalIds: z.array(z.string()).length(1),
  date: z.string().min(1),
  time: z.string().min(1),
  note: z.string(),
})

type FormFields = z.infer<typeof formSchema>

export type ObservationDraftLocation = {
  label: string
  point: GeoPoint
}

type AddObservationDialogProps = {
  isOpen: boolean
  location: ObservationDraftLocation | null
  onClose: () => void
  onLocationChange: (location: ObservationDraftLocation) => void
  onSelectLocationOnMap: () => void
  onSuccess: (observationId: string) => void
}

function getLocalDateTime() {
  const now = new Date()
  const timezoneOffset = now.getTimezoneOffset() * 60_000
  const localIsoDate = new Date(now.getTime() - timezoneOffset).toISOString()

  return { date: localIsoDate.slice(0, 10), time: localIsoDate.slice(11, 16) }
}

export function AddObservationDialog({
  isOpen,
  location,
  onClose,
  onLocationChange,
  onSelectLocationOnMap,
  onSuccess,
}: AddObservationDialogProps) {
  const { t } = useTranslation()
  const animalsQuery = useAnimals()
  const createObservationMutation = useCreateObservation()
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const localDateTime = getLocalDateTime()
  const {
    clearErrors,
    control,
    formState: { errors },
    getValues,
    register,
    setError,
    setValue,
  } = useForm<FormFields>({
    defaultValues: { animalIds: [], note: '', ...localDateTime },
  })
  const selectedAnimalIds = useWatch({ control, name: 'animalIds' })

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError(t('addObservation.currentLocationError'))
      return
    }

    setIsLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          label: t('addObservation.currentLocation'),
          point: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        })
        setIsLocating(false)
      },
      () => {
        setLocationError(t('addObservation.currentLocationError'))
        setIsLocating(false)
      },
      { enableHighAccuracy: true },
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearErrors()

    const fields = getValues()
    const parsedFields = formSchema.safeParse(fields)

    if (!parsedFields.success) {
      for (const issue of parsedFields.error.issues) {
        const fieldName = issue.path[0]

        if (fieldName === 'animalIds' || fieldName === 'date' || fieldName === 'time') {
          setError(fieldName, { message: t('addObservation.required') })
        }
      }
    }

    setLocationError(location ? null : t('addObservation.locationRequired'))

    if (!parsedFields.success || !location) {
      return
    }

    const [animalId] = parsedFields.data.animalIds
    if (!animalId) {
      return
    }

    const observedAt = new Date(`${parsedFields.data.date}T${parsedFields.data.time}`).toISOString()

    createObservationMutation.mutate(
      {
        animalId,
        location: { ...location.point, label: location.label },
        note: parsedFields.data.note,
        observedAt,
      },
      { onSuccess: (observation) => onSuccess(observation.id) },
    )
  }

  const footer = (
    <div className={styles.actions}>
      <Button onClick={onClose} variant="secondary">
        {t('common.cancel')}
      </Button>
      <Button
        form="add-observation-form"
        isLoading={createObservationMutation.isPending}
        type="submit"
      >
        {t('addObservation.publish')}
      </Button>
    </div>
  )

  return (
    <Dialog
      closeLabel={t('addObservation.close')}
      footer={footer}
      isOpen={isOpen}
      maxWidth="36rem"
      onClose={onClose}
      title={t('addObservation.title')}
    >
      <form className={styles.form} id="add-observation-form" noValidate onSubmit={handleSubmit}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.label}>
            {t('addObservation.animal')} <span aria-hidden="true">*</span>
          </legend>
          <AnimalSelector
            ariaLabel={t('addObservation.animal')}
            animals={animalsQuery.data ?? []}
            isLoading={animalsQuery.isPending}
            limitReachedText={t('addObservation.animalLimitReached')}
            maxSelected={1}
            onChange={(animalIds) => {
              setValue('animalIds', animalIds.slice(0, 1))
              clearErrors('animalIds')
            }}
            placeholder={t('addObservation.chooseAnimal')}
            selectedAnimalIds={selectedAnimalIds}
          />
          {errors.animalIds ? <p className={styles.error}>{errors.animalIds.message}</p> : null}
          {animalsQuery.isError ? (
            <div className={styles.loadError} role="alert">
              <span>{t('addObservation.animalsError')}</span>
              <Button onClick={() => void animalsQuery.refetch()} variant="secondary">
                {t('common.retry')}
              </Button>
            </div>
          ) : null}
        </fieldset>
        <fieldset className={styles.fieldset}>
          <legend className={styles.label}>
            {t('addObservation.location')} <span aria-hidden="true">*</span>
          </legend>
          {location ? (
            <div className={styles.locationValue}>
              <Icon name="mapPin" />
              <span>
                <strong>{location.label}</strong>
                <small>
                  {t('addObservation.locationCoordinates', {
                    latitude: location.point.latitude.toFixed(5),
                    longitude: location.point.longitude.toFixed(5),
                  })}
                </small>
              </span>
            </div>
          ) : (
            <p className={styles.locationEmpty}>{t('addObservation.locationEmpty')}</p>
          )}
          <div className={styles.locationActions}>
            <Button
              isLoading={isLocating}
              leadingIcon={<Icon name="mapPin" />}
              onClick={handleUseCurrentLocation}
              variant="secondary"
            >
              {t('addObservation.useCurrentLocation')}
            </Button>
            <Button
              onClick={() => {
                setLocationError(null)
                onSelectLocationOnMap()
              }}
              variant="secondary"
            >
              {t('addObservation.selectOnMap')}
            </Button>
          </div>
          {locationError ? (
            <p className={styles.error} role="alert">
              {locationError}
            </p>
          ) : null}
        </fieldset>
        <div className={styles.dateTime}>
          <Input
            {...register('date')}
            error={errors.date?.message}
            label={t('addObservation.date')}
            required
            type="date"
          />
          <Input
            {...register('time')}
            error={errors.time?.message}
            label={t('addObservation.time')}
            required
            type="time"
          />
        </div>
        <Textarea
          {...register('note')}
          label={t('addObservation.note')}
          placeholder={t('addObservation.notePlaceholder')}
        />
        {createObservationMutation.isError ? (
          <p className={styles.submitError} role="alert">
            {t('addObservation.submitError')}
          </p>
        ) : null}
      </form>
    </Dialog>
  )
}
