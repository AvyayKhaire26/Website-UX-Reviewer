import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ServiceProvider } from './contexts/ServiceContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServiceProvider>
      <App />
    </ServiceProvider>
  </React.StrictMode>,
)
