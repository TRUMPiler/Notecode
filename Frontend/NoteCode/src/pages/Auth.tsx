import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/auth.scss'

interface LoginFormData {
  email: string
  password: string
}

interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function Auth() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:6066'

  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: '',
    password: '',
  })

  const [signupForm, setSignupForm] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignupForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginForm),
      })

      const data = await response.json()

      if (response.ok && data.data?.user) {
        setSuccess('Login successful!')
        const userData = data.data.user
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('Login successful:', data)
        // Redirect to home after a short delay
        setTimeout(() => navigate('/'), 1000)
      } else {
        setError(data.error || data.message || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please check your backend connection.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          confirmPassword: signupForm.confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok || data.success) {
        const userData = data?.data?.user
        if (userData) {
          setSuccess('Signup successful! Redirecting...')
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          setSignupForm({ name: '', email: '', password: '', confirmPassword: '' })
          setTimeout(() => navigate('/'), 1500)
        } else {
          setSuccess('Signup successful! Please login.')
          setSignupForm({ name: '', email: '', password: '', confirmPassword: '' })
          setTimeout(() => setIsLogin(true), 1500)
        }
      } else {
        setError(data.error || data.message || 'Signup failed')
      }
    } catch (err) {
      setError('Network error. Please check your backend connection.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshTemp = async () => {
    try {
      await fetch(`${BACKEND_URL}/user/refresh`, { method: 'POST', credentials: 'include' })
    } catch (err) {
      console.warn('refresh failed', err)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch(`${BACKEND_URL}/user/logout`, { method: 'POST', credentials: 'include' })
      setSuccess('')
      setError('')
      setLoginForm({ email: '', password: '' })
      setSignupForm({ name: '', email: '', password: '', confirmPassword: '' })
      setUser(null)
      localStorage.removeItem('user')
      navigate('/')
    } catch (err) {
      setError('Logout failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTemp()
    const id = setInterval(() => refreshTemp(), 14 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>NoteCode</h1>
          <p>Your coding notebook</p>
        </div>

        <div className="auth-toggle">
          <button
            className={`toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true)
              setError('')
              setSuccess('')
            }}
          >
            Login
          </button>
          <button
            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false)
              setError('')
              setSuccess('')
            }}
          >
            Signup
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form
          className={`auth-form ${isLogin ? 'show' : 'hide'}`}
          onSubmit={handleLoginSubmit}
        >
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={loginForm.email}
              onChange={handleLoginChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={loginForm.password}
              onChange={handleLoginChange}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="form-footer">
            <a href="#forgot">Forgot password?</a>
          </div>
        </form>

        <form
          className={`auth-form ${!isLogin ? 'show' : 'hide'}`}
          onSubmit={handleSignupSubmit}
        >
          <div className="form-group">
            <label htmlFor="signup-name">Name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={signupForm.name}
              onChange={handleSignupChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={signupForm.email}
              onChange={handleSignupChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              placeholder="Enter your password (min 6 characters)"
              value={signupForm.password}
              onChange={handleSignupChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={signupForm.confirmPassword}
              onChange={handleSignupChange}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>

      <div className="auth-background"></div>
    </div>
  )
}
