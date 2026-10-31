import { useState } from 'react'
import { Link } from 'react-router'
import {
  Search,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Plus,
  X,
  FileText,
  Clock,
} from 'lucide-react'
import { getSessionAssessments } from '../upload/AssessPage'
import { useAssessments } from '../../hooks/useAssessments'
import { extractApiErrorMessage } from '../../utils/errorMessages'

interface HistoryRow {
  assessment_id: string
  model_version?: string
  created_at: string
  detection_count?: number
  status: 'completed' | 'failed' | 'processing'
  error_code?: string
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return dateString
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

export function HistoryPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('all')

  const [cursors, setCursors] = useState<(string | null)[]>([null])
  const [page, setPage] = useState(0)

  const {
    data: remoteData,
    isLoading: remoteLoading,
    error: remoteError,
    isFetching,
    refetch,
  } = useAssessments(cursors[page])

  const next = () => {
    if (!remoteData?.next_cursor) return
    setCursors((current) => [...current.slice(0, page + 1), remoteData.next_cursor])
    setPage((current) => current + 1)
  }

  // Combine session in-memory assessments and remote backend API items
  const sessionItems: HistoryRow[] = getSessionAssessments().map((a) => ({
    assessment_id: a.assessment_id,
    model_version: a.model_version,
    created_at: a.created_at,
    detection_count: a.summary.detection_count,
    status: a.status as 'completed' | 'failed' | 'processing',
    error_code: a.error_code ?? undefined,
  }))

  const remoteItems: HistoryRow[] =
    remoteData?.items?.map((item) => ({
      assessment_id: item.assessment_id,
      model_version: item.model_version || 'YOLOv8n-Coffee-ONNX-v1',
      created_at: item.created_at,
      detection_count: item.detection_count,
      status: item.status as 'completed' | 'failed' | 'processing',
      error_code: item.error_code ?? undefined,
    })) ?? []

  const combinedMap = new Map<string, HistoryRow>()
  sessionItems.forEach((item) => combinedMap.set(item.assessment_id, item))
  remoteItems.forEach((item) => combinedMap.set(item.assessment_id, item))

