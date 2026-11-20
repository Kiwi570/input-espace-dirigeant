import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { StoreProvider } from './lib/store'
import { installerTypo } from './lib/typo'
import './index.css'

const root = document.getElementById('root')!
installerTypo(root)
createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <StoreProvider>
          <App />
        </StoreProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
