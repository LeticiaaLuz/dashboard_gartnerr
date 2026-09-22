
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

class PlantCreate(BaseModel):
    nickname: str = Field(min_length=2, max_length=100)
    device_id: str = Field(min_length=3, max_length=100)
    location: str | None = Field(default=None, max_length=100)
    automatic_irrigation: bool = False
    species_id: int = Field(gt=0)


class PlantResponse(BaseModel):
    id: int
    nickname: str
    device_id: str
    location: str | None
    automatic_irrigation: bool
    species_id: int

    model_config = ConfigDict(from_attributes=True)

class ReadingCreate(BaseModel):
    soil_moisture: float = Field(ge=0, le=100)
    temperature: float | None = Field(default=None, ge=-10, le=60)

    light_on: bool = False
    reservoir_level: float = Field(ge=0, le=100)
    needs_water: bool = False
    pump_on: bool = False

    # Temporário: será calculado automaticamente quando definirmos o limite.
    reservoir_empty: bool = False


class ReadingResponse(BaseModel):
    id: int
    plant_id: int

    soil_moisture: float
    temperature: float | None

    light_on: bool
    reservoir_level: float
    needs_water: bool
    pump_on: bool
    reservoir_empty: bool

    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DashboardPlantResponse(BaseModel):
    id: int
    nickname: str
    device_id: str
    location: str | None
    automatic_irrigation: bool

    species_name: str
    scientific_name: str
    minimum_soil_moisture: float
    maximum_soil_moisture: float

    soil_moisture: float | None
    temperature: float | None
    light_on: bool | None
    reservoir_level: float | None
    needs_water: bool | None
    pump_on: bool | None
    recorded_at: datetime | None