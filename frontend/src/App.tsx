import { useState } from 'react'
import DashboardPlants from './DashboardPlants'

type Tab = 'plants' | 'references'

type ReferencePlant = {
  name: string
  scientificName: string
  origin: string
  moistureRange: string
  moistureProgress: number
  temperatureRange: string
  luminosity: string
  wateringFrequency: string
  careTip: string
  difficulty: string
  difficultyClass: string
}


const referencePlants: ReferencePlant[] = [
  {
    name: 'Antúrio',
    scientificName: 'Anthurium andraeanum',
    origin: 'América do Sul',
    moistureRange: '60% - 80%',
    moistureProgress: 70,
    temperatureRange: '18°C - 28°C',
    luminosity: 'Luz Indireta Abundante',
    wateringFrequency: '2 a 3 vezes por semana',
    careTip: 'Mantenha o solo levemente úmido, sem encharcar.',
    difficulty: 'Médio',
    difficultyClass: 'medium',
  },
  {
    name: 'Dinheiro-em-penca',
    scientificName: 'Callisia repens',
    origin: 'Américas',
    moistureRange: '60% - 75%',
    moistureProgress: 67,
    temperatureRange: '18°C - 30°C',
    luminosity: 'Meia-sombra ou Luz Indireta',
    wateringFrequency: '3 a 4 vezes por semana',
    careTip: 'Prefere umidade constante e luz indireta.',
    difficulty: 'Fácil',
    difficultyClass: 'easy',
  },
  {
    name: 'Jiboia',
    scientificName: 'Epipremnum aureum',
    origin: 'Oceania',
    moistureRange: '40% - 60%',
    moistureProgress: 50,
    temperatureRange: '18°C - 30°C',
    luminosity: 'Sombra ou Luz Indireta',
    wateringFrequency: '2 a 3 vezes por semana',
    careTip: 'É importante deixar o solo secar parcialmente entre as regas.',
    difficulty: 'Fácil',
    difficultyClass: 'easy',
  },
  {
    name: 'Zamioculca',
    scientificName: 'Zamioculcas zamiifolia',
    origin: 'África',
    moistureRange: '20% - 40%',
    moistureProgress: 30,
    temperatureRange: '18°C - 32°C',
    luminosity: 'Sombra ou Meia-Sombra',
    wateringFrequency: 'A cada 10 a 15 dias',
    careTip: 'Evite regas frequentes; ela tolera bem períodos secos.',
    difficulty: 'Muito fácil',
    difficultyClass: 'very-easy',
  },
]


type RegisterPlantFormProps = {
  onCancel: () => void
}

