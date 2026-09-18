from sqlalchemy import Boolean, Float, ForeignKey, String, Text
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

    # Nome dado pelo usuário, por exemplo: "Jiboia da sala"
    nickname: Mapped[str] = mapped_column(String(100))

    # Identificador único configurado no ESP32, por exemplo: "vaso-001"
    device_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    automatic_irrigation: Mapped[bool] = mapped_column(Boolean, default=False)

    species_id: Mapped[int] = mapped_column(ForeignKey("species.id"))
    species: Mapped["Species"] = relationship(back_populates="plants")