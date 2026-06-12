from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models
from app.deps import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CREATE JOB (AUTH PROTECTED)
from app.schemas import JobCreate

@router.post("/jobs")
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    
    new_job = models.Job(
        company=job.company,
        role=job.role,
        owner_id=user_id
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job

# GET USER JOBS (AUTO USER)
@router.get("/jobs")
def get_jobs(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    
    return db.query(models.Job).filter(models.Job.owner_id == user_id).all()

# UPDATE JOB
@router.put("/jobs/{job_id}")
def update_job(
    job_id: int,
    status: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.owner_id == user_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.status = status
    db.commit()

    return {"message": "Job updated"}

# DELETE JOB
@router.delete("/Jobs/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.owner_id == user_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(job)
    db.commit()

    return {"message": "Job deleted"}