'use client'

import { useEffect, useRef, useState } from 'react'

export default function WeddingMusic({ url }: { url?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!url) return
    const audio = audioRef.current
    if (!audio) return
    audio.loop = true
    audio.volume = 0.35
    setReady(true)

    const pausedByGuest = localStorage.getItem('wedding-music-paused') === 'true'
    if (pausedByGuest) return

    const begin = async () => {
      try {
        await audio.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
      window.removeEventListener('pointerdown', begin)
      window.removeEventListener('keydown', begin)
    }

    window.addEventListener('pointerdown', begin, { once: true })
    window.addEventListener('keydown', begin, { once: true })

    return () => {
      window.removeEventListener('pointerdown', begin)
      window.removeEventListener('keydown', begin)
    }
  }, [url])

  async function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
      localStorage.setItem('wedding-music-paused', 'true')
    } else {
      try {
        await audio.play()
        setPlaying(true)
        localStorage.removeItem('wedding-music-paused')
      } catch {}
    }
  }

  if (!ready || !url) return null

  return (
    <>
      <audio ref={audioRef} src={url} preload="metadata" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause wedding music' : 'Play wedding music'}
        className="fixed z-40 right-4 bottom-4 md:right-6 md:bottom-6 w-12 h-12 rounded-full border border-white/40 bg-[#173f3b]/95 text-[#f8f5ef] shadow-[0_12px_35px_rgba(23,63,59,.28)] backdrop-blur flex items-center justify-center hover:scale-105 transition-transform"
      >
        {playing ? (
          <span className="flex items-end gap-[3px] h-4" aria-hidden="true">
            <span className="w-[3px] h-3 bg-current animate-pulse" />
            <span className="w-[3px] h-5 bg-current animate-pulse [animation-delay:.15s]" />
            <span className="w-[3px] h-3.5 bg-current animate-pulse [animation-delay:.3s]" />
          </span>
        ) : (
          <span className="ml-0.5 text-sm" aria-hidden="true">▶</span>
        )}
      </button>
    </>
  )
}
