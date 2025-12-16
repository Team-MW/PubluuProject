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
import os
import cloudinary
import cloudinary.uploader
from cloudinary.search import Search
from dotenv import load_dotenv
import io

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
# Directories / Environment
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Serve static files for local fallback
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# -----------------------------
# Cloudinary
# -----------------------------
cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
api_key = os.getenv("CLOUDINARY_API_KEY")
api_secret = os.getenv("CLOUDINARY_API_SECRET")

if cloud_name and api_key and api_secret:
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )
    print("[Cloudinary] Configured with cloud_name=", cloud_name)
else:
    cloudinary.config(secure=True)
    print("[Cloudinary] Missing credentials. Uploads will be skipped or fallback to local.")


# -----------------------------
# Routes
# -----------------------------
@app.get("/")
def read_root():
    return {"status": "ok"}


@app.post("/upload")
async def upload_pdf(request: Request, file: UploadFile = File(...)):
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

    # Save PDF locally
    pdf_path = doc_dir / "original.pdf"
    try:
        with pdf_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        await file.close()

    # Convert PDF to images (from local file)
    try:
        images: List[Image.Image] = convert_from_path(
            str(pdf_path),
            dpi=200,
            fmt="png"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur conversion PDF: {e}")

    # Save images locally
    try:
        for i, img in enumerate(images, start=1):
            img.save(pages_dir / f"{i}.png", "PNG")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur sauvegarde images: {e}")

    # Upload to Cloudinary (optional)
    pages_urls: List[str] = []
    cloudinary_enabled = bool(cloud_name and api_key and api_secret)
    if cloudinary_enabled:
        try:
            for i in range(1, len(images) + 1):
                local_path = str(pages_dir / f"{i}.png")
                public_id = f"flipbooks/{doc_id}/{i}"
                res = cloudinary.uploader.upload(
                    local_path,
                    public_id=public_id,
                    overwrite=True,
                    resource_type="image",
                )
                pages_urls.append(res.get("secure_url"))
            print(f"[Cloudinary] Uploaded {len(pages_urls)} pages to folder flipbooks/{doc_id}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur upload Cloudinary: {e}")

    base_url = str(request.base_url).rstrip("/")
    share_url = f"{base_url}/flipbook/{doc_id}"
    return {"id": doc_id, "share_url": share_url, "pages": pages_urls}


@app.get("/flipbook/{doc_id}")
async def get_flipbook(doc_id: str, request: Request):
    pages_dir = UPLOADS_DIR / doc_id / "pages"

    if not pages_dir.exists():
        cloudinary_enabled = bool(cloud_name and api_key and api_secret)
        if not cloudinary_enabled:
            raise HTTPException(status_code=404, detail="Document introuvable")

    cloudinary_enabled = bool(cloud_name and api_key and api_secret)
    if cloudinary_enabled:
        try:
            result = Search().expression(f"folder:flipbooks/{doc_id}").sort_by("public_id","asc").max_results(500).execute()
            resources = result.get("resources", [])
            pages_urls = [r.get("secure_url") for r in resources]
            if pages_urls:
                return JSONResponse({"pages": pages_urls})
        except Exception:
            pass

    images = sorted(pages_dir.glob("*.png"), key=lambda p: int(p.stem))
    if not images:
        raise HTTPException(status_code=404, detail="Document introuvable")
    base_url = str(request.base_url).rstrip("/")
    pages_urls = [f"{base_url}/uploads/{doc_id}/pages/{img.name}" for img in images]
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
