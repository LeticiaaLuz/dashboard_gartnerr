import { useEffect, useState } from 'react'
import PlantHistoryModal from './PlantHistoryModal'

type DashboardPlant = {
  id: number
  nickname: string
  device_id: string
  location: string | null
  automatic_irrigation: boolean
  species_name: string
  scientific_name: string
  minimum_soil_moisture: number
  maximum_soil_moisture: number
  soil_moisture: number | null
  temperature: number | null
  light_on: boolean | null
  reservoir_level: number | null
  needs_water: boolean | null
  pump_on: boolean | null
  recorded_at: string | null
}

type DashboardPlantsProps = {
  onRegister: () => void
}

function DashboardPlants({ onRegister }: DashboardPlantsProps) {
  const [plants, setPlants] = useState<DashboardPlant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlant, setSelectedPlant] =
    useState<DashboardPlant | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    async function loadPlants() {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/dashboard/plants',
        )

        if (!response.ok) {
          throw new Error('Não foi possível carregar as plantas.')
        }

        const data: DashboardPlant[] = await response.json()
        setPlants(data)
      } catch {
        setError(
          'Não foi possível conectar ao servidor. Verifique se o FastAPI está rodando.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadPlants()
  }, [])

  const attentionCount = plants.filter(
    (plant) => plant.needs_water === true,
  ).length

  if (loading) {
    return <p className="dashboard-message">Carregando plantas...</p>
  }

  if (error) {
    return <p className="dashboard-message error-message">{error}</p>
  }

  return (
    <section>
      <div className="plants-heading">
        <div>
          <h1>Suas plantas</h1>
          <p>Acompanhe a saúde das suas plantas.</p>
        </div>

        <button className="primary-button" onClick={onRegister}>
          + Cadastrar planta
        </button>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <span>PLANTAS</span>
          <strong>{plants.length}</strong>
        </article>

        <article className="summary-card attention-summary">
          <span>ATENÇÃO</span>
          <strong>{attentionCount}</strong>
        </article>
      </div>

      <h2 className="section-title">Suas plantas</h2>

      <div className="plants-grid">
        {plants.map((plant) => {
          const hasReading = plant.recorded_at !== null
          const needsAttention = plant.needs_water === true
          const soilMoisture = plant.soil_moisture ?? 0

          return (
            <button
              type="button"
              className={
                needsAttention
                  ? 'plant-card needs-attention'
                  : 'plant-card'
              }
              key={plant.id}
              onClick={() => setSelectedPlant(plant)}
            >
              <div className="card-topline">
                <div>
                  <h2>{plant.nickname}</h2>
                  <p className="plant-species">{plant.species_name}</p>
                </div>

                <span
                  className={
                    !hasReading
                      ? 'health-status unknown'
                      : needsAttention
                        ? 'health-status attention'
                        : 'health-status healthy'
                  }
                >
                  {!hasReading
                    ? '● Sem leitura'
                    : needsAttention
                      ? '● Atenção'
                      : '● Saudável'}
                </span>
              </div>

              <div className="plant-metrics">
                <span>
                  ♨ {plant.temperature === null ? '--' : plant.temperature}°C
                </span>

                <div className="soil-metric">
                  <span>♢ Solo</span>

                  <div className="plant-progress-track">
                    <span
                      className={
                        needsAttention
                          ? 'plant-progress-fill warning'
                          : 'plant-progress-fill'
                      }
                      style={{ width: `${soilMoisture}%` }}
                    />
                  </div>

                  <strong>
                    {plant.soil_moisture === null
                      ? '--'
                      : `${plant.soil_moisture}%`}
                  </strong>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedPlant && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setSelectedPlant(null)}
        >
          <section
            className="plant-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes de ${selectedPlant.nickname}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setSelectedPlant(null)}
              aria-label="Fechar modal"
            >
              ×
            </button>

            <h2>{selectedPlant.nickname}</h2>
            <p className="scientific-name">
              {selectedPlant.scientific_name}
            </p>
            <p className="plant-location">
              Local: {selectedPlant.location || 'Não informado'}
            </p>

            <span
              className={
                selectedPlant.needs_water
                  ? 'health-status attention'
                  : 'health-status healthy'
              }
            >
              ●{' '}
              {selectedPlant.needs_water
                ? 'Status geral: Atenção'
                : 'Status geral: Excelente'}
            </span>

            <div className="detail-metrics-grid">
              <article>
                <span>Temperatura</span>
                <strong>
                  {selectedPlant.temperature === null
                    ? '--'
                    : `${selectedPlant.temperature}°C`}
                </strong>
              </article>

              <article>
                <span>Umidade</span>
                <strong>
                  {selectedPlant.soil_moisture === null
                    ? '--'
                    : `${selectedPlant.soil_moisture}%`}
                </strong>
              </article>

              <article>
                <span>Luminosidade</span>
                <strong>
                  {selectedPlant.light_on === null
                    ? 'Sem leitura'
                    : selectedPlant.light_on
                      ? 'Com luz'
                      : 'Sem luz'}
                </strong>
              </article>

              <article>
                <span>Reservatório</span>
                <strong>
                  {selectedPlant.reservoir_level === null
                    ? '--'
                    : `${selectedPlant.reservoir_level}%`}
                </strong>
              </article>

              <article>
                <span>Precisa regar</span>
                <strong>
                  {selectedPlant.needs_water === null
                    ? 'Sem leitura'
                    : selectedPlant.needs_water
                      ? 'Sim'
                      : 'Não'}
                </strong>
              </article>

              <article>
                <span>Bomba ligada</span>
                <strong>
                  {selectedPlant.pump_on === null
                    ? 'Sem leitura'
                    : selectedPlant.pump_on
                      ? 'Sim'
                      : 'Não'}
                </strong>
              </article>
            </div>

            <div className="recommendation">
              <strong>Recomendação</strong>
              <p>
                {selectedPlant.needs_water
                  ? 'O MCU identificou que a planta precisa de água. A rega automática será decidida pelo próprio dispositivo.'
                  : 'As condições atuais estão adequadas. Continue acompanhando as próximas leituras.'}
              </p>
            </div>

            <button
                className="history-button"
                type="button"
                onClick={() => setShowHistory(true)}
                >
                Consultar histórico
            </button>
          </section>
        </div>
      )}

      {showHistory && selectedPlant && (
            <PlantHistoryModal
                plantId={selectedPlant.id}
                plantName={selectedPlant.nickname}
                onClose={() => setShowHistory(false)}
            />
      )}
    </section>
  )
}

export default DashboardPlants