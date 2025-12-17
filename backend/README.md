# FastAPI PDF Flipbook Backend

## Objectif
Backend minimal pour:
- Uploader un PDF
- Le convertir en images PNG (une par page)
- Servir les images statiquement
- Fournir la liste des URLs pour un flipbook

## Prérequis
- Python 3.9+
- Poppler (requis par `pdf2image`)
  - macOS: `brew install poppler`
  - Ubuntu/Debian: `sudo apt-get install poppler-utils`
  - Windows: installer Poppler et ajouter `bin` au PATH (voir docs pdf2image)

## Installation
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

## Lancement
```bash
uvicorn main:app --reload
```

Par défaut:
- API: http://localhost:8000
- Fichiers statiques: http://localhost:8000/uploads/

## Endpoints
- POST `/upload`
  - Form-data (file): `file` (PDF)
  - Réponse: `{ "id": "<id>" }`

- GET `/flipbook/{id}`
  - Réponse: `{ "pages": ["/uploads/<id>/pages/1.png", ...] }`

- Static `/uploads/*`: sert les fichiers générés

## Structure
```
backend/
 ├─ main.py
 ├─ uploads/
 │   └─ <id>/
 │      ├─ original.pdf
 │      └─ pages/
 │         └─ 1.png, 2.png, ...
 ├─ requirements.txt
 └─ README.md
```

## Notes
- `pdf2image` nécessite Poppler installé sur le système.
- Les fichiers sont stockés localement dans `uploads/` sans base de données.
