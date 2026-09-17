from app.database import SessionLocal
from app.models import Species


species_data = [
    {
        "name": "Jiboia",
        "scientific_name": "Epipremnum aureum",
        "origin": "Oceania",
        "minimum_soil_moisture": 40,
        "maximum_soil_moisture": 60,
        "minimum_temperature": 18,
        "maximum_temperature": 30,
        "luminosity": "Sombra ou Luz Indireta",
        "watering_frequency": "2 a 3 vezes por semana",
        "care_tip": None,
    },
    {
        "name": "Antúrio",
        "scientific_name": "Anthurium andraeanum",
        "origin": "América do Sul",
        "minimum_soil_moisture": 60,
        "maximum_soil_moisture": 80,
        "minimum_temperature": 18,
        "maximum_temperature": 28,
        "luminosity": "Luz Indireta Abundante",
        "watering_frequency": "2 a 3 vezes por semana",
        "care_tip": None,
    },
    {
        "name": "Zamioculca",
        "scientific_name": "Zamioculcas zamiifolia",
        "origin": "África",
        "minimum_soil_moisture": 20,
        "maximum_soil_moisture": 40,
        "minimum_temperature": 18,
        "maximum_temperature": 32,
        "luminosity": "Sombra ou Meia-Sombra",
        "watering_frequency": "A cada 10 a 15 dias",
        "care_tip": None,
    },
    {
        "name": "Dinheiro-em-penca",
        "scientific_name": "Callisia repens",
        "origin": "Américas",
        "minimum_soil_moisture": 60,
        "maximum_soil_moisture": 75,
        "minimum_temperature": 18,
        "maximum_temperature": 30,
        "luminosity": "Meia-sombra ou Luz Indireta",
        "watering_frequency": "3 a 4 vezes por semana",
        "care_tip": None,
    },
]


def main():
    db = SessionLocal()

    try:
        for data in species_data:
            species_exists = (
                db.query(Species)
                .filter(Species.name == data["name"])
                .first()
            )

            if not species_exists:
                db.add(Species(**data))

        db.commit()
        print("Espécies de referência cadastradas com sucesso.")

    finally:
        db.close()


if __name__ == "__main__":
    main()