import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './component/navbar'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Auth from './pages/Auth'
import ViewNote from './pages/ViewNote'
import { AuthProvider } from './context/AuthContext'
import { PrimeReactProvider } from 'primereact/api'
import { SidebarProvider } from './components/ui/sidebar'


function App() {
  return (
    <>
      <AuthProvider>
        <PrimeReactProvider>
          <SidebarProvider defaultOpen={false}>
            <BrowserRouter>
              <main className="flex-1 w-full flex flex-col min-h-screen">
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/editor" element={<Editor />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/view/:id" element={<ViewNote />} />
                </Routes>
              </main>
            </BrowserRouter>
          </SidebarProvider>
        </PrimeReactProvider>
      </AuthProvider>
    </>
  )
}

export default App
