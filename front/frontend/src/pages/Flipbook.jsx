import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import HTMLFlipBook from 'react-pageflip'

export default function Flipbook() {
  const { id } = useParams()
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const bookRef = useRef()
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [loadedSet, setLoadedSet] = useState(() => new Set())
  const audioRef = useRef(null)
  const [flipSoundPlayed, setFlipSoundPlayed] = useState(false)
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024))
  const [vh, setVh] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 768))

  const flipPrev = () => bookRef.current?.pageFlip?.()?.flipPrev()
  const flipNext = () => bookRef.current?.pageFlip?.()?.flipNext()

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/flipbook/${id}`)
        const urls = res?.data?.pages || []
        setPages(urls)
      } catch (err) {
        console.error(err)
        setError('Impossible de récupérer les pages. Assurez-vous que le backend renvoie { pages: [...] }')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  useEffect(() => {
    // Init audio once
    if (!audioRef.current) {
      const audio = new Audio('/page-flip.mp3')
      audio.preload = 'auto'
      audio.volume = 0.6
      audioRef.current = audio
    }

    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { onFlipStart(); flipPrev() }
      if (e.key === 'ArrowRight') { onFlipStart(); flipNext() }
    }
    window.addEventListener('keydown', onKey)
    const onResize = () => {
      setVw(window.innerWidth)
      setVh(window.innerHeight)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const onFlipStart = () => {
    setIsFlipping(true)
    setFlipSoundPlayed(false)
    // Play immediately for button/keyboard flips
    try {
      if (audioRef.current && !flipSoundPlayed) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
        setFlipSoundPlayed(true)
      }
    } catch {}
  }

  const onFlip = (e) => {
    const nextPage = e?.data ?? 0
    setCurrentPage(nextPage)
    // If flip initiated by swipe, sound might not have played yet
    if (!flipSoundPlayed) {
      try {
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch(() => {})
          setFlipSoundPlayed(true)
        }
      } catch {}
    }
    if (loadedSet.has(nextPage)) {
      setIsFlipping(false)
    }
  }

  const handleImgLoad = (idx) => {
    setLoadedSet((prev) => {
      const ns = new Set(prev)
      ns.add(idx)
      return ns
    })
    if (idx === currentPage) setIsFlipping(false)
    // Reset sound flag for next flip cycle
    if (idx === currentPage) setFlipSoundPlayed(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">Chargement du flipbook...</div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-red-600 mb-4">{error}</div>
        <Link className="text-blue-600 underline" to="/">Retour</Link>
      </div>
    )
  }

  if (!pages.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-gray-700 mb-4">Aucune page à afficher.</div>
        <Link className="text-blue-600 underline" to="/">Retour</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold">Flipbook</h1>
          <div className="text-xs text-gray-500">ID: <span className="font-mono">{id}</span></div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { onFlipStart(); flipPrev() }}
            className="px-3 py-1 rounded border border-gray-900 text-gray-900 bg-white hover:bg-gray-100"
          >
            ◀︎ Précédent
          </button>
          <span className="text-sm text-gray-600">Page {currentPage + 1} / {pages.length}</span>
          <button
            onClick={() => { onFlipStart(); flipNext() }}
            className="px-3 py-1 rounded border border-gray-900 text-gray-900 bg-white hover:bg-gray-100"
          >
            Suivant ▶︎
          </button>
          <button
            onClick={async () => {
              const url = `${window.location.origin}/flipbook/${id}`
              try { await navigator.clipboard.writeText(url) } catch {}
            }}
            className="px-3 py-1 bg-black text-white rounded hover:bg-black/90"
            title="Copier le lien"
          >
            Copier le lien
          </button>
        </div>
      </div>

      <div className="relative rounded-lg p-6 bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-inner">
        <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 h-[calc(100%-3rem)] w-2 rounded bg-gradient-to-r from-black/10 via-black/5 to-transparent"></div>

        <div className="relative z-0 mx-auto">
          {(() => {
            // Responsive sizing
            const isMobile = vw < 640
            const paddingY = 160 // approx header + paddings
            const maxW = Math.min(1200, vw - 32)
            const minW = 320
            const targetW = Math.max(minW, Math.min(maxW, isMobile ? vw - 32 : 560))
            const aspect = 760 / 560 // height / width
            const maxH = Math.min(1600, vh - paddingY)
            let targetH = Math.min(maxH, Math.max(420, Math.round(targetW * aspect)))
            // Ensure width fits height too
            const adjustedW = Math.round(Math.min(targetW, targetH / aspect))
            const adjustedH = Math.round(adjustedW * aspect)
            return (
              <HTMLFlipBook
                width={adjustedW}
                height={adjustedH}
                size="stretch"
                minWidth={360}
                maxWidth={1200}
                minHeight={420}
                maxHeight={1600}
                maxShadowOpacity={0.5}
                drawShadow={true}
                flippingTime={700}
                showCover={false}
                usePortrait={isMobile}
                mobileScrollSupport={true}
                ref={bookRef}
                onFlip={onFlip}
                className="mx-auto drop-shadow-2xl"
              >
                {pages.map((url, idx) => (
                  <div key={idx} className="page bg-neutral-50">
                    <div className="relative w-full h-full">
                      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/10 to-transparent" />
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/10 to-transparent" />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.03),transparent_70%)]" />
                      <img
                        src={url}
                        alt={`page-${idx + 1}`}
                        className="block w-full h-full object-contain"
                        loading="lazy"
                        onLoad={() => handleImgLoad(idx)}
                      />
                    </div>
                  </div>
                ))}
              </HTMLFlipBook>
            )
          })()}
          <div className="absolute inset-y-0 left-0 w-[15%] z-10 cursor-pointer" onClick={() => { onFlipStart(); flipPrev() }} />
          <div className="absolute inset-y-0 right-0 w-[15%] z-10 cursor-pointer" onClick={() => { onFlipStart(); flipNext() }} />
        </div>
      </div>

      <div className="mt-4">
        <Link className="text-blue-600 underline" to="/">← Retour à l'upload</Link>
      </div>
    </div>
  )
}
