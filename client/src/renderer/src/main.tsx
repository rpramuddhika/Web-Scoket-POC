import './assets/main.css'
import 'react-toastify/dist/ReactToastify.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Bounce, ToastContainer } from 'react-toastify'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastContainer
      position="top-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
    <App />
  </StrictMode>
)
