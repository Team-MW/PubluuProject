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

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Rapide</h3>
            <p className="mt-2 text-sm text-gray-600">Upload instantané et rendu via Cloudinary. Aucune installation lourde.</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Simple</h3>
            <p className="mt-2 text-sm text-gray-600">Une interface claire pour transformer vos PDF en flipbooks élégants.</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Partageable</h3>
            <p className="mt-2 text-sm text-gray-600">Obtenez une URL sécurisée à partager en un clic.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold">Comment ça marche ?</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Étape 1</div>
            <h4 className="mt-1 font-semibold">Uploader</h4>
            <p className="mt-2 text-sm text-gray-600">Glissez-déposez votre PDF ou sélectionnez-le depuis votre ordinateur.</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Étape 2</div>
            <h4 className="mt-1 font-semibold">Génération</h4>
            <p className="mt-2 text-sm text-gray-600">Nous préparons les pages et créons votre flipbook.</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Étape 3</div>
            <h4 className="mt-1 font-semibold">Partage</h4>
            <p className="mt-2 text-sm text-gray-600">Copiez le lien du flipbook et partagez-le où vous voulez.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow">
          <h3 className="text-2xl font-bold">Prêt à créer votre flipbook ?</h3>
          <p className="mt-2 text-gray-600">Commencez maintenant et obtenez une page feuilletable en quelques secondes.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 rounded-md bg-black text-white hover:bg-black/90 transition active:translate-y-[1px] shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-black/30"
            >
              Commencer
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
