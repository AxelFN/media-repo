from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend funcionando "}

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://TU-FRONTEND.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
