import { useEffect, useRef, useState, useCallback } from 'react'
import { Tldraw, type Editor, createShapeId } from 'tldraw'
import 'tldraw/tldraw.css'
import { useNavigate } from '@tanstack/react-router'
import { useScratchpadCanvas, useSaveCanvas, useSaveAndCloseCanvas } from '@/hooks/useCanvas'
import { useProjects } from '@/hooks/useProjects'
import { useDarkMode } from '@/hooks/useDarkMode'
import { Save, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProjectNodeShapeUtil } from './ProjectNodeShapeUtil'
import { FeedNodeShapeUtil } from './FeedNodeShapeUtil'
import type { TLProjectNodeShape } from './ProjectNodeShapeUtil'

const CUSTOM_SHAPE_UTILS = [ProjectNodeShapeUtil, FeedNodeShapeUtil]

const DRAFT_KEY = 'csf-live:canvas-draft'
const DRAFT_TS_KEY = 'csf-live:canvas-draft-ts'
const SAVE_DEBOUNCE_MS = 3000
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 1 week

interface DraftRecoveryBannerProps {
  onAccept: () => void
  onDismiss: () => void
}

function DraftRecoveryBanner({ onAccept, onDismiss }: DraftRecoveryBannerProps) {
  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 shadow-md dark:border-amber-700 dark:bg-amber-950">
      <span className="text-sm text-amber-800 dark:text-amber-200">
        You have unsaved changes from a previous session.
      </span>
      <button
        onClick={onAccept}
        className="rounded-md bg-amber-800 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
      >
        Restore
      </button>
      <button
        onClick={onDismiss}
        className="rounded-md px-2 py-1 text-xs text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900 transition-colors"
      >
        Discard
      </button>
    </div>
  )
}

