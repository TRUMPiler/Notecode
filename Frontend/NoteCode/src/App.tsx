import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'

import Navbar from './component/navbar'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Auth from './pages/Auth'
import { AuthProvider } from './context/AuthContext'

import { PrimeReactProvider } from 'primereact/api'

function App() {
  return (
    <>
      <AuthProvider>
   
        <PrimeReactProvider>
          <BrowserRouter>
               <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </BrowserRouter>
        </PrimeReactProvider>
      </AuthProvider>
    </>
  )
}

export default App
