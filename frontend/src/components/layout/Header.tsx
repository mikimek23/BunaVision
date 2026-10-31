import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { Sun, Moon, Menu, X, LogIn, LogOut, Shield, Upload } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { authToken, currentUser, authLoading, handleLogout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const onLogout = () => {
    handleLogout()
    navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAssessClick = (e: React.MouseEvent) => {
    if (!authToken) {
      e.preventDefault()
      navigate('/login', { state: { from: '/assess' } })
    }
  }

  const isAdmin = currentUser?.role === 'admin'

  const handleNavClick = (hash?: string) => {
    setMobileMenuOpen(false)
    if (!hash) {
      navigate('/')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (location.pathname === '/') {
      const element = document.querySelector(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(`/${hash}`)
    }
  }

  const navLinkStyle = {
    color: 'var(--c-charcoal)',
  }

  return (
    <header
      className="sticky top-0 z-40 transition-colors border-b"
      style={{
        backgroundColor:
          theme === 'dark' ? 'rgba(12,22,17,0.96)' : 'rgba(247,244,236,0.96)',
        borderColor: 'var(--c-border)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link
          to="/"
          onClick={() => handleNavClick()}
          className="flex items-center gap-3 select-none shrink-0 no-underline group"
        >
          <img
            src="/bunavision-favicon.ico"
            alt="BunaVision"
            className="w-8 h-8 rounded-lg object-cover shadow-2xs group-hover:scale-105 transition-transform"
          />
          <span
            className="font-display text-2xl tracking-tight leading-none"
            style={{ color: 'var(--c-charcoal)' }}
          >
            BunaVision
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          <button
            type="button"
            onClick={() => handleNavClick()}
            className="text-sm font-medium transition-colors hover:opacity-75 cursor-pointer bg-transparent border-0 p-0"
            style={navLinkStyle}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('#how-it-works')}
            className="text-sm font-medium transition-colors hover:opacity-75 cursor-pointer bg-transparent border-0 p-0"
            style={navLinkStyle}
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('#about')}
            className="text-sm font-medium transition-colors hover:opacity-75 cursor-pointer bg-transparent border-0 p-0"
            style={navLinkStyle}
          >
            About
          </button>

          {authToken && (
            <Link
              to="/assessments"
              className="text-sm font-medium transition-colors hover:opacity-75 no-underline"
              style={navLinkStyle}
            >
              History
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium transition-colors hover:opacity-75 flex items-center gap-1 no-underline"
              style={navLinkStyle}
            >
              <Shield className="w-3.5 h-3.5 text-[#163D2D] dark:text-[#4E8B6F]" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-md transition-colors cursor-pointer"
            style={{ color: 'var(--c-muted-gray)' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'rgba(22,61,45,0.08)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#C69A4B]" />
            ) : (
              <Moon className="w-4 h-4 text-[#163D2D]" />
            )}
          </button> */}

          {authLoading ? (
            <div
              className="w-24 h-9 rounded-md animate-pulse"
              style={{ backgroundColor: 'var(--c-border)' }}
            />
          ) : authToken && currentUser ? (
            <div className="flex items-center gap-2.5">
              <span
                className="text-xs font-medium max-w-36 truncate"
                style={{ color: 'var(--c-muted-gray)' }}
              >
                {currentUser.email}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer"
                style={{
                  color: 'var(--c-charcoal)',
                  borderColor: 'var(--c-border)',
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
              <Link
                to="/assess"
                className="btn-primary no-underline text-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                Analyze a Sample
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md border no-underline transition-colors"
                style={{
                  color: 'var(--c-charcoal)',
                  borderColor: 'var(--c-border)',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(22,61,45,0.06)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in
              </Link>
              {/* Primary button: Analyze a Sample */}
              <Link
                to="/assess"
                onClick={handleAssessClick}
                className="btn-primary no-underline text-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                Analyze a Sample
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-md cursor-pointer"
            style={{ color: 'var(--c-charcoal)' }}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#C69A4B]" />
            ) : (
              <Moon className="w-4 h-4 text-[#163D2D]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md cursor-pointer"
            style={{ color: 'var(--c-charcoal)' }}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b px-4 pt-3 pb-6 space-y-3"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <button
            type="button"
            onClick={() => handleNavClick()}
            className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md cursor-pointer"
            style={{ color: 'var(--c-charcoal)' }}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('#how-it-works')}
            className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md cursor-pointer"
            style={{ color: 'var(--c-charcoal)' }}
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('#about')}
            className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md cursor-pointer"
            style={{ color: 'var(--c-charcoal)' }}
          >
            About
          </button>

          {authToken && (
            <Link
              to="/assessments"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-md no-underline"
              style={{ color: 'var(--c-charcoal)' }}
            >
              History
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-md no-underline"
              style={{ color: 'var(--c-charcoal)' }}
            >
              Admin
            </Link>
          )}

          <div
            className="pt-3 border-t space-y-2.5"
            style={{ borderColor: 'var(--c-border)' }}
          >
            {authToken && currentUser ? (
              <>
                <p className="px-3 text-xs" style={{ color: 'var(--c-muted-gray)' }}>
                  Signed in as <strong>{currentUser.email}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onLogout()
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold rounded-md cursor-pointer"
                  style={{ color: 'var(--c-defect)' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-center text-xs font-semibold rounded-md border no-underline"
                  style={{
                    color: 'var(--c-charcoal)',
                    borderColor: 'var(--c-border)',
                  }}
                >
                  Sign in
                </Link>
              </div>
            )}

            <Link
              to="/assess"
              onClick={(e) => {
                setMobileMenuOpen(false)
                handleAssessClick(e)
              }}
              className="btn-primary w-full justify-center text-xs py-2.5 no-underline"
            >
              <Upload className="w-3.5 h-3.5" />
              Analyze a Sample
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
