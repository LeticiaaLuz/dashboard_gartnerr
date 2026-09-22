import sqlite3
from pathlib import Path


DATABASE_PATH = Path(__file__).parent / "plantas.db"

COLUMNS_TO_ADD = {
    "light_on": "INTEGER NOT NULL DEFAULT 0",
    "reservoir_level": "REAL NOT NULL DEFAULT 0",
    "needs_water": "INTEGER NOT NULL DEFAULT 0",
    "pump_on": "INTEGER NOT NULL DEFAULT 0",
}


def main():
    if not DATABASE_PATH.exists():
        raise FileNotFoundError(
            "O arquivo plantas.db não foi encontrado dentro de backend."
        )

    connection = sqlite3.connect(DATABASE_PATH)

    try:
        existing_columns = {
            column[1]
            for column in connection.execute(
                "PRAGMA table_info(readings)"
            ).fetchall()
        }

        for column_name, column_definition in COLUMNS_TO_ADD.items():
            if column_name not in existing_columns:
                connection.execute(
                    f"ALTER TABLE readings "
                    f"ADD COLUMN {column_name} {column_definition}"
                )
                print(f"Coluna adicionada: {column_name}")
            else:
                print(f"Coluna já existe: {column_name}")

        connection.commit()
        print("Migração concluída com sucesso.")

    finally:
        connection.close()


if __name__ == "__main__":
    main()