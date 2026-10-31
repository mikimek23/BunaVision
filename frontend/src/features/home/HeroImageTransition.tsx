import { useState, useEffect, useRef, useCallback } from 'react'
import { Scan } from 'lucide-react'

interface HeroImageTransitionProps {
  originalSrc?: string
  annotatedSrc?: string
}

export function HeroImageTransition({
  originalSrc = '/coffee_sample.jpg',
  annotatedSrc = '/annotated.jpg',
}: HeroImageTransitionProps) {
  const [activeState, setActiveState] = useState<0 | 1>(0) // 0: Original, 1: Annotated
  const timerRef = useRef<number | null>(null)

  // Preload images to avoid flash on first transition
  useEffect(() => {
    const img1 = new Image()
    img1.src = originalSrc
    const img2 = new Image()
    img2.src = annotatedSrc
  }, [originalSrc, annotatedSrc])

  // Setup interval with auto-pause on document hidden or prefers-reduced-motion
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mediaQuery.matches) {
        return // Do not start auto-timer if reduced motion is requested
      }
    }

    timerRef.current = window.setInterval(() => {
      // Pause if browser tab is hidden
      if (typeof document !== 'undefined' && document.hidden) {
        return
      }
      setActiveState((prev) => (prev === 0 ? 1 : 0))
    }, 4000)
  }, [])

  useEffect(() => {
    resetTimer()

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        resetTimer()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [resetTimer])

  const isAnnotated = activeState === 1

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#091813]">
      <div className="relative aspect-4/3 overflow-hidden select-none">

        {/* ── Image Layer 1: Original Sample ── */}
        <img
          src={originalSrc}
          alt="Original unroasted green coffee bean sample before AI analysis"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            activeState === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
          loading="eager"
        />

        {/* ── Image Layer 2: AI Detection Result ── */}
        <img
          src={annotatedSrc}
          alt="AI-annotated green coffee beans with localized defect detection bounding boxes"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            activeState === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
          loading="eager"
        />

        {/* ── Scanline Effect (Active during annotated detection state) ── */}
        {isAnnotated && (
          <div
            className="absolute inset-x-0 h-px scan-line pointer-events-none z-20"
            style={{
              background: 'linear-gradient(to right, transparent, #C69A4B, transparent)',
              boxShadow: '0 0 12px #C69A4B',
            }}
          />
        )}

        {/* ── Top Bar: Status Label & Caption ──
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-[#102C22]/90 backdrop-blur-md border border-white/15 text-white transition-all">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full transition-colors"
              style={{ backgroundColor: isAnnotated ? '#C69A4B' : '#8FAD7E' }}
            />
            <span className="font-semibold tracking-wide text-[#F7F4EC] uppercase text-[11px]">
              {isAnnotated ? '02 / AI DETECTION RESULT' : '01 / ORIGINAL SAMPLE'}
            </span>
          </div>

          <span className="text-[#A4B5AC] text-[11px] font-medium hidden sm:inline-block">
            {isAnnotated ? 'Visible defects localized by BunaVision' : 'Before AI analysis'}
          </span>
        </div> */}

        {/* ── Bottom Section: Detection Summary & Transition Indicators ── */}
        <div className="absolute bottom-3 left-3 right-3 z-30 space-y-2.5">

          {/* Interactive Transition Indicators (Pills) */}
          {/* <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectState(0)}
              className="group flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer backdrop-blur-md border"
              style={{
                backgroundColor:
                  activeState === 0 ? 'rgba(16, 44, 34, 0.95)' : 'rgba(16, 44, 34, 0.95)',
                borderColor: activeState === 0 ? '#C69A4B' : 'rgba(255, 255, 255, 0.15)',
                color: activeState === 0 ? '#C69A4B' : '#A4B5AC',
              }}
              aria-label="View original green coffee sample image"
              aria-pressed={activeState === 0}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Original Sample</span>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: activeState === 0 ? '#C69A4B' : 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </button>

            <button
              type="button"
              onClick={() => handleSelectState(1)}
              className="group flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer backdrop-blur-md border"
              style={{
                backgroundColor:
                  activeState === 1 ? 'rgba(16, 44, 34, 0.95)' : 'rgba(16, 44, 34, 0.65)',
                borderColor: activeState === 1 ? '#C69A4B' : 'rgba(255, 255, 255, 0.15)',
                color: activeState === 1 ? '#C69A4B' : '#A4B5AC',
              }}
              aria-label="View AI defect detection result"
              aria-pressed={activeState === 1}
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Detection</span>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: activeState === 1 ? '#C69A4B' : 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </button>
          </div> */}

          {/* Genuine Detection Summary Card */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-[#102C22]/95 backdrop-blur-md border border-white/15 text-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-gold" />
                <span className="font-semibold text-[#F7F4EC]">
                  {isAnnotated ? 'AI Inspection Breakdown' : 'Raw Sample Awaiting Analysis'}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  isAnnotated
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {isAnnotated ? 'Detection Output' : 'Input Image'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 text-center">
              <div className="px-2 py-1 rounded bg-black/25">
                <div className="text-[10px] text-[#A4B5AC]">Full Black</div>
                <div className="text-sm font-bold text-red-400">
                  {isAnnotated ? '1 region' : '—'}
                </div>
              </div>
              <div className="px-2 py-1 rounded bg-black/25">
                <div className="text-[10px] text-[#A4B5AC]">Partial Black</div>
                <div className="text-sm font-bold text-amber-400">
                  {isAnnotated ? '2 regions' : '—'}
                </div>
              </div>
              <div className="px-2 py-1 rounded bg-black/25">
                <div className="text-[10px] text-[#A4B5AC]">Husk / Parch.</div>
                <div className="text-sm font-bold text-amber-300">
                  {isAnnotated ? '1 region' : '—'}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

