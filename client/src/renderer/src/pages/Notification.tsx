import axios, { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'

type NotificationResponse = {
  id: number
  isRemember: boolean
  notificationTime: string
}

function Notification(): React.JSX.Element {
  const [notification, setNotification] = useState<NotificationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotification = async (): Promise<void> => {
      try {
        const { data } = await axios.get<NotificationResponse | NotificationResponse[]>(
          'http://localhost:8080/api/notifications'
        )

        const firstNotification = Array.isArray(data) ? data[0] : data
        setNotification(firstNotification ?? null)
      } catch (err) {
        if (isAxiosError(err)) {
          setError(err.response ? `Request failed: ${err.response.status}` : err.message)
        } else {
          setError('Unable to load notification data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchNotification()
  }, [])

  if (loading) {
    return <p className="page-text">Loading notification...</p>
  }

  if (error) {
    return <p className="page-text">{error}</p>
  }

  if (!notification) {
    return <p className="page-text">No notification found.</p>
  }

  return (
    <div>
      <p className="page-text">Notification time: {notification.notificationTime}</p>
      <p className="page-text">Is remembered: {String(notification.isRemember)}</p>
    </div>
  )
}

export default Notification