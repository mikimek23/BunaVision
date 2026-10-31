import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { ArrowLeft, Mail, Lock, RefreshCw, LogIn, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const { handleLogin, loginError, loginLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const redirectPath = (location.state as { from?: string })?.from || '/assess'

  const onSubmit = async () => {
    if (!email || !password) return
    try {
      await handleLogin(email, password)
      setEmail('')
      setPassword('')
      navigate(redirectPath)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // Error is surfaced by context
    }
  }

  const inputCls = `w-full px-3.5 py-2.5 rounded-lg text-sm border focus:outline-none transition-colors`

  return (
    <div className="max-w-sm mx-auto px-4 py-16 space-y-8">

      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium no-underline"
        style={{ color: 'var(--c-text-2)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      {/* Heading — no logo duplication */}
      <div className="space-y-1">
        <h1
          className="font-display text-3xl"
          style={{ color: 'var(--c-text)' }}
        >
          Sign in
        </h1>
        <p className="text-sm" style={{ color: 'var(--c-text-2)' }}>
          Access your BunaVision assessment workspace.
        </p>
      </div>

      <div
        className="p-6 rounded-xl border space-y-5"
        style={{
          backgroundColor: 'var(--c-surface)',
          borderColor: 'var(--c-border)',
        }}
      >
        {loginError && (
          <div
            className="p-3.5 rounded-lg border flex items-start gap-2.5"
            style={{
              backgroundColor: 'var(--c-defect-tint)',
              borderColor: 'var(--c-defect-border)',
            }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--c-defect)' }} />
            <p className="text-xs" style={{ color: 'var(--c-defect)' }}>
              {loginError}
            </p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--c-text-2)' }}>
              Email
            </label>
            <div className="relative">
              <Mail
                className="w-4 h-4 absolute left-3.5 top-3"
                style={{ color: 'var(--c-text-3)' }}
              />
              <input
                type="email"
                required
                placeholder="name@washingstation.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 ${inputCls}`}
                style={{
                  backgroundColor: 'var(--c-surface-2)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--c-text-2)' }}>
              Password
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 absolute left-3.5 top-3"
                style={{ color: 'var(--c-text-3)' }}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 ${inputCls}`}
                style={{
                  backgroundColor: 'var(--c-surface-2)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="btn-primary w-full justify-center py-3"
          >
            {loginLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign in
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs" style={{ color: 'var(--c-text-2)' }}>
          No account?{' '}
          <Link
            to="/register"
            className="font-semibold hover:underline"
            style={{ color: 'var(--c-bean)' }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
