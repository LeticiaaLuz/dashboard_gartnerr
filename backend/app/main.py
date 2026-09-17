from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Species


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Sistema de Rega IoT",
    description="API do sistema de monitoramento e rega automatizada de plantas.",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/")
def health_check():
    return {
        "message": "Servidor do Sistema de Rega IoT está funcionando!"
    }


@app.get("/species")
def list_species(db: Session = Depends(get_db)):
    species = db.query(Species).order_by(Species.name).all()
    return species