import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ContentProvider } from './context/ContentContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ContentProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ContentProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
