import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { env } from './config/env'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

async function enableMocking() {
  if (env.useMocks && import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start()
  } else if ('serviceWorker' in navigator) {
    // Unregister any active mock service workers to ensure live network requests hit the real backend
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
    } catch {
      // Ignore if unregistration is unavailable
    }
  }
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Unable to find the application root.')
}

enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
})
