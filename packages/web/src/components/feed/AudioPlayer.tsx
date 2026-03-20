import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatMmSs(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface AudioPlayerProps {
  src: string
  duration?: number
}

export function AudioPlayer({ src, duration: durationProp }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(durationProp ?? 0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function onTimeUpdate() {
      setElapsed(audio!.currentTime)
      setProgress(audio!.duration ? (audio!.currentTime / audio!.duration) * 100 : 0)
    }
    function onLoadedMetadata() {
      setDuration(audio!.duration)
    }
    function onEnded() {
      setPlaying(false)
      setElapsed(0)
      setProgress(0)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      await audio.play()
      setPlaying(true)
    }
  }, [playing])

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const pct = Number(e.target.value)
    const time = (pct / 100) * audio.duration
    audio.currentTime = time
    setElapsed(time)
    setProgress(pct)
  }

  // Waveform bars — decorative static SVG
  const bars = Array.from({ length: 40 }, (_, i) => {
    const heights = [4, 8, 12, 16, 20, 24, 20, 16, 12, 8]
    return heights[i % heights.length]
  })
  const filled = Math.round((progress / 100) * bars.length)

  return (
    <div className="rounded-xl border border-warm-200 bg-warm-50 p-4 dark:border-warm-700 dark:bg-warm-900">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Waveform */}
      <div className="flex items-center gap-0.5 h-8 mb-3">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn(
              'w-1 rounded-full flex-shrink-0 transition-colors',
              i < filled
                ? 'bg-warm-900 dark:bg-warm-100'
                : 'bg-warm-300 dark:bg-warm-600'
            )}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <input
        type="range"
        min={0}
        max={100}
        value={progress}
        onChange={handleSeek}
        className="w-full h-1 accent-warm-900 dark:accent-warm-100 mb-3 cursor-pointer"
      />

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-900 text-white hover:bg-warm-700 transition-colors dark:bg-warm-100 dark:text-warm-900 dark:hover:bg-warm-200"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <div className="flex items-center gap-1 text-sm font-mono text-warm-600 dark:text-warm-400">
          <span>{formatMmSs(elapsed)}</span>
          <span className="text-warm-300 dark:text-warm-600">/</span>
          <span>{formatMmSs(duration)}</span>
        </div>
      </div>
    </div>
  )
}
