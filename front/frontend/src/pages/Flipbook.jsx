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
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') flipPrev()
      if (e.key === 'ArrowRight') flipNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Flipbook – ID: {id}</h1>
        <div className="space-x-2">
          <button
            onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            ◀︎ Précédent
          </button>
          <button
            onClick={() => bookRef.current?.pageFlip()?.flipNext()}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Suivant ▶︎
          </button>
        </div>
      </div>

      <div className="relative rounded-lg p-6 bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-inner">
        <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 h-[calc(100%-3rem)] w-2 rounded bg-gradient-to-r from-black/10 via-black/5 to-transparent"></div>

        <div className="relative z-0 mx-auto">
          <HTMLFlipBook
            width={560}
            height={760}
            size="stretch"
            minWidth={360}
            maxWidth={1200}
            minHeight={420}
            maxHeight={1600}
            maxShadowOpacity={0.5}
            drawShadow={true}
            flippingTime={700}
            showCover={false}
            usePortrait={false}
            mobileScrollSupport={true}
            ref={bookRef}
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
                  />
                </div>
              </div>
            ))}
          </HTMLFlipBook>
          <div className="absolute inset-y-0 left-0 w-[15%] z-10 cursor-pointer" onClick={flipPrev} />
          <div className="absolute inset-y-0 right-0 w-[15%] z-10 cursor-pointer" onClick={flipNext} />
        </div>
      </div>

      <div className="mt-4">
        <Link className="text-blue-600 underline" to="/">← Retour à l'upload</Link>
      </div>
    </div>
  )
}
