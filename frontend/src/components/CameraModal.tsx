import { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, SwitchCamera, X } from 'lucide-react'

interface CameraModalProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(
    async (facing: 'environment' | 'user') => {
      setCameraError(null)
      stopStream()
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch {
        setCameraError(
          'Unable to access camera. Please allow camera permissions or upload an image file.',
        )
      }
    },
    [stopStream],
  )

  useEffect(() => {
    startCamera(cameraFacing)
    return () => {
      stopStream()
    }
  }, [cameraFacing, startCamera, stopStream])

  const toggleFacing = () => {
    const next = cameraFacing === 'environment' ? 'user' : 'environment'
    setCameraFacing(next)
    startCamera(next)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `coffee_sample_${Date.now()}.jpg`, {
              type: 'image/jpeg',
            })
            stopStream()
            onCapture(file)
          }
        },
        'image/jpeg',
        0.92,
      )
    }
  }

  const handleClose = () => {
    stopStream()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#102C22] border border-white/15 rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#D5A64A]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display text-[#F7F4EC]">
                Capture Coffee Sample
              </h3>
              <p className="text-[11px] text-[#A4B5AC]">
                Position camera directly above green beans in a single flat layer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {cameraError ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs space-y-2">
            <p>{cameraError}</p>
            <button
              type="button"
              onClick={() => startCamera(cameraFacing)}
              className="px-3.5 py-1.5 rounded-lg bg-[#A4483E] text-white text-xs font-semibold cursor-pointer hover:bg-red-700 transition-colors"
            >
              Retry Camera
            </button>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-black border border-white/10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-4 border border-dashed border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-[11px] font-semibold text-white bg-black/75 backdrop-blur-md px-3 py-1 rounded-md tracking-wide">
                Center beans flat inside frame
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={toggleFacing}
            className="px-3.5 py-2 rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors text-[#F7F4EC]"
          >
            <SwitchCamera className="w-4 h-4 text-[#D5A64A]" />
            <span>Switch Lens</span>
          </button>

          <button
            type="button"
            onClick={capturePhoto}
            disabled={Boolean(cameraError)}
            className="btn-primary text-xs py-2.5 px-5 disabled:opacity-40"
            style={{ backgroundColor: '#123C2D' }}
          >
            <Camera className="w-4 h-4 text-[#D5A64A]" />
            <span>Capture Photo</span>
          </button>
        </div>
      </div>
    </div>
  )
}
