import React, { useState } from 'react'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const navigate = useNavigate()

  const onFileChange = (e) => {
    setError('')
    const f = e.target.files?.[0]
    if (f && f.type === 'application/pdf') {
      setFile(f)
    } else {
      setFile(null)
      setError('Veuillez sélectionner un fichier PDF.')
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError('')
    const f = e.dataTransfer?.files?.[0]
    if (f && (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) {
      setFile(f)
    } else {
      setFile(null)
      setError('Veuillez déposer un fichier PDF.')
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Aucun fichier sélectionné.')
      return
    }

    try {
      setLoading(true)
      const form = new FormData()
      form.append('file', file)

      const res = await api.post('/upload', form, {
        // Let Axios set the correct multipart boundary automatically
      })

      const id = res?.data?.id
      if (!id) throw new Error('Réponse invalide du serveur')
      navigate(`/flipbook/${id}`)
    } catch (err) {
      console.error(err)
      setError("Échec de l'upload. Vérifiez le backend.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Uploader un PDF</h1>

      <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded p-6 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <p className="text-sm text-gray-700 mb-2">Glissez-déposez votre PDF ici</p>
          <p className="text-xs text-gray-500 mb-4">ou</p>
          <label className="inline-block px-3 py-1 bg-gray-100 rounded cursor-pointer text-sm">
            Choisir un fichier
            <input
              type="file"
              accept="application/pdf"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
          {file && (
            <div className="mt-3 text-xs text-gray-600">Sélectionné: {file.name}</div>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white/95 rounded-lg shadow p-6 flex flex-col items-center gap-3 w-[90%] max-w-sm">
            <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm text-gray-700 text-center">
              Traitement du PDF en flipbook...<br/>
              Cela peut prendre quelques secondes selon la taille du document.
            </div>
          </div>
        </div>
      )}

      <p className="text-gray-500 text-sm mt-4">Le backend doit écouter sur http://localhost:8000</p>
    </div>
  )
}