function RegisterPlantForm({ onCancel }: RegisterPlantFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    const speciesIds: Record<string, number> = {
      Jiboia: 1,
      Antúrio: 2,
      Zamioculca: 3,
      'Dinheiro-em-penca': 4,
    }

    const response = await fetch('http://127.0.0.1:8000/plants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nickname: formData.get('nickname'),
        device_id: formData.get('deviceId'),
        location: formData.get('location') || null,
        automatic_irrigation: Boolean(
          formData.get('automaticIrrigation'),
        ),
        species_id: speciesIds[String(formData.get('species'))],
      }),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      const responseData = await response.json().catch(() => null)

      setError(
        responseData?.detail ||
          'Não foi possível cadastrar a planta. Tente novamente.',
      )
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="registration-panel registration-success">
        <h1>Planta cadastrada!</h1>
        <p>Os dados foram salvos no banco de dados do sistema.</p>

        <button className="primary-button" onClick={onCancel}>
          Voltar para minhas plantas
        </button>
      </section>
    )
  }

  return (
    <section className="registration-panel">
      <button className="back-button" onClick={onCancel}>
        ← Voltar para minhas plantas
      </button>

      <div className="registration-heading">
        <h1>Cadastrar planta</h1>
        <p>Informe os dados da planta e do dispositivo conectado a ela.</p>
      </div>

      <form className="plant-form" onSubmit={handleSubmit}>
        <label>
          Apelido da planta
          <input
            name="nickname"
            placeholder="Ex.: Jiboia da sala"
            minLength={2}
            required
          />
        </label>

        <label>
          Espécie de referência
          <select name="species" required defaultValue="">
            <option value="" disabled>
              Selecione uma espécie
            </option>

            {referencePlants.map((plant) => (
              <option key={plant.name} value={plant.name}>
                {plant.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Localização
          <input name="location" placeholder="Ex.: Sala" />
        </label>

        <label>
          Identificador do dispositivo
          <input
            name="deviceId"
            placeholder="Ex.: vaso-001"
            minLength={3}
            required
          />
          <small>Use o mesmo identificador configurado no ESP32.</small>
        </label>

        <label className="toggle-field">
          <input name="automaticIrrigation" type="checkbox" />
          <span>
            <strong>Ativar rega automática</strong>
            <small>
              O sistema poderá solicitar rega quando o solo estiver abaixo do
              limite ideal.
            </small>
          </span>
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancelar
          </button>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar planta'}
          </button>
        </div>
      </form>
    </section>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('plants')
  const [selectedReference, setSelectedReference] =
    useState<ReferencePlant | null>(null)

  const [showRegistration, setShowRegistration] = useState(false)

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">♧</span>
          Gärtner
        </a>

        <nav className="tab-navigation" aria-label="Navegação principal">
          <button
            className={activeTab === 'plants' ? 'tab active' : 'tab'}
            onClick={() => {  setActiveTab('plants') 
               setShowRegistration(false)}}
          >
            Minhas plantas
          </button>

          <button
            className={activeTab === 'references' ? 'tab active' : 'tab'}
            onClick={() => {setActiveTab('references')
                setShowRegistration(false)}}
          >
            Referências
          </button>
        </nav>

        <span className="sync-status">• Última sync: agora mesmo</span>
      </header>

      <main className="page-content">
        {showRegistration ? (  <RegisterPlantForm onCancel={() => setShowRegistration(false)} />) : activeTab === 'plants' ? (
          <DashboardPlants onRegister={() => setShowRegistration(true)} />
        ) : (
          <section>
            <div className="page-heading">
              <div>
                <h1>Referências de plantas</h1>
                <p>Condições ideais para cultivo doméstico.</p>
              </div>
            </div>

            <div className="reference-grid">
              {referencePlants.map((plant) => (
                <button
                  className="reference-card"
                  key={plant.name}
                  onClick={() => setSelectedReference(plant)}
                >
                  <div className="card-topline">
                    <h2>{plant.name}</h2>
                    <span className={`difficulty ${plant.difficultyClass}`}>
                      {plant.difficulty}
                    </span>
                  </div>

                  <div className="reference-origin">
                    <span>Origem</span>
                    <p>{plant.origin}</p>
                  </div>

                  <div className="moisture-info">
                    <div>
                      <span>Umidade ideal</span>
                      <strong>{plant.moistureRange}</strong>
                    </div>

                    <div className="progress-track">
                      <span
                        className="progress-fill"
                        style={{ width: `${plant.moistureProgress}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {selectedReference && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setSelectedReference(null)}
        >
          <section
            className="reference-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes de ${selectedReference.name}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setSelectedReference(null)}
              aria-label="Fechar modal"
            >
              ×
            </button>

            <h2>{selectedReference.name}</h2>
            <p className="scientific-name">
              Nome científico: {selectedReference.scientificName}
            </p>

            <dl className="reference-details">
              <div>
                <dt>Origem:</dt>
                <dd>{selectedReference.origin}</dd>
              </div>
              <div>
                <dt>Umidade ideal:</dt>
                <dd>{selectedReference.moistureRange}</dd>
              </div>
              <div>
                <dt>Temperatura ideal:</dt>
                <dd>{selectedReference.temperatureRange}</dd>
              </div>
              <div>
                <dt>Luminosidade:</dt>
                <dd>{selectedReference.luminosity}</dd>
              </div>
              <div>
                <dt>Frequência de rega:</dt>
                <dd>{selectedReference.wateringFrequency}</dd>
              </div>
            </dl>

            <aside className="care-tip">
              <strong>Dica de cuidado</strong>
              <p>{selectedReference.careTip}</p>
            </aside>
          </section>
        </div>
      )}
    </div>
  )
}

export default App