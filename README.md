# Gärtner — Sistema de Monitoramento e Rega Automatizada de Plantas (IoT)

Projeto acadêmico de Engenharia para monitorar plantas em vasos conectados. O sistema recebe dados de sensores, registra o histórico, apresenta um dashboard web e acompanha o estado da rega automática.

> A decisão de ligar ou desligar a bomba é feita pelo **MCU**. O usuário não possui controle manual da bomba pelo dashboard; o servidor monitora e registra os estados enviados pelo dispositivo.

## Funcionalidades atuais

- Catálogo de plantas de referência: Jiboia, Antúrio, Zamioculca e Dinheiro-em-penca.
- Cadastro de plantas associadas a um `device_id` de vaso.
- Registro de leituras de temperatura, umidade do solo, luz, reservatório, necessidade de água e bomba.
- Dashboard com plantas reais registradas no banco.
- Modal de detalhes da planta e modal de histórico com gráficos simples.
- Banco SQLite local, sem necessidade de instalar um servidor de banco de dados.

## Arquitetura

```text
MCU + sensores
      │
      │  MQTT (integração em definição)
      ▼
FastAPI + SQLAlchemy + SQLite
      │  API REST
      ▼
React + Vite (dashboard)
```

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Backend | Python, FastAPI e Uvicorn |
| Persistência | SQLAlchemy e SQLite |
| Frontend | React, TypeScript e Vite |
| Comunicação IoT | MQTT (planejada; ainda não conectada ao código) |
| Versionamento | Git e GitHub |

## Pré-requisitos

Instale os programas abaixo antes de iniciar:

