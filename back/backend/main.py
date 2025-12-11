from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from pathlib import Path
from typing import List
from pdf2image import convert_from_path
from PIL import Image
import shutil

app = FastAPI(title="PDF Flipbook Backend")

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Directories
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# -----------------------------
# Routes
# -----------------------------
@app.get("/")
def read_root():
    return {"status": "ok"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Validate file
    filename = file.filename or ""
    content_type = file.content_type or ""

    if not filename.lower().endswith(".pdf") and content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Le fichier doit être un PDF")

    # Create folders
    doc_id = uuid4().hex
    doc_dir = UPLOADS_DIR / doc_id
    pages_dir = doc_dir / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)

    # Save PDF
    pdf_path = doc_dir / "original.pdf"
    try:
        with pdf_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        await file.close()

    # Convert PDF to images
    try:
        images: List[Image.Image] = convert_from_path(
            str(pdf_path),
            dpi=200,
            fmt="png"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur conversion PDF: {e}")

    # Save images
    try:
        for i, img in enumerate(images, start=1):
            img.save(pages_dir / f"{i}.png", "PNG")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur sauvegarde images: {e}")

    return {"id": doc_id}


@app.get("/flipbook/{doc_id}")
async def get_flipbook(doc_id: str, request: Request):
    pages_dir = UPLOADS_DIR / doc_id / "pages"

    if not pages_dir.exists():
        raise HTTPException(status_code=404, detail="Document introuvable")

    images = sorted(
        pages_dir.glob("*.png"),
        key=lambda p: int(p.stem)
    )

    base_url = str(request.base_url).rstrip("/")
    pages_urls = [
        f"{base_url}/uploads/{doc_id}/pages/{img.name}"
        for img in images
    ]

    return JSONResponse({"pages": pages_urls})


# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
