import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { EventModalProvider } from './contexts/EventModalContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <EventModalProvider>
        <App />
      </EventModalProvider>
    </AuthProvider>
  </StrictMode>,
)