  const allItems = Array.from(combinedMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const filteredItems = allItems.filter((item) => {
    const term = search.toLowerCase().trim()
    const formattedDate = formatDate(item.created_at).toLowerCase()
    const matchesSearch =
      !term ||
      item.assessment_id.toLowerCase().includes(term) ||
      (item.model_version && item.model_version.toLowerCase().includes(term)) ||
      formattedDate.includes(term)

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('all')
  }

  return (
    <div className="py-10 md:py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── Page Header and Introduction ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D5A64A]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D5A64A]">
                YOUR INSPECTION RECORDS
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl text-[#252B27] leading-tight tracking-tight">
              Assessment History
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-[#68736B]">
              Review your previously analyzed green coffee samples, track inspection results, and
              reopen reports whenever you need them.
            </p>
          </div>

          {/* Secondary Action: New Assessment */}
          <Link
            to="/assess"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E3DDCF] bg-white text-[#252B27] text-xs font-semibold hover:bg-[#FAF8F3] hover:border-[#123C2D] transition-all no-underline shrink-0 shadow-2xs self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-[#123C2D]" />
            <span>New Assessment</span>
          </Link>
        </div>

        {/* ── Error Banner ── */}
        {remoteError && (
          <div
            className="p-4 rounded-xl border flex items-start justify-between gap-3 transition-colors"
            style={{
              backgroundColor: '#FAEAEA',
              borderColor: '#E8A39C',
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#A4483E] mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[#A4483E]">
                  Unable to load assessment history
                </p>
                <p className="text-xs text-[#A4483E] leading-relaxed">
                  We couldn't retrieve your assessment records. Please try again. (
                  {extractApiErrorMessage(remoteError, remoteError.message)})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void refetch()}
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white border border-[#E8A39C] text-[#A4483E] hover:bg-stone-50 cursor-pointer shrink-0 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Search & Filter Toolbar ── */}
        <div className="p-4 rounded-2xl border border-[#E3DDCF] bg-white shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#68736B]" />
            <input
              type="text"
              placeholder="Search assessments by sample name or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-lg text-xs border border-[#E3DDCF] bg-[#FAF8F3] text-[#252B27] placeholder:text-[#68736B] focus:outline-none focus:border-[#123C2D] focus:bg-white transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-[#68736B] hover:text-[#252B27] cursor-pointer p-0.5"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdown & Sync status */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="text-xs font-medium text-[#68736B] whitespace-nowrap">
                Filter by status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'failed')}
                className="px-3 py-2 rounded-lg text-xs border border-[#E3DDCF] bg-[#FAF8F3] text-[#252B27] focus:outline-none focus:border-[#123C2D] cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {(remoteLoading || isFetching) && (
              <span className="flex items-center gap-1.5 text-xs text-[#68736B]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#123C2D]" />
                <span className="hidden sm:inline">Syncing…</span>
              </span>
            )}
          </div>
        </div>

        {/* ── Assessment History Table / State Card ── */}
        <div className="rounded-2xl border border-[#E3DDCF] bg-white shadow-2xs overflow-hidden">
          {remoteLoading && allItems.length === 0 ? (
            /* Loading State */
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#123C2D]" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-[#252B27]">
                  Loading assessment history...
                </p>
                <p className="text-xs text-[#68736B]">
                  Retrieving your previous coffee sample assessments.
                </p>
              </div>
            </div>
          ) : allItems.length === 0 ? (
            /* Empty State (No records exist) */
            <div className="py-20 px-4 text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#E9EFEA] flex items-center justify-center mx-auto text-[#123C2D]">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display text-2xl font-bold text-[#252B27]">
                  No assessments yet
                </h3>
                <p className="text-xs leading-relaxed text-[#68736B]">
                  Your analyzed coffee samples will appear here. Upload your first sample to begin
                  building your inspection history.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/assess"
                  className="btn-primary text-xs py-2.5 px-5 no-underline inline-flex shadow-sm"
                  style={{ backgroundColor: '#123C2D' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Analyze Your First Sample</span>
                </Link>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            /* No Search Results */
            <div className="py-16 px-4 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FAF8F3] border border-[#E3DDCF] flex items-center justify-center mx-auto text-[#68736B]">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-[#252B27]">
                  No matching assessments
                </h3>
                <p className="text-xs text-[#68736B] leading-relaxed">
                  Try a different search term or adjust your filters.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3.5 py-2 rounded-lg border border-[#E3DDCF] bg-[#FAF8F3] text-[#252B27] text-xs font-semibold hover:bg-white cursor-pointer transition-colors"
                >
                  Reset Search &amp; Filters
                </button>
              </div>
            </div>
          ) : (
            /* Table with Actual Records */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E3DDCF] bg-[#FAF8F3]">
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-[#68736B]">
                      Sample / Assessment
                    </th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-[#68736B]">
                      Assessment Date
                    </th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-[#68736B]">
                      Total Defect Regions
                    </th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-[#68736B]">
                      Assessment Status
                    </th>
                    <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[11px] text-[#68736B]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DDCF]">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.assessment_id}
                      className="hover:bg-[#FAF8F3] transition-colors group"
                    >
                      {/* Sample / Assessment Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <Link
                            to={`/assessments/${item.assessment_id}`}
                            className="font-mono font-semibold text-xs text-[#123C2D] hover:underline no-underline inline-flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#68736B]" />
                            <span>{item.assessment_id}</span>
                          </Link>
                          {item.model_version && (
                            <p className="text-[11px] text-[#68736B] font-mono">
                              {item.model_version}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Assessment Date Column */}
                      <td className="px-6 py-4 text-[#252B27] whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>

                      {/* Total Defect Regions Column */}
                      <td className="px-6 py-4">
                        {item.status === 'completed' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-sm text-[#252B27]">
                              {item.detection_count ?? 0}
                            </span>
                            <span className="text-[#68736B] text-[11px]">
                              {item.detection_count === 1 ? 'region' : 'regions'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#A4483E] font-medium">
                            {item.error_code || 'Analysis Failed'}
                          </span>
                        )}
                      </td>

                      {/* Assessment Status Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E9EFEA] text-[#26734D] border border-[#26734D]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#26734D]" />
                            Completed
                          </span>
                        ) : item.status === 'processing' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                            Processing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#A4483E] border border-[#A4483E]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A4483E]" />
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Action Column */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link
                          to={`/assessments/${item.assessment_id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#123C2D] hover:underline no-underline group-hover:text-[#174A37]"
                        >
                          <span>View Report</span>
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {(remoteData?.next_cursor || page > 0) && (
            <div className="px-6 py-4 border-t border-[#E3DDCF] bg-[#FAF8F3] flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0 || isFetching}
                className="px-3.5 py-2 rounded-lg border border-[#E3DDCF] bg-white text-[#252B27] font-semibold hover:bg-stone-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-[#68736B] font-medium">Page {page + 1}</span>
              <button
                type="button"
                onClick={next}
                disabled={!remoteData?.next_cursor || isFetching}
                className="px-3.5 py-2 rounded-lg border border-[#E3DDCF] bg-white text-[#252B27] font-semibold hover:bg-stone-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
