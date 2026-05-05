import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'

import Navbar from './component/navbar'
import Home from './pages/Home'
import Editor from './pages/Editor'

import { PrimeReactProvider} from 'primereact/api';
        

function App() {


  return (
    <>
    <Navbar />
    <PrimeReactProvider>
      <BrowserRouter>
      
        <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/editor' element={<Editor />} />
        
        </Routes>
      </BrowserRouter>
    </PrimeReactProvider>
    </>
  )
}

export default App