export function ScratchpadCanvas() {
  const navigate = useNavigate()
  const { data: savedDoc } = useScratchpadCanvas()
  const saveCanvas = useSaveCanvas()
  const saveAndCloseCanvas = useSaveAndCloseCanvas()
  const { data: projects = [] } = useProjects()
  const { isDark } = useDarkMode()
  const editorRef = useRef<Editor | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [draftDoc, setDraftDoc] = useState<unknown>(null)
  const [targetProjectId, setTargetProjectId] = useState<string | null>(null)
  const [showSaveMenu, setShowSaveMenu] = useState(false)
  // Tracks when the editor has mounted so the project-sync effect can re-run
  const [editorMounted, setEditorMounted] = useState(false)

  // Check for a recoverable draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    const draftTs = localStorage.getItem(DRAFT_TS_KEY)
    if (draft && draftTs) {
      const ts = Number(draftTs)
      const ageMs = Date.now() - ts
      if (ageMs < DRAFT_MAX_AGE_MS) {
        try {
          const parsed = JSON.parse(draft)
          setDraftDoc(parsed)
          setShowDraftBanner(true)
        } catch {
          localStorage.removeItem(DRAFT_KEY)
          localStorage.removeItem(DRAFT_TS_KEY)
        }
      }
    }
  }, [])

  // Sync project/feed nodes into the canvas. Called as a useEffect and also
  // imperatively after loadSnapshot (which would otherwise wipe the nodes).
  const syncProjectNodes = useCallback(
    (editor: Editor) => {
      if (projects.length === 0) return
      const shapes = editor.getCurrentPageShapes()
      let addedAny = false

      // Add Feed node if missing
      const hasFeedNode = shapes.some(s => s.type === 'feed-node')
      if (!hasFeedNode) {
        editor.createShape({
          id: createShapeId('feed-node'),
          type: 'feed-node',
          x: 40,
          y: 40,
          props: { w: 140, h: 48 },
        })
        addedAny = true
      }

      // Add project nodes for any missing projects
      const existingProjectNodeIds = shapes
        .filter(s => s.type === 'project-node')
        .map(s => (s as TLProjectNodeShape).props.projectId)

      projects.forEach((project, index) => {
        if (existingProjectNodeIds.includes(project.id)) return
        editor.createShape({
          id: createShapeId('project-node-' + project.id),
          type: 'project-node',
          x: 40,
          y: 100 + index * 62,
          props: {
            projectId: project.id,
            title: project.title,
            slug: project.slug,
            status: project.status,
            unreadCount: 0,
            w: 180,
            h: 52,
          },
        })
        addedAny = true
      })

      // Zoom to fit after placing nodes for the first time on a fresh canvas
      if (addedAny) {
        editor.zoomToFit({ animation: { duration: 0 } })
      }
    },
    [projects]
  )

  // Sync nodes when both editor and projects are ready.
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || projects.length === 0) return
    syncProjectNodes(editor)
  }, [projects, editorMounted, syncProjectNodes])

  const handleEditorMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor

      // Apply dark mode preference
      editor.user.updateUserPreferences({ colorScheme: isDark ? 'dark' : 'light' })

      // Load saved snapshot (skip if we're about to show a draft banner)
      if (savedDoc && !showDraftBanner) {
        try {
          editor.loadSnapshot(savedDoc as Parameters<typeof editor.loadSnapshot>[0])
        } catch {
          // Incompatible snapshot — start blank
        }
      }

      // Auto-save draft to localStorage on every store change
      const unsub = editor.store.listen(() => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(() => {
          try {
            const snapshot = editor.getSnapshot()
            localStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot))
            localStorage.setItem(DRAFT_TS_KEY, String(Date.now()))
          } catch {
            // Quota exceeded or serialization error — ignore
          }
        }, SAVE_DEBOUNCE_MS)
      })

      // Signal that the editor is ready — triggers the project-sync effect
      setEditorMounted(true)

      return unsub
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDark, savedDoc]
  )

  function acceptDraft() {
    setShowDraftBanner(false)
    const editor = editorRef.current
    if (!editor) return
    if (draftDoc) {
      try {
        editor.loadSnapshot(draftDoc as Parameters<typeof editor.loadSnapshot>[0])
      } catch {
        // ignore
      }
    }
    syncProjectNodes(editor)
  }

  function dismissDraft() {
    setShowDraftBanner(false)
    localStorage.removeItem(DRAFT_KEY)
    localStorage.removeItem(DRAFT_TS_KEY)
    const editor = editorRef.current
    if (!editor) return
    if (savedDoc) {
      try {
        editor.loadSnapshot(savedDoc as Parameters<typeof editor.loadSnapshot>[0])
      } catch {
        // ignore
      }
    }
    syncProjectNodes(editor)
  }

  async function handleSave() {
    if (!editorRef.current) return
    const snapshot = editorRef.current.getSnapshot()
    await saveCanvas.mutateAsync(snapshot)
    localStorage.removeItem(DRAFT_KEY)
    localStorage.removeItem(DRAFT_TS_KEY)
  }

  async function handleSaveAndClose() {
    if (!editorRef.current) return
    const snapshot = editorRef.current.getSnapshot()
    await saveAndCloseCanvas.mutateAsync({
      tldrawDoc: snapshot,
      targetProjectId,
    })
    localStorage.removeItem(DRAFT_KEY)
    localStorage.removeItem(DRAFT_TS_KEY)
    navigate({ to: '/feed' })
  }

  return (
    <div className="h-full w-full">
      {showDraftBanner && (
        <DraftRecoveryBanner onAccept={acceptDraft} onDismiss={dismissDraft} />
      )}

      {/* Save controls */}
      <div className="absolute top-2 right-3 z-10 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowSaveMenu(m => !m)}
            className="flex items-center gap-1.5 rounded-lg border border-warm-200 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-warm-700 hover:bg-warm-50 dark:border-warm-700 dark:bg-warm-900/90 dark:text-warm-300 dark:hover:bg-warm-800 transition-colors shadow-sm"
          >
            <Save size={14} />
            Save
            <ChevronDown size={12} />
          </button>
          {showSaveMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-lg border border-warm-200 bg-white shadow-lg dark:border-warm-700 dark:bg-warm-900 z-20">
              <div className="p-1">
                <button
                  onClick={() => {
                    handleSave()
                    setShowSaveMenu(false)
                  }}
                  className="w-full rounded-md px-3 py-2 text-sm text-left text-warm-700 hover:bg-warm-100 dark:text-warm-300 dark:hover:bg-warm-800 transition-colors"
                >
                  Save to Feed
                </button>
                {projects
                  .filter(p => p.status === 'active')
                  .map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setTargetProjectId(p.id)
                        handleSave()
                        setShowSaveMenu(false)
                      }}
                      className="w-full rounded-md px-3 py-2 text-sm text-left text-warm-700 hover:bg-warm-100 dark:text-warm-300 dark:hover:bg-warm-800 transition-colors"
                    >
                      Save to {p.title}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSaveAndClose}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border border-warm-200 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-sm font-medium transition-colors shadow-sm',
            'text-warm-700 hover:bg-warm-50 dark:border-warm-700 dark:bg-warm-900/90 dark:text-warm-300 dark:hover:bg-warm-800'
          )}
        >
          Save &amp; Close
        </button>
      </div>

      <Tldraw shapeUtils={CUSTOM_SHAPE_UTILS} onMount={handleEditorMount} />
    </div>
  )
}
