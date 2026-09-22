from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db

from app.models import Plant, Reading, Species
from app.schemas import (
    PlantCreate,
    PlantResponse,
    ReadingCreate,
    ReadingResponse,
    DashboardPlantResponse,
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

@app.get(
    "/plants/{plant_id}/readings",
    response_model=list[ReadingResponse],
)
def list_readings(
    plant_id: int,
    db: Session = Depends(get_db),
):
    plant = db.get(Plant, plant_id)

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planta não encontrada.",
        )

    readings = (
        db.query(Reading)
        .filter(Reading.plant_id == plant_id)
        .order_by(Reading.recorded_at.asc())
        .all()
    )

    return readings

@app.get(
    "/dashboard/plants",
    response_model=list[DashboardPlantResponse],
)
def list_dashboard_plants(
    db: Session = Depends(get_db),
):
    plants = db.query(Plant).order_by(Plant.nickname).all()
    dashboard_plants = []

    for plant in plants:
        latest_reading = (
            db.query(Reading)
            .filter(Reading.plant_id == plant.id)
            .order_by(Reading.recorded_at.desc(), Reading.id.desc())
            .first()
        )

        dashboard_plants.append(
            DashboardPlantResponse(
                id=plant.id,
                nickname=plant.nickname,
                device_id=plant.device_id,
                location=plant.location,
                automatic_irrigation=plant.automatic_irrigation,
                species_name=plant.species.name,
                scientific_name=plant.species.scientific_name,
                minimum_soil_moisture=plant.species.minimum_soil_moisture,
                maximum_soil_moisture=plant.species.maximum_soil_moisture,
                soil_moisture=(
                    latest_reading.soil_moisture
                    if latest_reading
                    else None
                ),
                temperature=(
                    latest_reading.temperature
                    if latest_reading
                    else None
                ),
                light_on=latest_reading.light_on if latest_reading else None,
                reservoir_level=(
                    latest_reading.reservoir_level
                    if latest_reading
                    else None
                ),
                needs_water=(
                    latest_reading.needs_water
                    if latest_reading
                    else None
                ),
                pump_on=latest_reading.pump_on if latest_reading else None,
                recorded_at=(
                    latest_reading.recorded_at
                    if latest_reading
                    else None
                ),
            )
        )

    return dashboard_plants
