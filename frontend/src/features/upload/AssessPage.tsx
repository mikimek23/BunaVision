import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import {
  UploadCloud,
  Camera,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  FileImage,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { CameraModal } from '../../components/CameraModal'
import type { UnifiedAssessment } from '../../types/app'
import { uploadAssessmentToBackend } from '../../services/assessmentService'
import { extractApiErrorMessage } from '../../utils/errorMessages'
import { env } from '../../config/env'

// Store assessments in memory for this session
let sessionAssessments: UnifiedAssessment[] = []
export function getSessionAssessments() {
  return sessionAssessments
}
export function addSessionAssessment(a: UnifiedAssessment) {
  sessionAssessments = [
    a,
    ...sessionAssessments.filter((x) => x.assessment_id !== a.assessment_id),
  ]
}

export function AssessPage() {
  const { authToken } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedPresetName, setSelectedPresetName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStep, setProcessingStep] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleFileInput = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload a JPEG, PNG, or WEBP image.')
      return
    }

    // Validate file size
    if (file.size > env.maxUploadMb * 1024 * 1024) {
      setErrorMessage(`Image exceeds ${env.maxUploadMb} MB. Please choose a smaller file.`)
      return
    }

    if (previewUrl && !selectedPresetName) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(file)
    setSelectedPresetName(null)
    setPreviewUrl(URL.createObjectURL(file))
    setErrorMessage(null)
  }


  const handleRemoveImage = () => {
    if (previewUrl && !selectedPresetName) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setSelectedPresetName(null)
    setErrorMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleStartAnalysis = async () => {
    if (!previewUrl) {
      setErrorMessage('Please select or capture a coffee bean photograph first.')
      return
    }

    if (!authToken) {
      navigate('/login', { state: { from: '/assess' } })
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)
    setProcessingProgress(20)
    setProcessingStep('Preparing coffee sample image…')

    try {
      let fileToUpload = selectedFile

      if (!fileToUpload && previewUrl) {
        setProcessingStep('Loading example image…')
        const res = await fetch(previewUrl)
        if (!res.ok) throw new Error('Could not load preset sample image.')
        const blob = await res.blob()
        fileToUpload = new File([blob], 'sample.jpg', {
          type: blob.type || 'image/jpeg',
        })
      }

      if (!fileToUpload) {
        throw new Error('No valid image file available for assessment.')
      }

      setProcessingProgress(55)
      setProcessingStep('Analyzing visible defect categories with BunaVision…')

      const idempotencyKey = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const liveResult = await uploadAssessmentToBackend(
        fileToUpload,
        { idempotencyKey },
        authToken,
      )

      setProcessingProgress(100)
      setProcessingStep('Analysis complete.')
      addSessionAssessment(liveResult)
      setIsProcessing(false)
      navigate(`/assessments/${liveResult.assessment_id}`)
    } catch (err: unknown) {
      setIsProcessing(false)
      setProcessingProgress(0)
      setProcessingStep('')
      setErrorMessage(
        extractApiErrorMessage(
          err,
          'Assessment failed. Please verify network connectivity and backend service status.',
        ),
      )
    }
  }

  return (
    <div className="py-10 md:py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── B. Page Introduction ── */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D5A64A]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#D5A64A]">
              COFFEE SAMPLE INSPECTION
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#252B27] leading-tight tracking-tight">
            Let's inspect your coffee sample.
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-[#252B27]">
            Upload a clear image of green coffee beans to identify and count supported visible defects
            using BunaVision's computer vision model.
          </p>

          <p className="text-sm leading-relaxed text-[#68736B]">
            Start with a well-lit image of beans arranged in a single layer. The clearer the sample
            image, the easier it is to review the detection results.
          </p>
        </div>

        {/* ── Error Banner ── */}
        {errorMessage && (
          <div
            className="p-4 rounded-xl border flex items-start gap-3 transition-colors"
            style={{
              backgroundColor: '#FAEAEA',
              borderColor: '#E8A39C',
            }}
          >
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-[#A4483E]" />
            <div className="space-y-0.5 flex-1">
              <p className="text-sm font-semibold text-[#A4483E]">
                Sample Upload Notice
              </p>
              <p className="text-sm text-[#A4483E] leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-[#A4483E] hover:opacity-75 cursor-pointer p-0.5"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Main Two-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── C. Main Upload Workspace (Left: ~68% width) ── */}
          <div className="lg:col-span-8 space-y-6">

            <div className="p-6 sm:p-8 rounded-2xl border border-[#E3DDCF] bg-white shadow-2xs space-y-6">

              {/* Upload Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3DDCF]">
                <div>
                  <h2 className="text-lg font-bold text-[#252B27]">
                    Coffee Sample Image
                  </h2>
                  <p className="text-xs text-[#68736B] mt-0.5">
                    Upload a high-resolution photograph of green beans in a flat tray
                  </p>
                </div>

                {/* Secondary Action: Camera capture */}
                <button
                  type="button"
                  onClick={() => setCameraOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E3DDCF] bg-[#F5F1E8] text-[#252B27] text-xs font-semibold hover:bg-[#EEE8D9] transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Camera className="w-4 h-4 text-[#123C2D]" />
                  <span>Take a Photo</span>
                </button>
              </div>

              {/* Hidden file input always mounted so both Browse and Change Image can trigger it */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileInput(file)
                  e.target.value = ''
                }}
                className="hidden"
                aria-label="Upload green coffee sample image"
              />

              {/* ── Dropzone / Selected State ── */}
              {previewUrl ? (
                /* Selected Image State */
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-[#E3DDCF] bg-[#091813] aspect-video max-h-[460px] flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Selected coffee sample preview"
                      className="w-full h-full object-contain"
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#123C2D]/90 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-[#D5A64A]" />
                      <span>IMAGE READY FOR ANALYSIS</span>
                    </div>

                    {/* Overlay Label for Preset or Camera */}
                    {selectedPresetName && (
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-xs">
                        Preset: <strong className="text-[#D5A64A]">{selectedPresetName}</strong>
                      </div>
                    )}
                  </div>

                  {/* Metadata and Actions Bar */}
                  <div className="p-4 rounded-xl border border-[#E3DDCF] bg-[#F5F1E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white border border-[#E3DDCF] flex items-center justify-center text-[#123C2D] shrink-0">
                        <FileImage className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#252B27] truncate">
                          {selectedFile?.name || selectedPresetName || 'Sample Image'}
                        </p>
                        <p className="text-xs text-[#68736B]">
                          {selectedFile ? formatFileSize(selectedFile.size) : 'Ready for detection'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-lg border border-[#E3DDCF] bg-white text-[#252B27] text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-[#A4483E] text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Upload State */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const file = e.dataTransfer.files[0]
                    if (file) handleFileInput(file)
                  }}
                  className={`relative rounded-xl border-2 border-dashed p-10 md:p-14 text-center cursor-pointer transition-all ${isDragging
                      ? 'border-[#123C2D] bg-[#E9EFEA]'
                      : 'border-[#D8D2C4] bg-[#FAF8F3] hover:border-[#123C2D]'
                    }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                  aria-label="Click or drag and drop to upload coffee sample image"
                >
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#E9EFEA] flex items-center justify-center mx-auto text-[#123C2D]">
                      <UploadCloud className="w-7 h-7" />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-[#252B27]">
                        Drag and drop your coffee sample image
                      </h3>
                      <p className="text-sm text-[#68736B]">
                        Choose an image from your device or drop it here to get started.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        className="btn-primary text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                      >
                        Browse Images
                      </button>
                    </div>

                    <p className="text-xs text-[#68736B] pt-2">
                      Upload a clear photograph of green coffee beans for visual inspection.
                      <br />
                      <span className="text-[#8E968E] text-[11px]">
                        Supported formats: JPEG, PNG, WEBP (up to {env.maxUploadMb} MB)
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* ── 7. Submission Action ── */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  disabled={isProcessing || !previewUrl}
                  onClick={handleStartAnalysis}
                  className="btn-primary w-full justify-center text-sm py-3.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  style={
                    !previewUrl || isProcessing
                      ? {
                        backgroundColor: '#E3DDCF',
                        color: '#8E968E',
                        cursor: 'not-allowed',
                        boxShadow: 'none',
                      }
                      : {
                        backgroundColor: '#123C2D',
                      }
                  }
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Analyzing your sample...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D5A64A]" />
                      <span>Analyze Sample</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {isProcessing && (
                  <div className="p-4 rounded-xl border border-[#E3DDCF] bg-[#FAF8F3] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#252B27] font-semibold">
                      <span>{processingStep}</span>
                      <span className="font-mono text-[#123C2D]">{processingProgress}%</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#E3DDCF]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${processingProgress}%`,
                          backgroundColor: '#123C2D',
                        }}
                      />
                    </div>

                    <p className="text-xs text-[#68736B] leading-relaxed">
                      Identifying supported visible defect categories. This may take a moment.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* ── 6. Photography Guidelines (Right: ~32% width) ── */}
          <div className="lg:col-span-4 space-y-6">

            <div className="p-6 sm:p-7 rounded-2xl border border-[#E3DDCF] bg-white shadow-2xs space-y-6 sticky top-24">

              {/* Guidelines Header */}
              <div className="space-y-1.5 pb-3 border-b border-[#E3DDCF]">
                <span className="text-xs font-bold uppercase tracking-widest text-[#D5A64A]">
                  PHOTO GUIDELINES
                </span>
                <h3 className="font-display text-2xl font-bold text-[#252B27]">
                  Capture a better sample.
                </h3>
                <p className="text-xs leading-relaxed text-[#68736B]">
                  Follow these simple guidelines to help BunaVision analyze your coffee sample.
                </p>
              </div>

              {/* Recommended Photo Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#26734D]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#26734D]">
                    Good sample image
                  </h4>
                </div>

                <ul className="space-y-2.5 text-xs text-[#252B27]">
                  {[
                    'Spread the green coffee beans in a single layer.',
                    'Use bright, even lighting.',
                    'Position the camera directly above the sample.',
                    'Keep the beans and their visible surfaces in focus.',
                    'Use a clean, neutral background.',
                  ].map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-[#26734D] shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Avoid Section */}
              <div className="space-y-3 pt-2 border-t border-[#E3DDCF]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A4483E]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#A4483E]">
                    Avoid
                  </h4>
                </div>

                <ul className="space-y-2.5 text-xs text-[#252B27]">
                  {[
                    'Blurry or out-of-focus images.',
                    'Strong shadows or insufficient lighting.',
                    'Overlapping or heavily piled beans.',
                    'Extremely distant photographs.',
                    'Images containing unrelated objects.',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed text-[#68736B]">
                      <AlertCircle className="w-4 h-4 text-[#A4483E] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Comparisons with Authentic Photographs */}
              <div className="pt-2 border-t border-[#E3DDCF] space-y-2.5">
                <div className="text-xs font-bold text-[#252B27]">Visual Reference</div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <div className="rounded-lg overflow-hidden aspect-square border-2 border-[#26734D]/40">
                      <img
                        src="/coffee_drying_closeup.jpg"
                        alt="Good single-layer flat sample layout"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-[#26734D] text-center">
                      ✓ Flat single layer
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="rounded-lg overflow-hidden aspect-square border-2 border-[#A4483E]/40">
                      <img
                        src="/coffee_drying_bed_overhead.jpg"
                        alt="Cluttered or stacked coffee beans"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-[#A4483E] text-center">
                      ✕ Avoid piled beans
                    </p>
                  </div>
                </div>
              </div>

              {/* Model Note */}
              <div className="pt-2 border-t border-[#E3DDCF]">
                <p className="text-[11px] leading-relaxed text-[#68736B] italic">
                  Image quality affects the usefulness of visual analysis. BunaVision detects only the
                  visible defect categories supported by its current model.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ── Camera Capture Modal ── */}
      {cameraOpen && (
        <CameraModal
          onClose={() => setCameraOpen(false)}
          onCapture={(file) => {
            handleFileInput(file)
            setCameraOpen(false)
          }}
        />
      )}
    </div>
  )
}
