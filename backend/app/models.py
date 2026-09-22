from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Species(Base):
    __tablename__ = "species"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    scientific_name: Mapped[str] = mapped_column(String(150), unique=True)
    origin: Mapped[str] = mapped_column(String(100))

    minimum_soil_moisture: Mapped[float] = mapped_column(Float)
    maximum_soil_moisture: Mapped[float] = mapped_column(Float)
    minimum_temperature: Mapped[float] = mapped_column(Float)
    maximum_temperature: Mapped[float] = mapped_column(Float)
    luminosity: Mapped[str] = mapped_column(String(150))
    watering_frequency: Mapped[str] = mapped_column(String(100))
    care_tip: Mapped[str | None] = mapped_column(Text, nullable=True)

    plants: Mapped[list["Plant"]] = relationship(back_populates="species")


class Plant(Base):
    __tablename__ = "plants"

    id: Mapped[int] = mapped_column(primary_key=True)
    nickname: Mapped[str] = mapped_column(String(100))
    device_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    automatic_irrigation: Mapped[bool] = mapped_column(Boolean, default=False)

    species_id: Mapped[int] = mapped_column(ForeignKey("species.id"))
    species: Mapped["Species"] = relationship(back_populates="plants")

    readings: Mapped[list["Reading"]] = relationship(
        back_populates="plant",
        cascade="all, delete-orphan",
    )


class Reading(Base):
    __tablename__ = "readings"

    id: Mapped[int] = mapped_column(primary_key=True)

    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id"))
    plant: Mapped["Plant"] = relationship(back_populates="readings")

    soil_moisture: Mapped[float] = mapped_column(Float)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Variáveis recebidas do MCU
    light_on: Mapped[bool] = mapped_column(Boolean, default=False)
    reservoir_level: Mapped[float] = mapped_column(Float, default=0)
    needs_water: Mapped[bool] = mapped_column(Boolean, default=False)
    pump_on: Mapped[bool] = mapped_column(Boolean, default=False)

    # Campo antigo; manteremos temporariamente até definir o limite de alerta.
    reservoir_empty: Mapped[bool] = mapped_column(Boolean, default=False)

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
    )