import { useEffect, useState } from 'react'

type HistoryReading = {
  id: number
  soil_moisture: number
  temperature: number | null
  reservoir_level: number
  light_on: boolean
  needs_water: boolean
  pump_on: boolean
  recorded_at: string
}

type PlantHistoryModalProps = {
  plantId: number
  plantName: string
  onClose: () => void
}

type ChartProps = {
  title: string
  unit: string
  values: number[]
  color: string
}

function HistoryChart({ title, unit, values, color }: ChartProps) {
  if (values.length === 0) {
    return null
  }

  const width = 420
  const height = 120
  const padding = 12
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1

  const points = values
    .map((value, index) => {
      const x =
        padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1)
      const y =
        height -
        padding -
        ((value - minValue) / range) * (height - padding * 2)

      return `${x},${y}`
    })
    .join(' ')

  const latestValue = values[values.length - 1]

  return (
    <section className="history-chart">
      <div className="history-chart-heading">
        <span>{title}</span>
        <strong>
          {latestValue}
          {unit}
        </strong>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Histórico de ${title}`}
      >
        <polyline
          fill="none"
          points={points}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      </svg>
    </section>
  )
}

function PlantHistoryModal({
  plantId,
  plantName,
  onClose,
}: PlantHistoryModalProps) {
  const [readings, setReadings] = useState<HistoryReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/plants/${plantId}/readings`,
        )

        if (!response.ok) {
          throw new Error('Não foi possível carregar o histórico.')
        }

        const data: HistoryReading[] = await response.json()
        setReadings(data)
      } catch {
        setError('Não foi possível carregar o histórico da planta.')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [plantId])

  const temperatures = readings
    .map((reading) => reading.temperature)
    .filter((temperature): temperature is number => temperature !== null)

  const moistures = readings.map((reading) => reading.soil_moisture)
  const reservoirs = readings.map((reading) => reading.reservoir_level)

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="history-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Histórico de ${plantName}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Fechar histórico"
        >
          ×
        </button>

        <h2>Histórico</h2>
        <p className="scientific-name">{plantName}</p>

        {loading && <p className="dashboard-message">Carregando histórico...</p>}

        {error && <p className="dashboard-message error-message">{error}</p>}

        {!loading && !error && readings.length === 0 && (
          <p className="dashboard-message">
            Ainda não existem leituras para esta planta.
          </p>
        )}

        {!loading && !error && readings.length > 0 && (
          <div className="history-charts">
            {temperatures.length > 0 && (
              <HistoryChart
                title="Temperatura"
                unit="°C"
                values={temperatures}
                color="#2e76b8"
              />
            )}

            <HistoryChart
              title="Umidade do solo"
              unit="%"
              values={moistures}
              color="#2e76b8"
            />

            <HistoryChart
              title="Reservatório"
              unit="%"
              values={reservoirs}
              color="#2e76b8"
            />
          </div>
        )}
      </section>
    </div>
  )
}

export default PlantHistoryModal