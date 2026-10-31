import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import {
  ArrowLeft,
  Upload,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Info,
  ShieldAlert,
  Image as ImageIcon,
  Calendar,
  Clock,
  Cpu,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getSessionAssessments } from '../upload/AssessPage'
import {
  fetchAssessmentByIdFromBackend,
  mapBackendToUnified,
} from '../../services/assessmentService'
import type {
  UnifiedAssessment,
  BackendCompletedAssessment,
} from '../../types/assessment'
import { extractApiErrorMessage, getErrorMessage } from '../../utils/errorMessages'

export function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const { authToken } = useAuth()

  const [assessment, setAssessment] = useState<UnifiedAssessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'annotated' | 'original'>('annotated')
  const [languageMode, setLanguageMode] = useState<'en' | 'am'>('en')

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      if (!id) {
        setIsLoading(false)
        setErrorMessage('No assessment ID specified.')
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      // 1. In-memory session assessments from recent upload
      const sessionList = getSessionAssessments()
      const foundInSession = sessionList.find((a) => a.assessment_id === id)
      if (foundInSession) {
        if (isMounted) {
          setAssessment(foundInSession)
          setIsLoading(false)
        }
        return
      }

      // 2. Fetch directly from remote backend API
      try {
        const remote = await fetchAssessmentByIdFromBackend(id, authToken ?? undefined)
        if (!isMounted) return

        if (remote.status === 'completed') {
          const unified = mapBackendToUnified(remote as BackendCompletedAssessment)
          setAssessment(unified)
        } else {
          const failMsg = remote.error_code ? getErrorMessage(remote.error_code).message : null
          setErrorMessage(
            failMsg ||
              `Assessment failed during processing (${remote.error_code || 'PROCESSING_FAILED'}).`,
          )
        }
      } catch (err: unknown) {
        if (!isMounted) return
        setErrorMessage(
          extractApiErrorMessage(err, 'Failed to retrieve assessment data from backend service.'),
        )
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [id, authToken])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <RefreshCw className="w-8 h-8 animate-spin text-[#123C2D]" />
        <p className="text-sm font-medium text-[#68736B]">
          Loading coffee inspection report…
        </p>
      </div>
    )
  }

  if (errorMessage || !assessment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FAEAEA] border border-[#E8A39C] flex items-center justify-center mx-auto text-[#A4483E]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-[#252B27]">
            Assessment Report Unavailable
          </h2>
          <p className="text-sm leading-relaxed text-[#68736B] max-w-md mx-auto">
            {errorMessage || 'The requested assessment could not be loaded from the service.'}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/assessments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E3DDCF] bg-white text-xs font-semibold text-[#252B27] hover:bg-[#FAF8F3] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to history
          </Link>
          <Link
            to="/assess"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#123C2D] text-xs font-semibold text-white hover:bg-[#174A37] transition-colors"
          >
            <Upload className="w-4 h-4" />
            Analyze New Sample
          </Link>
        </div>
      </div>
    )
  }

  const { summary } = assessment

  // Standard ECX Supported Categories
  const supportedClasses = [
    {
      key: 'full_black',
      name: 'Full Black',
      categoryLabel: 'Primary Defect',
      categoryStyle: 'bg-[#FDF2F0] text-[#A4483E] border-[#F5C7C3]',
    },
    {
      key: 'partial_black',
      name: 'Partial Black',
      categoryLabel: 'Secondary Defect',
      categoryStyle: 'bg-[#FAF3E8] text-[#A66A32] border-[#EED7B8]',
    },
    {
      key: 'parchment_husk',
      name: 'Coffee Husk / Parchment',
      categoryLabel: 'Combined Visual Category',
      categoryStyle: 'bg-[#F0F4F2] text-[#174A37] border-[#D0DFD6]',
    },
  ]

  // Defect tallies mapped to the 3 recognized classes
  const tallyMap = new Map<string, { count: number; mean_confidence: number }>()
  summary.by_class.forEach((c) => {
    tallyMap.set(c.defect.key, {
      count: c.count,
      mean_confidence: c.mean_confidence,
    })
  })

  const currentImageUrl =
    viewMode === 'original'
      ? assessment.original_image_url || assessment.annotated_image_url
      : assessment.annotated_image_url || assessment.original_image_url

  return (
    <div className="py-8 md:py-12 bg-[#F5F1E8] min-h-[calc(100vh-64px)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── SECTION 3: Report Header and Assessment Metadata ── */}
        <div className="bg-white rounded-2xl border border-[#E3DDCF] p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D5A64A]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#D5A64A]">
                  COFFEE SAMPLE INSPECTION REPORT
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#252B27] tracking-tight">
                  Assessment Report
                </h1>
                <span className="px-3 py-1 rounded-md text-xs font-bold font-mono bg-[#FAF8F3] border border-[#E3DDCF] text-[#123C2D]">
                  #{assessment.assessment_id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E9EFEA] text-[#123C2D] border border-[#CDE0D2]">
                  {assessment.status.toUpperCase()}
                </span>
              </div>

              {/* Metadata strip */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#68736B] pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#123C2D]" />
                  <span>
                    {new Date(assessment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(assessment.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#123C2D]" />
                  <span>
                    Model: <span className="font-mono font-medium text-[#252B27]">{assessment.model_version}</span>
                  </span>
                </div>

                {assessment.processing_time_ms ? (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#123C2D]" />
                    <span>Processing: {assessment.processing_time_ms} ms</span>
                  </div>
                ) : null}

                {assessment.station_id ? (
                  <div className="flex items-center gap-1.5 border-l border-[#E3DDCF] pl-4 hidden sm:flex">
                    <span className="text-[#68736B]">{assessment.station_id}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
              <Link
                to="/assessments"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-[#E3DDCF] bg-white text-xs font-semibold text-[#252B27] hover:bg-[#FAF8F3] transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#68736B]" />
                <span>History</span>
              </Link>

              <Link
                to="/assess"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#123C2D] text-xs font-semibold text-white hover:bg-[#174A37] transition-all shadow-2xs"
              >
                <Upload className="w-4 h-4" />
                <span>Analyze New Sample</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: Assessment Overview Metrics ── */}
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#252B27]">
              Assessment Overview
            </h2>
            <p className="text-xs sm:text-sm text-[#68736B] mt-0.5">
              A summary of visible defect detections identified in this sample.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Defect Regions */}
            <div className="bg-white rounded-xl border border-[#E3DDCF] p-5 shadow-2xs space-y-2">
              <span className="text-xs font-medium text-[#68736B] block">
                Total defect regions
              </span>
              <p className="font-display text-3xl sm:text-4xl font-bold text-[#252B27]">
                {summary.detection_count}
              </p>
              <p className="text-[11px] text-[#68736B]">
                Total detected regions
              </p>
            </div>

            {/* 2. Primary Defects */}
            <div className="bg-white rounded-xl border border-[#E3DDCF] p-5 shadow-2xs space-y-2">
              <span className="text-xs font-medium text-[#68736B] block">
                Primary defects
              </span>
              <p className={`font-display text-3xl sm:text-4xl font-bold ${summary.primary_detection_count > 0 ? 'text-[#A4483E]' : 'text-[#252B27]'}`}>
                {summary.primary_detection_count}
              </p>
              <p className="text-[11px] text-[#68736B]">
                ECX primary classification
              </p>
            </div>

            {/* 3. Secondary Defects */}
            <div className="bg-white rounded-xl border border-[#E3DDCF] p-5 shadow-2xs space-y-2">
              <span className="text-xs font-medium text-[#68736B] block">
                Secondary defects
              </span>
              <p className="font-display text-3xl sm:text-4xl font-bold text-[#252B27]">
                {summary.secondary_detection_count}
              </p>
              <p className="text-[11px] text-[#68736B]">
                ECX secondary classification
              </p>
            </div>

            {/* 4. Model Coverage */}
            <div className="bg-white rounded-xl border border-[#E3DDCF] p-5 shadow-2xs space-y-2">
              <span className="text-xs font-medium text-[#68736B] block">
                Model coverage
              </span>
              <p className="font-display text-3xl sm:text-4xl font-bold text-[#123C2D]">
                3 / 13
              </p>
              <p className="text-[11px] text-[#68736B]">
                Supported ECX defect classes
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 5: Optical Defect Localization ── */}
        <div className="bg-white rounded-2xl border border-[#E3DDCF] p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#252B27]">
                Optical Defect Localization
              </h2>
              <p className="text-xs sm:text-sm text-[#68736B] mt-0.5">
                Compare the original sample image with the AI-annotated image to review the detected visible defect regions.
              </p>
            </div>

            {/* Toggle controls */}
            <div className="inline-flex p-1 rounded-xl bg-[#FAF8F3] border border-[#E3DDCF] gap-1 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('original')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'original'
                    ? 'bg-[#123C2D] text-white shadow-2xs'
                    : 'text-[#68736B] hover:text-[#252B27]'
                }`}
              >
                Original Image
              </button>
              <button
                type="button"
                onClick={() => setViewMode('annotated')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'annotated'
                    ? 'bg-[#123C2D] text-white shadow-2xs'
                    : 'text-[#68736B] hover:text-[#252B27]'
                }`}
              >
                Annotated Image
              </button>
            </div>
          </div>

          {/* Image Display */}
          <div className="rounded-xl border border-[#E3DDCF] bg-[#FAF8F3] overflow-hidden flex flex-col items-center justify-center p-2 min-h-[360px]">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={viewMode === 'original' ? 'Original sample image' : 'AI-annotated detection image'}
                className="w-full max-h-[560px] object-contain rounded-lg transition-opacity duration-200"
              />
            ) : (
              <div className="py-20 text-center space-y-2 text-[#68736B]">
                <ImageIcon className="w-10 h-10 mx-auto text-[#68736B]" />
                <p className="text-xs font-medium">Image preview not available.</p>
              </div>
            )}
          </div>

          {/* Image Caption */}
          <div className="flex items-center justify-between text-xs text-[#68736B] px-1">
            <p className="italic">
              {viewMode === 'original' ? 'Original sample image' : 'AI-annotated detection image'}
            </p>
            <p className="text-[11px]">
              {viewMode === 'annotated' ? 'Bounding overlays denote model inference regions.' : 'Raw capture prior to optical segmentation.'}
            </p>
          </div>
        </div>

        {/* ── SECTION 6: Granular Defect Class Tally ── */}
        <div className="bg-white rounded-2xl border border-[#E3DDCF] p-6 sm:p-8 shadow-2xs space-y-5">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#252B27]">
              Granular Defect Class Tally
            </h2>
            <p className="text-xs sm:text-sm text-[#68736B] mt-0.5">
              Detections grouped by recognized ECX defect taxonomy class.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E3DDCF] bg-[#FAF8F3]">
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] text-[#68736B]">
                    Defect Type
                  </th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] text-[#68736B]">
                    ECX Category
                  </th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] text-[#68736B]">
                    Defect Regions
                  </th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[11px] text-[#68736B] text-right">
                    Mean Model Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DDCF]">
                {supportedClasses.map((item) => {
                  const data = tallyMap.get(item.key)
                  const count = data?.count ?? 0
                  const confidence = data?.mean_confidence

                  return (
                    <tr key={item.key} className="hover:bg-[#FAF8F3]/60 transition-colors">
                      <td className="px-5 py-4 font-semibold text-sm text-[#252B27]">
                        {item.name}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${item.categoryStyle}`}
                        >
                          {item.categoryLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-bold text-[#252B27]">
                          {count}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-mono text-xs font-semibold text-[#68736B]">
                          {confidence !== undefined && confidence > 0
                            ? `${(confidence * 100).toFixed(1)}%`
                            : 'Not available'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Qualification clarification note */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E3DDCF] text-xs text-[#68736B] leading-relaxed">
            <span className="font-semibold text-[#252B27]">Taxonomy Note:</span> Coffee husks/dried cherries and parchment remnants have distinct ECX defect classifications. Because BunaVision combines them into one visual defect detection category, it is designated as a <em>Combined Visual Category</em> and not assigned a single primary or secondary grade weight.
          </div>
        </div>

        {/* ── SECTION 7: Standard Model Limitations & Transparency Notice ── */}
        <div className="bg-white rounded-2xl border border-[#E3DDCF] p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D5A64A]" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#252B27]">
                Standard Model Limitations &amp; Transparency Notice
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#68736B]">
              Important technical boundaries and verification requirements for this AI-assisted screening.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Notice 1 */}
            <div className="p-5 rounded-xl border border-[#E3DDCF] bg-[#FAF8F3] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D5A64A] block">
                PRELIMINARY AI ASSESSMENT
              </span>
              <h3 className="font-semibold text-sm text-[#252B27]">
                Preliminary visual screening
              </h3>
              <p className="text-xs leading-relaxed text-[#68736B]">
                Preliminary AI screening of a photograph. This is not an official ECX or SCA grade.
              </p>
            </div>

            {/* Notice 2 */}
            <div className="p-5 rounded-xl border border-[#E3DDCF] bg-[#FAF8F3] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D5A64A] block">
                PARTIAL CLASS COVERAGE
              </span>
              <h3 className="font-semibold text-sm text-[#252B27]">
                Limited defect category coverage
              </h3>
              <p className="text-xs leading-relaxed text-[#68736B]">
                Only 3 of 13 ECX defect classes are scanned: Full Black, Partial Black, and Coffee Husk / Parchment. Defects in the other 10 classes are not detected, so actual defect counts may be higher.
              </p>
            </div>

            {/* Notice 3 */}
            <div className="p-5 rounded-xl border border-[#E3DDCF] bg-[#FAF8F3] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D5A64A] block">
                HIDDEN DEFECTS NOT DETECTABLE
              </span>
              <h3 className="font-semibold text-sm text-[#252B27]">
                Visual inspection limitations
              </h3>
              <p className="text-xs leading-relaxed text-[#68736B]">
                Defects hidden from the camera or located inside the bean cannot be detected from a photograph.
              </p>
            </div>

            {/* Notice 4 */}
            <div className="p-5 rounded-xl border border-[#E3DDCF] bg-[#FAF8F3] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D5A64A] block">
                MANUAL VERIFICATION REQUIRED
              </span>
              <h3 className="font-semibold text-sm text-[#252B27]">
                Human inspection remains necessary
              </h3>
              <p className="text-xs leading-relaxed text-[#68736B]">
                Counts are model predictions. Verify them manually before making commercial, export, or official quality-assessment decisions.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 8: AI-Generated Assessment Summary ── */}
        {assessment.advisory?.summary && (
          <div className="bg-white rounded-2xl border border-[#E3DDCF] p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#123C2D]" />
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#252B27]">
                    AI-Generated Assessment Summary
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#68736B]">
                  An overview of the detected results and suggested follow-up actions.
                </p>
              </div>

              {/* Language Selector: English / አማርኛ */}
              <div className="inline-flex p-1 rounded-xl bg-[#FAF8F3] border border-[#E3DDCF] gap-1 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setLanguageMode('en')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    languageMode === 'en'
                      ? 'bg-[#123C2D] text-white shadow-2xs'
                      : 'text-[#68736B] hover:text-[#252B27]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguageMode('am')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    languageMode === 'am'
                      ? 'bg-[#123C2D] text-white shadow-2xs'
                      : 'text-[#68736B] hover:text-[#252B27]'
                  }`}
                >
                  አማርኛ
                </button>
              </div>
            </div>

            {/* Generated Summary Text */}
            <div className="p-5 rounded-xl border border-[#E3DDCF] bg-[#FAF8F3] text-sm leading-relaxed text-[#252B27]">
              {languageMode === 'en'
                ? assessment.advisory.summary.en
                : assessment.advisory.summary.am || assessment.advisory.summary.en}
            </div>

            {/* Recommended Actions Subsection */}
            {assessment.advisory.recommendations && assessment.advisory.recommendations.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="font-semibold text-sm text-[#252B27]">
                  Recommended Actions
                </h3>
                <div className="space-y-2.5">
                  {assessment.advisory.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-[#E3DDCF] bg-white flex items-start gap-3 shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#E9EFEA] text-[#123C2D] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-[#252B27] leading-relaxed">
                        {languageMode === 'en' ? rec.en : rec.am || rec.en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-[#68736B] italic pt-1">
              Generated by {assessment.advisory.generator_model || 'Gemini 1.5'}. Advisory output is for decision support only and does not substitute for accredited grading.
            </p>
          </div>
        )}

        {/* ── SECTION 9: Report Page Disclaimer ── */}
        <div className="p-4 sm:p-5 rounded-xl border border-[#E3DDCF] bg-[#FAF8F3] text-xs leading-relaxed text-[#68736B] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#123C2D] shrink-0 mt-0.5" />
          <p>
            <strong>Decision-support notice:</strong> BunaVision provides preliminary AI-assisted visual defect detection. It does not replace certified coffee inspection, laboratory testing, or official coffee grading.
          </p>
        </div>

      </div>
    </div>
  )
}
