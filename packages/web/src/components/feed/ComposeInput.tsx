import { useState, useRef, useCallback, useEffect } from 'react'
import { Plus, Send, Mic, Camera, Paperclip } from 'lucide-react'
import { usePostMessage } from '@/hooks/useFeed'
import { useCreateContentItem } from '@/hooks/useContentItem'
import { showToast } from '@/components/shared/ToastProvider'
import { CURRENT_USER_ID } from '@csf-live/shared/constants'
import { cn } from '@/lib/utils'

interface ComposeInputProps {
  discussionId: string
  projectId?: string | null
}

type Mode = 'text' | 'enhanced'

function isUrl(text: string): boolean {
  try {
    const url = new URL(text.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function ComposeInput({ discussionId, projectId }: ComposeInputProps) {
  const [mode, setMode] = useState<Mode>('text')
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const recordingStartRef = useRef<number>(0)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const postMessage = usePostMessage()
  const createContentItem = useCreateContentItem()

  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setMode('enhanced')
        setTimeout(() => textareaRef.current?.focus(), 0)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed) return

    if (isUrl(trimmed)) {
      const url = new URL(trimmed)
      await createContentItem.mutateAsync({
        type: 'link',
        title: null,
        body: null,
        mediaUrl: trimmed,
        mediaType: null,
        metadata: {
          title: trimmed,
          description: null,
          favicon: null,
          ogImage: null,
          domain: url.hostname,
        },
        source: 'human',
        sourceDetail: null,
        projectId: projectId ?? null,
        sectionId: null,
        parentId: null,
        authorId: CURRENT_USER_ID,
      })
    } else {
      await postMessage.mutateAsync({ discussionId, content: trimmed })
    }

    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, discussionId, projectId, postMessage, createContentItem])

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  // Voice recording
  async function handleVoicePointerDown(e: React.PointerEvent) {
    e.preventDefault()
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Voice recording is not supported in this browser', 'error')
      return
    }
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      showToast('Microphone access denied', 'error')
      return
    }
    recordingChunksRef.current = []
    recordingStartRef.current = Date.now()
    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) recordingChunksRef.current.push(ev.data)
    }
    recorder.start()
    setIsRecording(true)
  }

  async function handleVoicePointerUp() {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    const durationMs = Date.now() - recordingStartRef.current
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve()
      recorder.stop()
      recorder.stream.getTracks().forEach(t => t.stop())
    })
    setIsRecording(false)
    const blob = new Blob(recordingChunksRef.current, { type: 'audio/webm' })
    const blobUrl = URL.createObjectURL(blob)
    await createContentItem.mutateAsync({
      type: 'voice',
      title: 'Voice note',
      body: null,
      mediaUrl: blobUrl,
      mediaType: 'audio/webm',
      metadata: { duration: durationMs },
      source: 'human',
      sourceDetail: null,
      projectId: projectId ?? null,
      sectionId: null,
      parentId: null,
      authorId: CURRENT_USER_ID,
    })
    setMode('text')
  }

  // Photo capture
  function handleCameraClick() {
    cameraInputRef.current?.click()
  }

  async function handleCameraFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const blobUrl = URL.createObjectURL(file)
    await createContentItem.mutateAsync({
      type: 'photo',
      title: file.name || 'Photo',
      body: null,
      mediaUrl: blobUrl,
      mediaType: file.type,
      metadata: {},
      source: 'human',
      sourceDetail: null,
      projectId: projectId ?? null,
      sectionId: null,
      parentId: null,
      authorId: CURRENT_USER_ID,
    })
    // Reset input so the same file can be selected again
    e.target.value = ''
    setMode('text')
  }

  // File upload
  function handleFileClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const blobUrl = URL.createObjectURL(file)
    await createContentItem.mutateAsync({
      type: 'file',
      title: file.name,
      body: null,
      mediaUrl: blobUrl,
      mediaType: file.type,
      metadata: { fileName: file.name, fileSize: file.size, mimeType: file.type },
      source: 'human',
      sourceDetail: null,
      projectId: projectId ?? null,
      sectionId: null,
      parentId: null,
      authorId: CURRENT_USER_ID,
    })
    e.target.value = ''
    setMode('text')
  }

  const isLoading = postMessage.isPending || createContentItem.isPending

  return (
    <div className="border-t border-warm-200 dark:border-warm-800 bg-white dark:bg-warm-950 p-3">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {mode === 'enhanced' && (
        <div className="mb-2 flex items-center gap-2 pb-2 border-b border-warm-100 dark:border-warm-800">
          {isRecording ? (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Recording…
            </div>
          ) : (
            <>
              <button
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-warm-500 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors select-none"
                onPointerDown={handleVoicePointerDown}
                onPointerUp={handleVoicePointerUp}
              >
                <Mic size={14} />
                Voice
              </button>
              <button
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-warm-500 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                onClick={handleCameraClick}
              >
                <Camera size={14} />
                Photo
              </button>
              <button
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-warm-500 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                onClick={handleFileClick}
              >
                <Paperclip size={14} />
                File
              </button>
            </>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={() => setMode(m => (m === 'text' ? 'enhanced' : 'text'))}
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors',
            mode === 'enhanced'
              ? 'bg-warm-900 text-white dark:bg-warm-100 dark:text-warm-900'
              : 'text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800 hover:text-warm-600 dark:hover:text-warm-300'
          )}
          aria-label="Toggle enhanced capture"
        >
          <Plus
            size={16}
            className={cn(
              'transition-transform duration-200',
              mode === 'enhanced' && 'rotate-45'
            )}
          />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Message or capture an idea…"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-warm-900 placeholder-warm-400 focus:border-warm-400 focus:bg-white focus:outline-none dark:border-warm-700 dark:bg-warm-900 dark:text-warm-100 dark:placeholder-warm-500 dark:focus:bg-warm-800 transition-colors"
          style={{ maxHeight: '120px' }}
        />

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-warm-900 text-white hover:bg-warm-700 disabled:opacity-40 dark:bg-warm-100 dark:text-warm-900 dark:hover:bg-warm-200 transition-colors"
          aria-label="Send"
        >
          <Send size={14} />
        </button>
      </div>

      <div className="mt-1 text-xs text-warm-400 dark:text-warm-500">
        <kbd className="rounded px-1 py-0.5 bg-warm-100 dark:bg-warm-800 font-mono text-[10px]">
          ⌘
        </kbd>{' '}
        <kbd className="rounded px-1 py-0.5 bg-warm-100 dark:bg-warm-800 font-mono text-[10px]">
          ↵
        </kbd>{' '}
        to send
      </div>
    </div>
  )
}
