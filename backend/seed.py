from app.database import SessionLocal
from app.models import Plant, Species


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
        "name": "Zamioculca",
        "scientific_name": "Zamioculcas zamiifolia",
        "origin": "África",
        "minimum_soil_moisture": 40,
        "maximum_soil_moisture": 70,
        "minimum_temperature": 18,
        "maximum_temperature": 30,
        "luminosity": "Baixa luminosidade",
        "watering_frequency": "Regue somente quando o solo estiver seco",
        "care_tip": "Evite o excesso de água e mantenha em vaso com boa drenagem.",
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

            if species_exists:
                for field, value in data.items():
                    setattr(species_exists, field, value)
            else:
                db.add(Species(**data))

        db.flush()

        zamioculca = db.query(Species).filter(Species.name == "Zamioculca").first()
        anturio = db.query(Species).filter(Species.name == "Antúrio").first()
        if anturio and zamioculca:
            db.query(Plant).filter(Plant.species_id == anturio.id).update(
                {Plant.species_id: zamioculca.id},
            )
            db.delete(anturio)

        db.commit()
        print("Espécies de referência cadastradas com sucesso.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
