import { Outlet } from 'react-router'
import { useTheme } from '../../contexts/ThemeContext'
import { Header } from './Header'
import { Footer } from './Footer'

export function AppShell() {
  const { theme } = useTheme()

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        theme === 'dark' ? 'dark' : ''
      }`}
      style={{
        backgroundColor: 'var(--c-ground)',
        color: 'var(--c-text)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Header />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
