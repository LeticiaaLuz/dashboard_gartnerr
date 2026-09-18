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