import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Upload from './pages/Upload'
import Flipbook from './pages/Flipbook'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-gray-800">Flipbook PDF</Link>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/flipbook/:id" element={<Flipbook />} />
        </Routes>
      </main>

      <footer className="border-t bg-white text-center text-sm text-gray-500 py-3">
        <div className="max-w-4xl mx-auto px-4">codé par microdidact</div>
      </footer>
    </div>
  )
}
