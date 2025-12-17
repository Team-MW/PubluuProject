from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from pathlib import Path
from typing import List
from pdf2image import convert_from_path, convert_from_bytes
from PIL import Image
import shutil
import os
import cloudinary
import cloudinary.uploader
from cloudinary.search import Search
import cloudinary.api
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

# Serve static files (no longer used for images, kept for potential future needs)
# app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


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

    # Cloudinary is required for storage
    cloudinary_enabled = bool(cloud_name and api_key and api_secret)
    if not cloudinary_enabled:
        raise HTTPException(status_code=500, detail="Cloudinary non configuré: stockage requis")

    # Generate document id
    doc_id = uuid4().hex

    # Read PDF bytes into memory
    try:
        pdf_bytes = await file.read()
    finally:
        await file.close()

    # Convert PDF bytes to images in memory
    try:
        images: List[Image.Image] = convert_from_bytes(
            pdf_bytes,
            dpi=200,
            fmt="png",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur conversion PDF: {e}")

    # Upload pages directly to Cloudinary from memory, no local writes
    pages_urls: List[str] = []
    try:
        for i, img in enumerate(images, start=1):
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            buf.seek(0)
            public_id = f"flipbooks/{doc_id}/{i}"
            res = cloudinary.uploader.upload(
                buf,
                public_id=public_id,
                overwrite=True,
                resource_type="image",
            )
            secure_url = res.get("secure_url")
            if secure_url:
                pages_urls.append(secure_url)
        print(f"[Cloudinary] Uploaded {len(pages_urls)} pages to folder flipbooks/{doc_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur upload Cloudinary: {e}")

    base_url = str(request.base_url).rstrip("/")
    share_url = f"{base_url}/flipbook/{doc_id}"
    return {"id": doc_id, "share_url": share_url, "pages": pages_urls}


@app.get("/flipbook/{doc_id}")
async def get_flipbook(doc_id: str, request: Request):
    # Cloudinary-only retrieval
    cloudinary_enabled = bool(cloud_name and api_key and api_secret)
    if not cloudinary_enabled:
        raise HTTPException(status_code=500, detail="Cloudinary non configuré: récupération requise")

    # Prefer Admin API resources by prefix to avoid Search indexing delay
    try:
        prefix = f"flipbooks/{doc_id}/"
        pages_resources = []
        next_cursor = None
        while True:
            resp = cloudinary.api.resources(
                type="upload",
                resource_type="image",
                prefix=prefix,
                max_results=500,
                direction="asc",
                next_cursor=next_cursor,
            )
            pages_resources.extend(resp.get("resources", []))
            next_cursor = resp.get("next_cursor")
            if not next_cursor:
                break

        # Sort by public_id numeric page segment at the end
        def page_key(r):
            pid = r.get("public_id", "")
            try:
                return int(pid.split("/")[-1])
            except Exception:
                return pid

        pages_resources.sort(key=page_key)
        pages_urls = [r.get("secure_url") for r in pages_resources if r.get("secure_url")]
        if not pages_urls:
            # fallback to Search in case Admin API has no match
            result = (
                Search()
                .expression(f"public_id:{prefix}*")
                .sort_by("public_id", "asc")
                .max_results(500)
                .execute()
            )
            resources = result.get("resources", [])
            pages_urls = [r.get("secure_url") for r in resources if r.get("secure_url")]

        if not pages_urls:
            raise HTTPException(status_code=404, detail="Document introuvable")
        return JSONResponse({"pages": pages_urls})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Cloudinary: {e}")


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
