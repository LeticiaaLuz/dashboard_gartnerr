from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Plant, Species
from app.schemas import PlantCreate, PlantResponse
from app.models import Plant, Reading, Species
from app.schemas import (
    PlantCreate,
    PlantResponse,
    ReadingCreate,
    ReadingResponse,
)
from fastapi.middleware.cors import CORSMiddleware

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.post(
    "/plants",
    response_model=PlantResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_plant(
    plant_data: PlantCreate,
    db: Session = Depends(get_db),
):
    species = db.get(Species, plant_data.species_id)

    if not species:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espécie não encontrada.",
        )

    plant_with_same_device = (
        db.query(Plant)
        .filter(Plant.device_id == plant_data.device_id)
        .first()
    )

    if plant_with_same_device:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe uma planta usando este device_id.",
        )

    plant = Plant(**plant_data.model_dump())

    db.add(plant)
    db.commit()
    db.refresh(plant)

    return plant

@app.get("/plants", response_model=list[PlantResponse])
def list_plants(db: Session = Depends(get_db)):
    plants = db.query(Plant).order_by(Plant.nickname).all()
    return plants


@app.post(
    "/plants/{plant_id}/readings",
    response_model=ReadingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_reading(
    plant_id: int,
    reading_data: ReadingCreate,
    db: Session = Depends(get_db),
):
    plant = db.get(Plant, plant_id)

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planta não encontrada.",
        )

    reading = Reading(
        plant_id=plant.id,
        **reading_data.model_dump(),
    )

    db.add(reading)
    db.commit()
    db.refresh(reading)

    return reading