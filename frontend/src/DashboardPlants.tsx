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
  minimum_temperature: number
  maximum_temperature: number
  soil_moisture: number | null
  temperature: number | null
  soil_moisture_status: string
  temperature_status: string
  light_on: boolean | null
  reservoir_level: number | null
  needs_water: boolean | null
  pump_on: boolean | null
  reservoir_low: boolean
  device_offline: boolean
  recorded_at: string | null
}

type DashboardPlantsProps = {
  onRegister: () => void
}

function isOutsideReference(status: string) {
  return status === 'LOW' || status === 'HIGH'
}

function comparisonLabel(status: string, metric: string) {
  if (status === 'LOW') return `${metric} baixa`
  if (status === 'HIGH') return `${metric} alta`
  if (status === 'IDEAL') return `${metric} ideal`
  return 'Sem leitura'
}

function comparisonValueClass(status: string) {
  if (status === 'IDEAL') return 'metric-value success-value'
  if (isOutsideReference(status)) return 'metric-value warning-value'
  return 'metric-value'
}

function buildRecommendation(plant: DashboardPlant) {
  if (plant.device_offline) {
    return 'O dispositivo está há mais de 3 minutos sem enviar leituras. Verifique a alimentação e a conexão do MCU.'
  }
  if (plant.reservoir_low) {
    return 'O reservatório está abaixo de 15%. Reabasteça a água para a próxima rega automática.'
  }
  if (plant.soil_moisture_status === 'LOW') {
    return 'A umidade do solo está abaixo da faixa ideal da espécie. O MCU continua responsável pela rega fixa.'
  }
  if (plant.soil_moisture_status === 'HIGH') {
    return 'A umidade do solo está acima da faixa ideal da espécie. Acompanhe a próxima leitura.'
  }
  if (plant.temperature_status === 'LOW') {
    return 'A temperatura está abaixo da faixa ideal da espécie. Considere ajustar o local da planta.'
  }
  if (plant.temperature_status === 'HIGH') {
    return 'A temperatura está acima da faixa ideal da espécie. Considere um ambiente mais fresco.'
  }
  if (plant.needs_water) {
    return 'O MCU identificou necessidade de água. A rega automática continua sob responsabilidade do dispositivo.'
  }
  return 'A temperatura e a umidade estão dentro das faixas ideais da espécie.'
}

