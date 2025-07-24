import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router } from 'react-router-dom'
import Routing from "./Pages/Routing";
import { ThemeProvider } from './Pages/SubParts/ThemeProvider.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <ThemeProvider>
    <Router>
    <App />
    </Router>
    </ThemeProvider>
  </StrictMode>,
)
