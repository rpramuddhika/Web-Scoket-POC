import { Client } from '@stomp/stompjs'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Notification from './pages/Notification'
import PageOne from './pages/PageOne'
import PageThree from './pages/PageThree'
import PageTwo from './pages/PageTwo'

type NotificationMessage = {
  id: number
  isRemember: boolean
  notificationTime: string
}

function App(): React.JSX.Element {
  const [activePage, setActivePage] = useState<'one' | 'two' | 'three' | 'notification'>('one')

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws/websocket',
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/notifications', (message) => {
          const body: NotificationMessage = JSON.parse(message.body)
          toast.info(`Notification at ${body.notificationTime}`, {
            position: 'top-right',
            autoClose: 5000
          })
        })
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame.headers['message'])
      }
    })

    client.activate()

    return () => {
      client.deactivate()
    }
  }, [])

  const renderPage = (): React.JSX.Element => {
    switch (activePage) {
      case 'one':
        return <PageOne />
      case 'two':
        return <PageTwo />
      case 'three':
        return <PageThree />
      case 'notification':
        return <Notification />
    }
  }

  return (
    <div className="app-layout">
      <aside className="side-nav">
        <h1 className="nav-title">Pages</h1>
        <button
          className={`nav-item ${activePage === 'one' ? 'active' : ''}`}
          onClick={() => setActivePage('one')}
        >
          One
        </button>
        <button
          className={`nav-item ${activePage === 'two' ? 'active' : ''}`}
          onClick={() => setActivePage('two')}
        >
          Two
        </button>
        <button
          className={`nav-item ${activePage === 'three' ? 'active' : ''}`}
          onClick={() => setActivePage('three')}
        >
          Three
        </button>
        <button
          className={`nav-item ${activePage === 'notification' ? 'active' : ''}`}
          onClick={() => setActivePage('notification')}
        >
          Notification
        </button>
      </aside>

      <main className="page-content">
        <h2 className="page-heading">{activePage.toUpperCase()} PAGE</h2>
        {renderPage()}
      </main>
    </div>
  )
}

export default App
