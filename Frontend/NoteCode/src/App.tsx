import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './component/navbar'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Auth from './pages/Auth'
import ViewNote from './pages/ViewNote'
import { PrimeReactProvider } from 'primereact/api'
import { SidebarProvider } from './components/ui/sidebar'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import { GoogleOAuthProvider } from '@react-oauth/google'


function App() {
  return (
    <>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <PrimeReactProvider>
          <SidebarProvider defaultOpen={false}>
            <BrowserRouter>
              <main className="flex-1 w-full flex flex-col min-h-screen">
                <Navbar />
                <Routes>
                  <Route path="/editor" element={<Editor />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/view/:id" element={<ViewNote />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/" element={<Home />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </BrowserRouter>
          </SidebarProvider>
        </PrimeReactProvider>
      </GoogleOAuthProvider>
    </>
  )
}

export default App
