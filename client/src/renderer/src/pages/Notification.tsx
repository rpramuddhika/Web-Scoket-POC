import axios, { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

type NotificationResponse = {
  id: number
  isRemember: boolean
  notificationTime: string
}

type NotificationFormValues = {
  notificationTime: string
  isRemember: number
}

function Notification(): React.JSX.Element {
  const [notification, setNotification] = useState<NotificationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<NotificationFormValues>()

  const fetchNotification = async (): Promise<void> => {
    try {
      const { data } = await axios.get<NotificationResponse | NotificationResponse[]>(
        'http://localhost:8080/api/notifications'
      )
      const first = Array.isArray(data) ? data[0] : data
      setNotification(first ?? null)
      if (first) {
        reset({
          notificationTime: first.notificationTime,
          isRemember: first.isRemember ? 1 : 0
        })
      }
    } catch (err) {
      if (isAxiosError(err)) {
        setFetchError(err.response ? `Request failed: ${err.response.status}` : err.message)
      } else {
        setFetchError('Unable to load notification data')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotification()
  }, [])

  const onSubmit = async (values: NotificationFormValues): Promise<void> => {
    try {
      setSaveSuccess(false)
      const { data } = await axios.put<NotificationResponse>(
        'http://localhost:8080/api/notifications',
        {
          notificationTime: values.notificationTime,
          isRemember: Number(values.isRemember)
        }
      )
      setNotification(data)
      setSaveSuccess(true)
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response
          ? `Save failed: ${err.response.status}`
          : err.message
        : 'Unable to save notification'
      setError('root', { message })
    }
  }

  if (loading) {
    return <p className="page-text">Loading notification...</p>
  }

  if (fetchError) {
    return <p className="page-text">{fetchError}</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 320 }}>
      {notification && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p className="page-text">Notification time: {notification.notificationTime}</p>
          <p className="page-text">Is remembered: {String(notification.isRemember)}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="page-text" style={{ fontSize: 14 }}>
            Notification Time
          </label>
          <input
            type="time"
            step="1"
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid #4d6074',
              background: '#1b2430',
              color: '#d7deea',
              fontSize: 14
            }}
            {...register('notificationTime', { required: 'Time is required' })}
          />
          {errors.notificationTime && (
            <span style={{ color: '#f87171', fontSize: 12 }}>
              {errors.notificationTime.message}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" id="isRemember" {...register('isRemember')} value={1} />
          <label htmlFor="isRemember" className="page-text" style={{ fontSize: 14, margin: 0 }}>
            Remember
          </label>
        </div>

        {errors.root && (
          <span style={{ color: '#f87171', fontSize: 12 }}>{errors.root.message}</span>
        )}
        {saveSuccess && (
          <span style={{ color: '#4ade80', fontSize: 12 }}>Saved successfully</span>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 16px',
            borderRadius: 6,
            border: '1px solid #6f8daa',
            background: '#2f455e',
            color: '#ffffff',
            fontSize: 14,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}

export default Notification