import { useState } from 'react'
import PageOne from './pages/PageOne'
import PageTwo from './pages/PageTwo'
import PageThree from './pages/PageThree'
import Notification from './pages/Notification'

function App(): React.JSX.Element {
  const [activePage, setActivePage] = useState<'one' | 'two' | 'three' | 'notification'>('one')

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
