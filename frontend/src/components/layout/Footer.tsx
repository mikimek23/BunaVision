import { Link, useNavigate, useLocation } from 'react-router'
import { ShieldCheck } from 'lucide-react'

export function Footer() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (hash?: string) => {
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

  return (
    <footer
      className="text-white pt-14 pb-12 transition-colors border-t"
      style={{
        backgroundColor: '#102C22',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: Brand & Description */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/bunavision-favicon.ico"
                alt="BunaVision"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="font-display text-2xl tracking-tight text-[#F7F4EC]">
                BunaVision
              </span>
            </div>

            <p className="text-sm leading-relaxed text-[#D1DCD5] max-w-lg">
              BunaVision is an AI-assisted visual inspection platform designed to identify and count
              supported visible defects in green coffee sample images.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-[#C69A4B]">
              <span className="w-2 h-2 rounded-full bg-[#C69A4B] animate-pulse" />
              <span>Built to support the Ethiopian coffee industry</span>
            </div>
          </div>

          {/* Right Column: Navigation Links */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C69A4B]">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick()}
                  className="text-[#D1DCD5] hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-sm"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#how-it-works')}
                  className="text-[#D1DCD5] hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-sm"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('#about')}
                  className="text-[#D1DCD5] hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-sm"
                >
                  About
                </button>
              </li>
              <li>
                <Link
                  to="/assess"
                  className="text-[#D1DCD5] hover:text-white transition-colors no-underline inline-flex items-center gap-1.5"
                >
                  Analyze a Sample
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Decision-Support Disclaimer Strip */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-start gap-3 text-xs leading-relaxed text-[#A4B5AC]"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <ShieldCheck className="w-4 h-4 text-[#C69A4B] shrink-0 mt-0.5" />
          <p className="flex-1">
            <strong className="text-[#F7F4EC]">Notice:</strong> BunaVision provides preliminary visual
            analysis and is not an official coffee grading, certification, or laboratory testing system.
            Results should be reviewed alongside established quality assessment practices.
          </p>
        </div>

        {/* Bottom Bar: Copyright */}
        <div
          className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#82968C]"
          style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
        >
          <p>© {new Date().getFullYear()} BunaVision. All rights reserved.</p>
          <p>YOLOv8 &amp; MobileNetV3 Optical Defect Detection Architecture</p>
        </div>
      </div>
    </footer>
  )
}
