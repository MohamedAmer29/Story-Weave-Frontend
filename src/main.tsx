import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/gsap'
import App from './App.tsx'
import CursorFollower from './components/ui/CursorFollower'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <CursorFollower />
  </StrictMode>,
)
