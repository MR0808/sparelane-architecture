import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LikeC4ModelProvider } from 'likec4:react'
import { App } from './App'
import './styles/global.css'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element #root not found')
}

createRoot(root).render(
  <StrictMode>
    <LikeC4ModelProvider>
      <App />
    </LikeC4ModelProvider>
  </StrictMode>,
)
