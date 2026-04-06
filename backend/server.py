import os
from pathlib import Path

# Crear carpeta de uploads
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def init_storage():
    return "local"

def put_object(path: str, data: bytes, content_type: str) -> dict:
    file_path = UPLOAD_DIR / path
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(data)
    return {"path": path, "size": len(data)}

def get_object(path: str) -> tuple:
    file_path = UPLOAD_DIR / path
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    with open(file_path, "rb") as f:
        data = f.read()
    # Detectar content-type básico
    ext = path.split(".")[-1].lower()
    content_types = {
        "jpg": "image/jpeg", "jpeg": "image/jpeg",
        "png": "image/png", "gif": "image/gif",
        "webp": "image/webp", "mp4": "video/mp4",
        "webm": "video/webm", "mov": "video/quicktime"
    }
    return data, content_types.get(ext, "application/octet-stream")