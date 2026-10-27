import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react'
import type { UserOut } from '../types/auth'
import { loginUser, registerUser, fetchCurrentUser } from '../services/authService'
import { DEMO_USER, DEMO_ADMIN } from '../services/demoService'
import { extractApiErrorMessage } from '../utils/errorMessages'

interface AuthContextValue {
  authToken: string | null
  currentUser: UserOut | null
  authLoading: boolean

  handleLogin: (email: string, password: string) => Promise<void>
  handleRegister: (email: string, password: string) => Promise<void>
  handleLogout: () => void
  loginAsDemo: (role: 'user' | 'admin') => void

  loginError: string | null
  loginLoading: boolean
  registerError: string | null
  registerLoading: boolean

  clearLoginError: () => void
  clearRegisterError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem('bv_token'),
  )
  const [currentUser, setCurrentUser] = useState<UserOut | null>(null)
  const [authLoading, setAuthLoading] = useState<boolean>(!!localStorage.getItem('bv_token'))

  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerLoading, setRegisterLoading] = useState(false)

  // Validate stored token on mount
  useEffect(() => {
    // Purge any legacy demo data from browser storage
    localStorage.removeItem('bv_demo_assessments_store')

    const token = localStorage.getItem('bv_token')
    if (!token) {
      setAuthLoading(false)
      return
    }

    if (token.startsWith('demo_token_')) {
      const storedDemo = localStorage.getItem('bv_demo_user')
      if (storedDemo) {
        try {
          setCurrentUser(JSON.parse(storedDemo))
          setAuthToken(token)
          setAuthLoading(false)
          return
        } catch {
          // fall through
        }
      }
      const role = token.includes('admin') ? 'admin' : 'user'
      setCurrentUser(role === 'admin' ? DEMO_ADMIN : DEMO_USER)
      setAuthToken(token)
      setAuthLoading(false)
      return
    }

    fetchCurrentUser(token)
      .then((user) => {
        setCurrentUser(user)
        setAuthToken(token)
      })
      .catch(() => {
        localStorage.removeItem('bv_token')
        setAuthToken(null)
        setCurrentUser(null)
      })
      .finally(() => setAuthLoading(false))
  }, [])

  const handleLogin = useCallback(async (email: string, password: string) => {
    setLoginLoading(true)
    setLoginError(null)
    try {
      const tokenData = await loginUser(email, password)
      const token = tokenData.access_token
      localStorage.setItem('bv_token', token)
      setAuthToken(token)
      const user = await fetchCurrentUser(token)
      setCurrentUser(user)
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, 'Invalid email or password. Please try again.')
      setLoginError(msg)
      throw new Error(msg)
    } finally {
      setLoginLoading(false)
    }
  }, [])

  const handleRegister = useCallback(async (email: string, password: string) => {
    setRegisterLoading(true)
    setRegisterError(null)
    try {
      await registerUser(email, password)
      // Auto-login after registration
      const tokenData = await loginUser(email, password)
      const token = tokenData.access_token
      localStorage.setItem('bv_token', token)
      setAuthToken(token)
      const user = await fetchCurrentUser(token)
      setCurrentUser(user)
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, 'Registration failed. Please try again.')
      setRegisterError(msg)
      throw new Error(msg)
    } finally {
      setRegisterLoading(false)
    }
  }, [])

  const loginAsDemo = useCallback((role: 'user' | 'admin') => {
    const demoUser = role === 'admin' ? DEMO_ADMIN : DEMO_USER
    const token = `demo_token_${role}_${Date.now()}`
    localStorage.setItem('bv_token', token)
    localStorage.setItem('bv_demo_user', JSON.stringify(demoUser))
    setAuthToken(token)
    setCurrentUser(demoUser)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('bv_token')
    localStorage.removeItem('bv_demo_user')
    setAuthToken(null)
    setCurrentUser(null)
  }, [])

  const clearLoginError = useCallback(() => setLoginError(null), [])
  const clearRegisterError = useCallback(() => setRegisterError(null), [])

  return (
    <AuthContext
      value={{
        authToken,
        currentUser,
        authLoading,
        handleLogin,
        handleRegister,
        handleLogout,
        loginAsDemo,
        loginError,
        loginLoading,
        registerError,
        registerLoading,
        clearLoginError,
        clearRegisterError,
      }}
    >
      {children}
    </AuthContext>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
