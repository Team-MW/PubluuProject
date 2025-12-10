# Frontend React (Vite) – Flipbook PDF

## Prérequis
- Node.js 18+

## Installation

```bash
npm install
```

Si vous utilisez un dossier parent, exécutez ces commandes dans `frontend/`.

## Lancer le serveur de dev

```bash
npm run dev
```

Ouvrez l'URL indiquée (par défaut http://localhost:5173).

Le backend FastAPI doit être disponible sur `http://localhost:8000`.

## Fonctionnalités
- Page d'upload de fichier PDF (`/`) envoyant vers `POST http://localhost:8000/upload`.
- Redirection automatique vers `/flipbook/:id` après upload.
- Récupération des pages via `GET http://localhost:8000/flipbook/:id` et affichage en flipbook avec `react-pageflip`.

## Structure
```
frontend/
 ├─ src/
 │   ├─ pages/
 │   │   ├─ Upload.jsx
 │   │   ├─ Flipbook.jsx
 │   ├─ App.jsx
 │   ├─ main.jsx
 ├─ public/
 ├─ package.json
```

## Dépendances à installer
Ces commandes seront exécutées par `npm install` grâce au package.json :
- react, react-dom, react-router-dom
- axios
- react-pageflip
- tailwindcss, postcss, autoprefixer
- vite, @vitejs/plugin-react

## Notes
- Assurez-vous que le backend gère CORS si nécessaire.
- L'endpoint `/upload` doit retourner `{ id: "xxx" }`.
- L'endpoint `/flipbook/:id` doit retourner `{ pages: ["url1", "url2", ...] }`.