- [Git](https://git-scm.com/downloads)
- [Python 3.13 ou superior](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/), preferencialmente a versão LTS
- Um editor, como o [Visual Studio Code](https://code.visualstudio.com/)

Confirme a instalação no PowerShell:

```powershell
git --version
python --version
node --version
npm --version
```

## Estrutura do projeto

```text
dashboard_gartnerr/
├── backend/
│   ├── app/
│   │   ├── database.py       # Conexão SQLite e sessão SQLAlchemy
│   │   ├── main.py           # Rotas FastAPI
│   │   ├── models.py         # Tabelas do banco
│   │   └── schemas.py        # Formatos de entrada e saída da API
│   ├── migrate_readings.py   # Migração segura das colunas de leituras
│   ├── requirements.txt      # Dependências Python
│   ├── seed.py               # Cadastro das espécies de referência
│   └── plantas.db            # Banco local, ignorado pelo Git
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── DashboardPlants.tsx
│   │   ├── PlantHistoryModal.tsx
│   │   └── index.css
│   └── package.json
├── firmware/                 # Código do MCU (a integrar)
├── docs/
└── README.md
```

## Como iniciar o projeto

Os comandos abaixo são para Windows/PowerShell.

### 1. Clonar o repositório

```powershell
git clone https://github.com/LeticiaaLuz/dashboard_gartnerr.git
cd dashboard_gartnerr
```

### 2. Configurar e iniciar o backend

Abra um terminal na pasta do projeto:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

O backend ficará disponível em:

- API: <http://127.0.0.1:8000>
- Documentação interativa: <http://127.0.0.1:8000/docs>

Na primeira inicialização, o FastAPI cria automaticamente o arquivo `backend/plantas.db` e as tabelas.

### 3. Popular as espécies de referência

Com o backend rodando, abra **outro terminal**, entre em `backend`, ative o ambiente virtual e execute:

```powershell
.\.venv\Scripts\Activate.ps1
python seed.py
python migrate_readings.py
```

O `seed.py` pode ser executado mais de uma vez sem duplicar as espécies. O `migrate_readings.py` é seguro: em um banco novo ele só informa que as colunas já existem; em um banco antigo ele adiciona as colunas novas sem apagar os dados.

### 4. Configurar e iniciar o frontend

Abra um terceiro terminal na raiz do projeto:

```powershell
cd frontend
npm install
npm run dev
```

Abra o dashboard em <http://localhost:5173>.

> O backend deve continuar rodando enquanto o frontend estiver aberto, pois o dashboard consulta a API em `http://127.0.0.1:8000`.

## Dados iniciais das espécies

| Espécie | Nome científico | Umidade ideal | Temperatura ideal |
| --- | --- | --- | --- |
| Jiboia | *Epipremnum aureum* | 40%–60% | 18°C–30°C |
| Antúrio | *Anthurium andraeanum* | 60%–80% | 18°C–28°C |
| Zamioculca | *Zamioculcas zamiifolia* | 20%–40% | 18°C–32°C |
| Dinheiro-em-penca | *Callisia repens* | 60%–75% | 18°C–30°C |

## Rotas principais da API

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/` | Verifica se o servidor está ativo |
| `GET` | `/species` | Lista as plantas de referência |
| `POST` | `/plants` | Cadastra uma planta |
| `GET` | `/plants` | Lista plantas cadastradas |
| `POST` | `/plants/{plant_id}/readings` | Salva uma leitura do MCU ou de teste |
| `GET` | `/plants/{plant_id}/readings` | Retorna o histórico de uma planta |
| `GET` | `/dashboard/plants` | Retorna plantas, espécie e última leitura para o dashboard |

### Exemplo: cadastrar uma planta

```json
{
  "nickname": "Jiboia da sala",
  "device_id": "vaso-001",
  "location": "Sala",
  "automatic_irrigation": false,
  "species_id": 1
}
```

### Exemplo: registrar uma leitura

```json
{
  "soil_moisture": 35,
  "temperature": 24,
  "light_on": true,
  "reservoir_level": 80,
  "needs_water": true,
  "pump_on": true,
  "reservoir_empty": false
}
```

As variáveis registradas correspondem ao firmware do MCU:

| Variável | Tipo | Descrição |
| --- | --- | --- |
| `temperature` | número | Temperatura em graus Celsius |
| `soil_moisture` | número | Umidade do solo, de 0% a 100% |
| `light_on` | booleano | Indica se há luz detectada |
| `reservoir_level` | número | Nível do reservatório, de 0% a 100% |
| `needs_water` | booleano | Indica que o MCU identificou necessidade de água |
| `pump_on` | booleano | Indica se a bomba está ligada |

## Testes rápidos

### Validar o frontend

```powershell
cd frontend
npm run build
```

O resultado esperado é `✓ built`.

### Testar uma leitura sem o MCU

1. Abra <http://127.0.0.1:8000/docs>.
2. Use `POST /plants/{plant_id}/readings`.
3. Informe o `plant_id` de uma planta cadastrada.
4. Envie o JSON de exemplo acima.
5. Consulte `GET /plants/{plant_id}/readings` para conferir o histórico.

## MQTT e integração com o MCU

A integração MQTT ainda está em definição. As decisões já tomadas são:

- O MCU decide localmente quando ligar e desligar a bomba.
- O usuário não poderá acionar a bomba pelo dashboard.
- A umidade do solo será convertida para uma escala de 0% a 100%, com calibração em solo seco e úmido.
- O reservatório será enviado como porcentagem.
- O MCU enviará os estados de temperatura, umidade, luz, reservatório, necessidade de água e bomba.

Antes da implementação MQTT, ainda é necessário definir:

1. O `device_id` definitivo de cada vaso;
2. Os tópicos MQTT e se as variáveis serão publicadas em uma mensagem JSON única ou em tópicos separados;
3. Como o MCU recebe o limite de umidade da espécie;
4. O limite mínimo de reservatório que gera alerta;
5. O tempo máximo de segurança da bomba ligada;
6. A estratégia de publicação e persistência das leituras.

> O MCU pode ler sensores a cada 0,2 segundo, mas não é recomendado gravar todas essas leituras no SQLite. Isso produziria aproximadamente 432 mil registros por dia para cada vaso. A recomendação é publicar/salvar leituras periódicas, por exemplo a cada 30 ou 60 segundos, e enviar imediatamente eventos relevantes como mudança em `needs_water` ou `pump_on`.

## Comandos Git úteis

```powershell
git status
git add .
git commit -m "feat: descricao da alteracao"
git push
```

## Observações de segurança

- Nunca inclua `plantas.db`, `.venv`, `node_modules` ou arquivos `.env` no Git.
- A bomba deve possuir timeout local no MCU, mesmo se perder a conexão de rede.
- O campo `reservoir_empty` está temporariamente mantido por compatibilidade; a referência principal agora é `reservoir_level` em porcentagem.
