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
    <div className="max-w-5xl mx-auto px-4 py-6">
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

      <div className="bg-white shadow p-4 overflow-auto">
        <HTMLFlipBook
          width={500}
          height={700}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1536}
          maxShadowOpacity={0.3}
          showCover={false}
          mobileScrollSupport={true}
          ref={bookRef}
          className="mx-auto"
        >
          {pages.map((url, idx) => (
            <div key={idx} className="page bg-white">
              <img
                src={url}
                alt={`page-${idx + 1}`}
                className="block w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      <div className="mt-4">
        <Link className="text-blue-600 underline" to="/">← Retour à l'upload</Link>
      </div>
    </div>
  )
}
