import { useEffect, useState } from 'react'
import DashboardPlants from './DashboardPlants'

type Tab = 'plants' | 'references'

function GartnerLogo() {
  return (
    <svg
      className="brand-logo"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path d="M29 42V20" />
      <path d="M29 29C19 26 17 18 18 14C25 17 29 22 29 29Z" />
      <path d="M30 22C31 12 38 8 45 8C44 16 39 22 30 22Z" />
      <path d="M31 33C39 25 48 26 53 29C49 37 41 39 31 36" />
      <path d="M25 36C17 35 12 31 10 25C18 25 24 29 25 36Z" />
      <path d="M13 42H51V49H13V42Z" />
      <path d="M18 49H46V54H18V49Z" />
      <path d="M25 54H39V59H25V54Z" />
    </svg>
  )
}

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
    moistureRange: '40% - 70%',
    moistureProgress: 55,
    temperatureRange: '18°C - 30°C',
    luminosity: 'Baixa luminosidade',
    wateringFrequency: 'Regue somente quando o solo estiver seco',
    careTip: 'Evite o excesso de água e mantenha em vaso com boa drenagem.',
    difficulty: 'Muito fácil',
    difficultyClass: 'very-easy',
  },
]


type RegisterPlantFormProps = {
  onCancel: () => void
  plantToEdit?: EditablePlant | null
}

type EditablePlant = {
  id: number
  nickname: string
  device_id: string
  location: string | null
  species_id: number
  species_name: string
}

function RegisterPlantForm({ onCancel, plantToEdit }: RegisterPlantFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [species, setSpecies] = useState<Array<{ id: number; name: string }>>([])

  useEffect(() => {
    async function loadSpecies() {
      try {
        const response = await fetch('http://127.0.0.1:8000/species')
        if (!response.ok) {
          throw new Error('Não foi possível carregar as espécies.')
        }
        setSpecies(await response.json())
      } catch {
        setError('Não foi possível carregar as espécies de referência.')
      }
    }

    loadSpecies()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    const response = await fetch(
      plantToEdit
        ? `http://127.0.0.1:8000/plants/${plantToEdit.id}`
        : 'http://127.0.0.1:8000/plants',
      {
      method: plantToEdit ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nickname: formData.get('nickname'),
        device_id: formData.get('deviceId'),
        location: formData.get('location') || null,
        species_id: Number(formData.get('speciesId')),
      }),
      },
    )

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
        <h1>{plantToEdit ? 'Planta atualizada!' : 'Planta cadastrada!'}</h1>
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
        <h1>{plantToEdit ? 'Editar planta' : 'Cadastrar planta'}</h1>
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
            defaultValue={plantToEdit?.nickname}
          />
        </label>

        <label>
          Espécie de referência
          <select
            name="speciesId"
            required
            defaultValue={plantToEdit?.species_id ?? ''}
            disabled={species.length === 0}
          >
            <option value="" disabled>
              {species.length === 0 ? 'Carregando espécies...' : 'Selecione uma espécie'}
            </option>

            {species.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Localização
          <input
            name="location"
            placeholder="Ex.: Sala"
            defaultValue={plantToEdit?.location ?? ''}
          />
        </label>

        <label>
          Identificador do dispositivo
          <input
            name="deviceId"
            placeholder="Ex.: vaso-001"
            minLength={3}
            required
            defaultValue={plantToEdit?.device_id}
          />
          <small>Use o mesmo identificador configurado no ESP32.</small>
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancelar
          </button>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? plantToEdit
                ? 'Salvando...'
                : 'Cadastrando...'
              : plantToEdit
                ? 'Salvar alterações'
                : 'Cadastrar planta'}
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
  const [plantToEdit, setPlantToEdit] = useState<EditablePlant | null>(null)

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <GartnerLogo />
          Gärtner
        </a>

        <nav className="tab-navigation" aria-label="Navegação principal">
          <button
            className={activeTab === 'plants' ? 'tab active' : 'tab'}
            onClick={() => {  setActiveTab('plants') 
               setShowRegistration(false)
               setPlantToEdit(null)}}
          >
            Minhas plantas
          </button>

          <button
            className={activeTab === 'references' ? 'tab active' : 'tab'}
            onClick={() => {setActiveTab('references')
                setShowRegistration(false)
                setPlantToEdit(null)}}
          >
            Referências
          </button>
        </nav>

        <span className="sync-status">• Última sync: agora mesmo</span>
      </header>

      <main className="page-content">
        {showRegistration ? (
          <RegisterPlantForm
            plantToEdit={plantToEdit}
            onCancel={() => {
              setShowRegistration(false)
              setPlantToEdit(null)
            }}
          />
        ) : activeTab === 'plants' ? (
          <DashboardPlants
            onRegister={() => setShowRegistration(true)}
            onEdit={(plant) => {
              setPlantToEdit(plant)
              setShowRegistration(true)
            }}
          />
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
