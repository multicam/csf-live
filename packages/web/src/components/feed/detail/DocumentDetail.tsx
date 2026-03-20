import type { ContentItem } from '@csf-live/shared'
import { DOCUMENT_TYPE_LABELS } from '@csf-live/shared/constants'
import { DocumentEditor } from '@/components/editor/DocumentEditor'

interface DocumentDetailProps {
  item: ContentItem
  onClose?: () => void
}

export function DocumentDetail({ item, onClose }: DocumentDetailProps) {
  const docType = item.metadata?.document_type as string | undefined
  const docTypeLabel = docType ? (DOCUMENT_TYPE_LABELS[docType] ?? docType) : null

  return (
    <div className="flex h-full flex-col">
      {/* Document type badge in header area */}
      {docTypeLabel && (
        <div className="px-4 pt-3 pb-0">
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400 uppercase tracking-wide">
            {docTypeLabel}
          </span>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <DocumentEditor itemId={item.id} onClose={onClose} />
      </div>
    </div>
  )
}
