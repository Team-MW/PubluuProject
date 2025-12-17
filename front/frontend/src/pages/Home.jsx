import React from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-b from-white to-neutral-100">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Transformez vos PDF en <span className="underline decoration-black/20">flipbooks</span> élégants
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-600">
              Téléchargez un PDF et obtenez un flipbook interactif alimenté par Cloudinary. Simple, rapide, partageable.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/upload')}
                className="px-5 py-2.5 rounded-md bg-black text-white hover:bg-black/90 transition active:translate-y-[1px] shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-black/30"
              >
                Commencer
              </button>
              <Link
                to="/flipbook/demo"
                className="px-5 py-2.5 rounded-md border border-gray-900 text-gray-900 bg-white hover:bg-gray-100 transition active:translate-y-[1px] shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                Voir un exemple
              </Link>
            </div>
            <div className="mt-6 text-xs text-gray-500">codé par microdidact</div>
          </div>
          <div>
            <div className="relative rounded-xl border border-gray-200 bg-white shadow p-4">
              <div className="absolute -top-3 -left-3 h-12 w-12 bg-black text-white rounded-full grid place-items-center text-sm font-semibold">
                PDF
              </div>
              <div className="aspect-[4/3] w-full bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.03),transparent_70%)] rounded-md grid place-items-center">
                <span className="text-gray-500">Votre flipbook apparaîtra ici</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="h-2 rounded bg-gray-200" />
                <div className="h-2 rounded bg-gray-200" />
                <div className="h-2 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
