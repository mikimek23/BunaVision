import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { ArrowLeft, Mail, Lock, RefreshCw, AlertTriangle, UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function RegisterPage() {
  const { handleRegister, registerError, registerLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const redirectPath = (location.state as { from?: string })?.from || '/assess'

  const onSubmit = async () => {
    if (!email || !password) return
    if (password.length < 10) {
      setLocalError('Password must be at least 10 characters.')
      return
    }
    setLocalError(null)
    try {
      await handleRegister(email, password)
      setEmail('')
      setPassword('')
      navigate(redirectPath)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // Error is surfaced by context
    }
  }

  const displayError = localError || registerError

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

      <div className="space-y-1">
        <h1
          className="font-display text-3xl"
          style={{ color: 'var(--c-text)' }}
        >
          Create account
        </h1>
        <p className="text-sm" style={{ color: 'var(--c-text-2)' }}>
          For coffee producers, cooperatives, and exporters.
        </p>
      </div>

      <div
        className="p-6 rounded-xl border space-y-5"
        style={{
          backgroundColor: 'var(--c-surface)',
          borderColor: 'var(--c-border)',
        }}
      >
        {displayError && (
          <div
            className="p-3.5 rounded-lg border flex items-start gap-2.5"
            style={{
              backgroundColor: 'var(--c-defect-tint)',
              borderColor: 'var(--c-defect-border)',
            }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--c-defect)' }} />
            <p className="text-xs" style={{ color: 'var(--c-defect)' }}>
              {displayError}
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
                placeholder="you@washingstation.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                autoComplete="new-password"
                className={`pl-10 ${inputCls}`}
                style={{
                  backgroundColor: 'var(--c-surface-2)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>
              At least 10 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={registerLoading || !email || !password}
            className="btn-primary w-full justify-center py-3"
          >
            {registerLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create account
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs" style={{ color: 'var(--c-text-2)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold hover:underline"
            style={{ color: 'var(--c-bean)' }}
          >
            Sign in
          </Link>
        </p>

        <p
          className="text-xs leading-relaxed text-center pt-1"
          style={{ color: 'var(--c-text-3)' }}
        >
          BunaVision provides preliminary AI screenings only — not official grades.
        </p>
      </div>
    </div>
  )
}
