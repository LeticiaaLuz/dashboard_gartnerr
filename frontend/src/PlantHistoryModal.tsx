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

type ChartPoint = {
  label: string
  value: number
}

type PlantHistoryModalProps = {
  plantId: number
  plantName: string
  onClose: () => void
}

type ChartProps = {
  title: string
  unit: string
  points: ChartPoint[]
  color: string
}

function formatValue(value: number, unit: string) {
  const formatted = Number.isInteger(value) ? value : value.toFixed(1)
  return `${formatted}${unit}`
}

function HistoryChart({ title, unit, points, color }: ChartProps) {
  if (points.length === 0) {
    return null
  }

  const width = 520
  const height = 170
  const paddingX = 28
  const paddingY = 20
  const values = points.map((point) => point.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1

  const chartPoints = points.map((point, index) => {
    const x =
      paddingX + (index * (width - paddingX * 2)) / Math.max(points.length - 1, 1)
    const y =
      height -
      paddingY -
      ((point.value - minValue) / range) * (height - paddingY * 2)

    return { x, y, ...point }
  })

  const linePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(' ')
  const baseline = height - paddingY
  const areaPoints = [
    `${chartPoints[0].x},${baseline}`,
    linePoints,
    `${chartPoints[chartPoints.length - 1].x},${baseline}`,
  ].join(' ')
  const latestPoint = points[points.length - 1]
  const gradientId = title.toLowerCase().replaceAll(' ', '-')

  return (
    <section className="history-chart">
      <div className="history-chart-heading">
        <div>
          <span>{title}</span>
          <small>
            Mín. {formatValue(minValue, unit)} · Máx. {formatValue(maxValue, unit)}
          </small>
        </div>
        <strong>{formatValue(latestPoint.value, unit)}</strong>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Histórico de ${title}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((position) => (
          <line
            key={position}
            x1={paddingX}
            x2={width - paddingX}
            y1={height * position}
            y2={height * position}
            stroke="#e6edf4"
            strokeWidth="1"
          />
        ))}

        <polygon fill={`url(#${gradientId})`} points={areaPoints} />
        <polyline
          fill="none"
          points={linePoints}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />

        {chartPoints.map((point, index) => (
          <circle
            key={`${point.label}-${index}`}
            cx={point.x}
            cy={point.y}
            fill="#ffffff"
            r={index === chartPoints.length - 1 ? 5 : 3.5}
            stroke={color}
            strokeWidth="3"
          />
        ))}
      </svg>

      <div className="history-chart-labels">
        {chartPoints.map((point, index) => (
          <span key={`${point.label}-${index}`}>{point.label}</span>
        ))}
      </div>
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

  const chartReadings = readings.slice(-30)
  const makePoints = (getValue: (reading: HistoryReading) => number | null) =>
    chartReadings.flatMap((reading) => {
      const value = getValue(reading)

      if (value === null) {
        return []
      }

      return [
        {
          value,
          label: new Date(reading.recorded_at).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
      ]
    })

  const temperatures = makePoints((reading) => reading.temperature)
  const moistures = makePoints((reading) => reading.soil_moisture)
  const reservoirs = makePoints((reading) => reading.reservoir_level)

  return (
    <div className="modal-backdrop history-backdrop" onMouseDown={onClose}>
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
          <>
            <p className="history-caption">
              Exibindo as últimas {chartReadings.length} leituras.
            </p>

            <div className="history-charts">
              {temperatures.length > 0 && (
                <HistoryChart
                  title="Temperatura"
                  unit="°C"
                  points={temperatures}
                  color="#e07a5f"
                />
              )}

              <HistoryChart
                title="Umidade do solo"
                unit="%"
                points={moistures}
                color="#2e76b8"
              />

              <HistoryChart
                title="Reservatório"
                unit="%"
                points={reservoirs}
                color="#2e9f77"
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default PlantHistoryModal
