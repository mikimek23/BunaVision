import { Link } from 'react-router'
import {
  Upload,
  ArrowRight,
  Scan,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  FileCheck2,
  Eye,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { DEFECT_INFO_CARDS, ETHIOPIAN_ORIGINS } from '../../constants/data'
import { HeroImageTransition } from './HeroImageTransition'

export function HomePage() {
  const { authToken } = useAuth()

  const assessDestination = authToken ? '/assess' : '/login'
  const assessState = !authToken ? { from: '/assess' } : undefined

  return (
    <div className="overflow-hidden">

      {/* ═══════════════════ SECTION 2: HERO ═══════════════════ */}
      <section
        className="relative pt-16 pb-20 md:pt-24 md:pb-28 text-white transition-colors"
        style={{ backgroundColor: '#102C22' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

            {/* Left Column: Headline, Copy, Actions */}
            <div className="lg:col-span-6 space-y-7">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold">
                  AI-POWERED COFFEE INSPECTION
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.12] tracking-tight text-[#F7F4EC]">
                See beyond the bean.{' '}
                <span className="text-gold">Discover what matters.</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg leading-relaxed text-[#D1DCD5] max-w-xl font-normal">
                BunaVision brings AI-assisted visual defect detection to green coffee inspection.
                Upload a sample image to identify and count visible defects, helping coffee-sector
                professionals review samples with greater clarity.
              </p>

              {/* Two CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to={assessDestination}
                  state={assessState}
                  className="btn-hero-primary"
                >
                  <Upload className="w-4 h-4" />
                  Analyze a Sample
                </Link>

                <a
                  href="#how-it-works"
                  className="btn-hero-secondary"
                >
                  Explore How It Works
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Supporting Statement */}
              <div className="pt-2 flex items-center gap-2.5 text-xs text-[#A4B5AC] border-t border-white/10">
                <span className="text-gold font-semibold">✦</span>
                <p>Built to support the Ethiopian coffee industry.</p>
              </div>
            </div>

            {/* Right Column: Authentic Detection Visual with Before & After Transition */}
            <div className="lg:col-span-6">
              <HeroImageTransition
                originalSrc="/coffee_sample.jpg"
                annotatedSrc="/annotated.jpg"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 3: PROBLEM (THE CHALLENGE) ═══════════════════ */}
      <section
        className="py-20 md:py-28 transition-colors border-b"
        style={{
          backgroundColor: '#F7F4EC',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left: Real Close-up Photography */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden border border-coffee-200 shadow-md bg-white">
                <img
                  src="/coffee_drying_closeup.jpg"
                  alt="Raw green coffee bean hand inspection close-up"
                  className="w-full h-80 lg:h-96 object-cover"
                />
                <div className="p-4 bg-white border-t border-coffee-200 text-xs text-muted-gray">
                  Green coffee beans arranged for visual defect inspection.
                </div>
              </div>
            </div>

            {/* Right: Editorial Problem Copy */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-gray">
                THE CHALLENGE
              </span>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-tight">
                Coffee quality begins with careful inspection.
              </h2>

              <p className="text-base sm:text-lg leading-relaxed text-charcoal">
                Visual inspection is an important part of green coffee quality assessment.
                Identifying and counting visible defects requires attention, consistency, and
                practical experience. For quality-control teams handling multiple samples,
                reviewing each sample can be demanding.
              </p>

              {/* Supporting Content Box */}
              <div className="p-6 rounded-xl border border-coffee-200 bg-white space-y-2">
                <h3 className="text-base font-semibold text-charcoal">
                  A closer look matters.
                </h3>
                <p className="text-sm leading-relaxed text-muted-gray">
                  Small visible imperfections can influence how a coffee sample is assessed. Having a
                  clearer way to identify and review visible defects can support the inspection process.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 4: THE SOLUTION ═══════════════════ */}
      <section
        className="py-20 md:py-28 transition-colors border-b"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          {/* Section Header */}
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-gray">
              OUR SOLUTION
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-tight">
              A smarter way to review visible coffee defects.
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-muted-gray">
              BunaVision uses computer vision to analyze green coffee sample images, detect supported
              visible defect categories, and present the results in an easy-to-review format.
            </p>
          </div>

          {/* Genuine Showcase of Actual Application UI */}
          <div className="rounded-2xl border border-coffee-200 bg-[#F7F4EC] p-6 lg:p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left: Visual Detection Output */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-gray pb-2 border-b border-coffee-200">
                  <span className="font-semibold text-charcoal flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#163D2D]" />
                    Optical Defect Localization Preview
                  </span>
                  <span>Sample: Flat Tray Inspection</span>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-coffee-200 aspect-video bg-black">
                  <img
                    src="/assessed_image.png"
                    alt="Actual BunaVision detection output"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#102C22]/85 text-white text-[11px] font-mono">
                    Model: YOLOv8n-Coffee-ONNX-v1
                  </div>
                </div>

                <p className="text-xs text-muted-gray leading-relaxed">
                  Actual application output: bounding boxes localize individual defective regions
                  across the single-layer spread tray without manual bean sorting.
                </p>
              </div>

              {/* Right: Actual Result Summary Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-xl border border-coffee-200 bg-white space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 border-b border-coffee-200">
                    <div>
                      <h4 className="text-sm font-bold text-charcoal">Inspection Summary</h4>
                      <p className="text-[11px] text-muted-gray">Verified Model Run</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#E9EFEA] text-[#163D2D]">
                      Completed
                    </span>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-coffee-200 bg-[#F7F4EC]">
                      <div className="text-[11px] font-medium text-muted-gray">Total Defect Regions</div>
                      <div className="font-display text-3xl font-bold text-charcoal mt-1">4</div>
                      <div className="text-[10px] text-muted-gray">Segmented boxes</div>
                    </div>
                    <div className="p-3 rounded-lg border border-coffee-200 bg-[#F7F4EC]">
                      <div className="text-[11px] font-medium text-muted-gray">Primary Defects</div>
                      <div className="font-display text-3xl font-bold text-[#9E3B3B] mt-1">1</div>
                      <div className="text-[10px] text-[#9E3B3B]">Severe (Full Black)</div>
                    </div>
                  </div>

                  {/* Granular Defect Breakdown */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-charcoal">Supported Defect Tally</div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-[#F7F4EC]">
                        <span className="font-medium text-charcoal">Full Black</span>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-100 text-red-800">
                            Primary
                          </span>
                          <span className="font-mono font-bold text-charcoal">1</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-[#F7F4EC]">
                        <span className="font-medium text-charcoal">Partial Black</span>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                            Secondary
                          </span>
                          <span className="font-mono font-bold text-charcoal">2</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-[#F7F4EC]">
                        <span className="font-medium text-charcoal">Coffee Husk / Parchment</span>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                            Secondary
                          </span>
                          <span className="font-mono font-bold text-charcoal">1</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick verification note */}
                  <div className="pt-2 text-[11px] text-muted-gray flex items-center gap-1.5 border-t border-coffee-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#163D2D]" />
                    <span>Validated coffee sample (MobileNetV3 validator)</span>
                  </div>
                </div>

                {/* Call to try */}
                <Link
                  to={assessDestination}
                  state={assessState}
                  className="btn-primary w-full justify-center text-xs py-3 no-underline"
                >
                  <Upload className="w-4 h-4" />
                  Analyze a Sample Yourself
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════ SECTION 5: HOW IT WORKS ═══════════════════ */}
      <section
        id="how-it-works"
        className="py-20 md:py-28 transition-colors border-b"
        style={{
          backgroundColor: '#EEE8DA',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          {/* Section Header */}
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-gray">
              SIMPLE WORKFLOW
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-tight">
              From sample image to actionable visual insights.
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-muted-gray">
              BunaVision keeps the inspection workflow straightforward. Upload an image, let the model
              analyze it, and review the detected results.
            </p>
          </div>

          {/* Horizontal 3-Step Layout on Desktop, Vertical on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Step 1 */}
            <div className="p-7 rounded-2xl border border-coffee-200 bg-white space-y-4 shadow-2xs relative">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold text-[#163D2D]">
                  01
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#E9EFEA] flex items-center justify-center text-[#163D2D]">
                  <Upload className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-charcoal">
                Upload Your Sample
              </h3>

              <p className="text-sm leading-relaxed text-muted-gray">
                Select and upload an image of green coffee beans to begin the analysis.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-7 rounded-2xl border border-coffee-200 bg-white space-y-4 shadow-2xs relative">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold text-[#163D2D]">
                  02
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#E9EFEA] flex items-center justify-center text-[#163D2D]">
                  <Scan className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-charcoal">
                AI-Powered Analysis
              </h3>

              <p className="text-sm leading-relaxed text-muted-gray">
                BunaVision processes the image and identifies supported visible defect categories using
                its computer vision model.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-7 rounded-2xl border border-coffee-200 bg-white space-y-4 shadow-2xs relative">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold text-[#163D2D]">
                  03
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#E9EFEA] flex items-center justify-center text-[#163D2D]">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-charcoal">
                Review the Results
              </h3>

              <p className="text-sm leading-relaxed text-muted-gray">
                View the detection visualization and review the number of detected defects in your
                sample.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════ SECTION 6: DETECTION CAPABILITIES ═══════════════════ */}
      <section
        className="py-20 md:py-28 transition-colors border-b"
        style={{
          backgroundColor: '#F7F4EC',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          {/* Section Header */}
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-gray">
              WHAT WE DETECT
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-tight">
              Focused on visible defect identification.
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-muted-gray">
              BunaVision currently supports the identification and counting of three visible defect
              categories through image analysis.
            </p>
          </div>

          {/* Three Supported Defect Cards — Exact from project schema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {DEFECT_INFO_CARDS.map((card) => {
              const isPrimary = card.category.includes('Primary')
              return (
                <div
                  key={card.key}
                  className="p-7 rounded-2xl border border-coffee-200 bg-white space-y-5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPrimary
                        ? 'bg-red-100 text-red-900 border border-red-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                    >
                      {card.category}
                    </span>
                    <span className="text-xs font-mono text-muted-gray">
                      {isPrimary ? 'Severe Defect' : 'Secondary'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-display text-charcoal">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-gray mt-2">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-coffee-200 space-y-2 text-xs">
                    <div>
                      <strong className="text-charcoal">Taste / Cup Impact: </strong>
                      <span className="text-muted-gray">{card.tasteImpact}</span>
                    </div>
                    <div>
                      <strong className="text-charcoal">Prevention: </strong>
                      <span className="text-muted-gray">{card.prevention}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Notice about non-supported defect classes */}
          <div className="p-4 rounded-xl border border-coffee-200 bg-white flex items-start gap-3 text-xs text-muted-gray">
            <ShieldAlert className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <p>
              <strong>Coverage Transparency:</strong> Only visible surface defect categories
              supported by the model are detected. Other defect categories defined by ECX or SCA
              standards (such as internal insect damage, sour beans, or density irregularities)
              require certified physical inspection.
            </p>
          </div>

        </div>
      </section>

      {/* ═══════════════════ SECTION 7: PRODUCT BENEFITS ═══════════════════ */}
      <section
        className="py-20 md:py-28 transition-colors border-b"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          {/* Section Header */}
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-gray">
              WHY BUNAVISION
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-tight">
              Designed to support better visual inspection.
            </h2>
          </div>

          {/* 4 Concise Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Benefit 1 */}
            <div className="p-6 rounded-2xl border border-coffee-200 bg-[#F7F4EC] space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E9EFEA] flex items-center justify-center text-[#163D2D]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-charcoal">
                Image-Based Inspection
              </h3>
              <p className="text-sm leading-relaxed text-muted-gray">
                Analyze green coffee sample images through a straightforward digital workflow.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="p-6 rounded-2xl border border-coffee-200 bg-[#F7F4EC] space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E9EFEA] flex items-center justify-center text-[#163D2D]">
                <Scan className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-charcoal">
                Visible Defect Identification
              </h3>
              <p className="text-sm leading-relaxed text-muted-gray">
                Identify supported defect categories through AI-assisted image analysis.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-6 rounded-2xl border border-coffee-200 bg-[#F7F4EC] space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E9EFEA] flex items-center justify-center text-[#163D2D]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-charcoal">
                Automated Defect Counting
              </h3>
              <p className="text-sm leading-relaxed text-muted-gray">
                Review detected defect counts without manually counting every displayed detection.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="p-6 rounded-2xl border border-coffee-200 bg-[#F7F4EC] space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E9EFEA] flex items-center justify-center text-[#163D2D]">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-charcoal">
                Clear Results
              </h3>
              <p className="text-sm leading-relaxed text-muted-gray">
                View detection visualizations and structured results in one place.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════ SECTION 8: ETHIOPIAN COFFEE CONTEXT (ABOUT) ═══════════════════ */}
      <section
        id="about"
        className="py-20 md:py-28 text-white transition-colors border-b"
        style={{
          backgroundColor: '#102C22',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left: Authentic Text & Statement */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                ROOTED IN ETHIOPIAN COFFEE
              </span>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#F7F4EC] leading-tight">
                Supporting the people behind Ethiopia's coffee quality.
              </h2>

              <p className="text-base sm:text-lg leading-relaxed text-[#D1DCD5]">
                Ethiopia is recognized worldwide for its diverse coffee origins and distinctive
                coffee profiles. BunaVision is designed with the Ethiopian coffee sector in mind,
                exploring how accessible computer vision tools can support the preliminary visual
                inspection of green coffee samples.
              </p>

              {/* Supporting Statement */}
              <div className="p-6 rounded-xl border border-white/15 bg-white/5 space-y-2">
                <p className="text-sm font-semibold text-gold">
                  Built around a simple idea:
                </p>
                <p className="text-base text-[#F7F4EC] leading-relaxed">
                  Make AI-assisted visual inspection more accessible to coffee-sector professionals.
                </p>
              </div>

              {/* Origin Region Representation from Project Data */}
              <div className="pt-2 space-y-2 text-xs text-[#A4B5AC]">
                <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Representative Ethiopian Washing &amp; Growing Regions
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ETHIOPIAN_ORIGINS.map((origin) => (
                    <span
                      key={origin.name}
                      className="px-2.5 py-1 rounded bg-white/10 text-white text-xs border border-white/10"
                    >
                      {origin.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Authentic Drying Bed Photography */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-black">
                <img
                  src="/coffee_sample.jpg"
                  alt="Overhead perspective of Ethiopian coffee drying bed"
                  className="w-full h-80 lg:h-96 object-cover"
                />
                <div className="p-4 bg-[#091813] text-xs text-[#A4B5AC] border-t border-white/10">
                  Green coffee beans arranged for visual defect inspection.
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════ SECTION 9: CALL TO ACTION ═══════════════════ */}
      <section
        className="py-20 md:py-28 transition-colors text-center"
        style={{ backgroundColor: '#F7F4EC' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-tight">
              Your next coffee sample is ready for a closer look.
            </h2>

            <p className="text-base sm:text-lg leading-relaxed text-muted-gray max-w-2xl mx-auto">
              Experience AI-assisted visual defect detection with BunaVision. Upload a green coffee
              sample image and explore the results.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to={assessDestination}
              state={assessState}
              className="btn-primary text-base px-8 py-3.5 no-underline shadow-md"
            >
              <Upload className="w-5 h-5" />
              Analyze a Sample
            </Link>
          </div>

          <p className="text-xs text-muted-gray pt-2">
            <a
              href="#how-it-works"
              className="hover:underline text-[#163D2D] font-medium"
            >
              Explore the platform and see how it works.
            </a>
          </p>

        </div>
      </section>

    </div>
  )
}
