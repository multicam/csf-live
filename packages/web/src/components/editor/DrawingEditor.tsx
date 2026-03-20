import { useEffect, useRef } from 'react'
import { Tldraw, type Editor } from 'tldraw'
import 'tldraw/tldraw.css'
import { useContentItem, useUpdateContentItemVersion } from '@/hooks/useContentItem'

interface DrawingEditorProps {
  itemId: string
  onClose?: () => void
}

const DRAFT_KEY = (id: string) => `drawing-draft-${id}`

export function DrawingEditor({ itemId }: DrawingEditorProps) {
  const { data: item, isLoading } = useContentItem(itemId)
  const updateVersion = useUpdateContentItemVersion()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef = useRef<Editor | null>(null)

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  function handleMount(editor: Editor) {
    editorRef.current = editor

    // Load from localStorage draft first, then item mediaData
    const savedDraft = localStorage.getItem(DRAFT_KEY(itemId))
    const initialData = savedDraft
      ? JSON.parse(savedDraft)
      : (item?.metadata?.mediaData ?? null)

    if (initialData) {
      try {
        editor.loadSnapshot(initialData as Parameters<typeof editor.loadSnapshot>[0])
      } catch {
        // ignore incompatible snapshot
      }
    }

    // Auto-save to localStorage on every user change (3s debounce)
    editor.store.listen(() => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        try {
          const snapshot = editor.getSnapshot()
          localStorage.setItem(DRAFT_KEY(itemId), JSON.stringify(snapshot))
        } catch {
          // ignore quota errors
        }
      }, 3000)
    }, { scope: 'document', source: 'user' })
  }

  async function handleSave() {
    if (!editorRef.current) return
    const snapshot = editorRef.current.getSnapshot()
    await updateVersion.mutateAsync({
      itemId,
      mediaData: snapshot,
      changeSummary: 'Drawing save',
    })
    localStorage.removeItem(DRAFT_KEY(itemId))
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-warm-950">
        <div className="text-sm text-warm-400 dark:text-warm-500">Loading drawing…</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-warm-950">
        <div className="text-sm text-warm-400 dark:text-warm-500">Drawing not found</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Save button bar */}
      <div className="flex items-center justify-end border-b border-warm-200 dark:border-warm-800 px-3 py-2 bg-white dark:bg-warm-950 flex-shrink-0">
        {updateVersion.isPending && (
          <span className="mr-2 text-xs text-warm-400 dark:text-warm-500">Saving…</span>
        )}
        <button
          onClick={handleSave}
          disabled={updateVersion.isPending}
          className="rounded-md bg-warm-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-warm-700 disabled:opacity-50 dark:bg-warm-100 dark:text-warm-900 dark:hover:bg-warm-200 transition-colors"
        >
          Save
        </button>
      </div>

      {/* Tldraw canvas — must have fixed height and overflow hidden */}
      <div className="flex-1 overflow-hidden">
        <Tldraw onMount={handleMount} />
      </div>
    </div>
  )
}
