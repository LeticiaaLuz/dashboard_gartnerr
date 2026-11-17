from app.schemas import PlantUpdate


def test_plant_update_accepts_the_editable_registration_fields():
    update = PlantUpdate(
        nickname="Zamioculca da sala",
        device_id="vaso-002",
        location="Sala",
        species_id=3,
    )

    assert update.nickname == "Zamioculca da sala"
    assert update.device_id == "vaso-002"
    assert update.location == "Sala"
    assert update.species_id == 3
