import React, { useState } from 'react'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
        headers: { 'Content-Type': 'multipart/form-data' },
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
        <input
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          className="block w-full text-sm text-gray-700"
        />

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

      <p className="text-gray-500 text-sm mt-4">Le backend doit écouter sur http://localhost:8000</p>
    </div>
  )
}
