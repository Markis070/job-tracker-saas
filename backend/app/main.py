from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
import app.models
from app.routes import auth_routes, job_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# creates tables
Base.metadata.create_all(bind=engine)

app.include_router(auth_routes.router)
app.include_router(job_routes.router)

@app.get("/")
def home():
    return {"message": "Job Tracker API Running"}