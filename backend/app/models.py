from sqlalchemy import Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Species(Base):
    __tablename__ = "species"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Identificação
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    scientific_name: Mapped[str] = mapped_column(String(150), unique=True)
    origin: Mapped[str] = mapped_column(String(100))

    # Condições ideais
    minimum_soil_moisture: Mapped[float] = mapped_column(Float)
    maximum_soil_moisture: Mapped[float] = mapped_column(Float)
    minimum_temperature: Mapped[float] = mapped_column(Float)
    maximum_temperature: Mapped[float] = mapped_column(Float)
    luminosity: Mapped[str] = mapped_column(String(150))
    watering_frequency: Mapped[str] = mapped_column(String(100))

    # Conteúdo exibido no dashboard
    care_tip: Mapped[str | None] = mapped_column(Text, nullable=True)