function DashboardPlants({ onRegister }: DashboardPlantsProps) {
  const [plants, setPlants] = useState<DashboardPlant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlant, setSelectedPlant] =
    useState<DashboardPlant | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadPlants() {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/dashboard/plants',
        )

        if (!response.ok) {
          throw new Error('Não foi possível carregar as plantas.')
        }

        const data: DashboardPlant[] = await response.json()
        if (isMounted) {
          setPlants(data)
          setError(null)
        }
      } catch {
        if (isMounted) {
          setError(
            'Não foi possível conectar ao servidor. Verifique se o FastAPI está rodando.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPlants()

    const refreshInterval = window.setInterval(loadPlants, 30_000)

    return () => {
      isMounted = false
      window.clearInterval(refreshInterval)
    }
  }, [])

  const attentionCount = plants.filter(
    (plant) =>
      plant.needs_water === true ||
      plant.reservoir_low ||
      plant.device_offline ||
      isOutsideReference(plant.soil_moisture_status) ||
      isOutsideReference(plant.temperature_status),
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
          const isOffline = plant.device_offline
          const needsAttention =
            plant.needs_water === true ||
            plant.reservoir_low ||
            isOffline ||
            isOutsideReference(plant.soil_moisture_status) ||
            isOutsideReference(plant.temperature_status)
          const soilMoisture = plant.soil_moisture ?? 0
          const comparisonAlerts = [
            isOutsideReference(plant.soil_moisture_status)
              ? comparisonLabel(plant.soil_moisture_status, 'Umidade')
              : null,
            isOutsideReference(plant.temperature_status)
              ? comparisonLabel(plant.temperature_status, 'Temperatura')
              : null,
          ].filter(Boolean)

          return (
            <button
              type="button"
              className={
                isOffline
                  ? 'plant-card device-offline'
                  : needsAttention
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
                    isOffline
                      ? 'health-status offline'
                      : !hasReading
                      ? 'health-status unknown'
                      : needsAttention
                        ? 'health-status attention'
                        : 'health-status healthy'
                  }
                >
                  {isOffline
                    ? '● Dispositivo offline'
                    : !hasReading
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

              {isOffline ? (
                <p className="offline-alert">
                  ● Sem leituras há mais de 3 minutos.
                </p>
              ) : plant.reservoir_low ? (
                <p className="reservoir-alert">
                  ⚠ Reservatório com pouca água ({plant.reservoir_level}%).
                </p>
              ) : comparisonAlerts.length > 0 ? (
                <p className="comparison-alert">
                  ⚠ {comparisonAlerts.join(' · ')} fora da faixa ideal.
                </p>
              ) : null}
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
                selectedPlant.device_offline
                  ? 'health-status offline'
                  : selectedPlant.needs_water ||
                      selectedPlant.reservoir_low ||
                      isOutsideReference(selectedPlant.soil_moisture_status) ||
                      isOutsideReference(selectedPlant.temperature_status)
                  ? 'health-status attention'
                  : 'health-status healthy'
              }
            >
              ●{' '}
              {selectedPlant.device_offline
                ? 'Status geral: Dispositivo offline'
                : selectedPlant.needs_water ||
                    selectedPlant.reservoir_low ||
                    isOutsideReference(selectedPlant.soil_moisture_status) ||
                    isOutsideReference(selectedPlant.temperature_status)
                ? 'Status geral: Atenção'
                : 'Status geral: Excelente'}
            </span>

            <div className="detail-metrics-grid">
              <article>
                <span>Temperatura</span>
                <strong className={comparisonValueClass(selectedPlant.temperature_status)}>
                  {selectedPlant.temperature === null
                    ? '--'
                    : `${selectedPlant.temperature}°C`}
                </strong>
                <small className="metric-reference">
                  Ideal: {selectedPlant.minimum_temperature}°C –{' '}
                  {selectedPlant.maximum_temperature}°C
                </small>
              </article>

              <article>
                <span>Umidade</span>
                <strong className={comparisonValueClass(selectedPlant.soil_moisture_status)}>
                  {selectedPlant.soil_moisture === null
                    ? '--'
                    : `${selectedPlant.soil_moisture}%`}
                </strong>
                <small className="metric-reference">
                  Ideal: {selectedPlant.minimum_soil_moisture}% –{' '}
                  {selectedPlant.maximum_soil_moisture}%
                </small>
              </article>

              <article>
                <span>Luminosidade</span>
                <strong className="metric-value success-value">
                  {selectedPlant.light_on === null
                    ? 'Sem leitura'
                    : selectedPlant.light_on
                      ? 'Com luz'
                      : 'Sem luz'}
                </strong>
              </article>

              <article>
                <span>Reservatório</span>
                <strong
                  className={
                    selectedPlant.reservoir_low
                      ? 'metric-value warning-value'
                      : 'metric-value'
                  }
                >
                  {selectedPlant.reservoir_level === null
                    ? '--'
                    : `${selectedPlant.reservoir_level}%`}
                </strong>
              </article>

              <article>
                <span>Precisa regar</span>
                <strong
                  className={
                    selectedPlant.needs_water
                      ? 'metric-value warning-value'
                      : 'metric-value success-value'
                  }
                >
                  {selectedPlant.needs_water === null
                    ? 'Sem leitura'
                    : selectedPlant.needs_water
                      ? 'Sim'
                      : 'Não'}
                </strong>
              </article>

              <article>
                <span>Bomba ligada</span>
                <strong
                  className={
                    selectedPlant.pump_on
                      ? 'metric-value active-pump-value'
                      : 'metric-value success-value'
                  }
                >
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
              <p>{buildRecommendation(selectedPlant)}</p>
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
