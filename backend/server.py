from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# 🔓 CORS (para pruebas usa "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # luego puedes poner tu frontend real
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📁 Carpeta uploads
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 🌐 Servir archivos subidos
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# 🧪 Ruta base (prueba)
@app.get("/")
def root():
    return {"message": "Backend funcionando 🚀"}

# 📤 Subir archivo
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    return {
        "filename": file.filename,
        "url": f"/uploads/{file.filename}"
    }

# 📥 Listar archivos
@app.get("/api/files")
def list_files():
    files = os.listdir(UPLOAD_DIR)
    return [{"name": f, "url": f"/uploads/{f}"} for f in files]
