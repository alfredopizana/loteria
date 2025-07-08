import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ImageProvider } from './provider/ImageProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ImageProvider>
      <App />
    </ImageProvider>
  </StrictMode>,
)
