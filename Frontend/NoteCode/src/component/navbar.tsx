import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useAuth()
  const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:6066'

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/user/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      logout()
      navigate('/')
    }
  }

  return (
    <nav className="flex flex-row justify-between items-center p-4 bg-blue-300">
      <div className="text-3xl text-blue-700 cursor-pointer" onClick={() => navigate('/')}>
        NoteCode
      </div>
      <ul className="flex flex-row space-x-4 items-center">
        <li>
          <a href="/" className="text-blue-700 hover:text-blue-900">
            Home
          </a>
        </li>
        {!isLoggedIn ? (
          <>
            <li>
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Login
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Sign Up
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="text-blue-700 font-semibold">{user?.name}</li>
            <li>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navbar