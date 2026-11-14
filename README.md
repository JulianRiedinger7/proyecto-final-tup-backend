# Sistema de Gestión de Escena Musical Local — Backend (CircuitoVivo)

> Repositorio **backend** del proyecto final de carrera: un sistema de gestión para la escena musical local, incluyendo eventos, espectadores y emisión/validación de tickets. Este backend expone una API REST consumida por el frontend: [Frontend Repo](https://github.com/JulianRiedinger7/proyecto-final-tup-frontend)

## Diagrama Entidad-Relación Inicial

![Diagrama ER](./assets/diagrama-er.png)

## Integrantes

- Julian Riedinger (GitHub: `@JulianRiedinger7`)
- Matias Ledesma Gonzalez (GitHub: `@Matiaslegon`)
- Clara Zivano (GitHub: `@clazlo`)

## Metodología de Trabajo y Flujo de GIT

Como equipo se decidió adoptar las siguientes pautas:

- **Rama principal (`main`):** contiene solo código estable y probado. No se realizan commits directos sobre esta rama.
- **Rama de integración (`dev`) y ramas cortas por funcionalidad:** cada integrante aísla su trabajo en ramas cortas y descriptivas con sus iniciales (ej. `julianriedinger27/cv-23-ticket-service-logica-de-negocio-backend`).
- **Revisión mediante Pull Requests:** una vez finalizada la funcionalidad, se realiza un Pull Request. Otro integrante del equipo revisa el código, sugiere mejoras y aprueba el merge si todo es correcto.

## Tecnologías y stack

| Área            | Tecnología         | Versión                               | Uso                                           |
| --------------- | ------------------ | ------------------------------------- | --------------------------------------------- |
| Runtime         | Node.js            | `>=20` (recomendado 22, ver `.nvmrc`) | Ejecución del servidor                        |
| Lenguaje        | TypeScript         | `^5.6.3`                              | Tipado estático y compilación a `dist/`       |
| Framework       | Express            | `^4.21.2`                             | API HTTP / routing                            |
| Validación      | Zod                | `4.6.5`                               | Validación de variables de entorno y requests |
| Package manager | pnpm               | `>=9` (recomendado `10.33.0`)         | Instalación reproducible vía `pnpm-lock.yaml` |
| Testing         | Vitest + Supertest | `^4.1.0` / `^7.1.4`                   | Tests unitarios y de integración HTTP         |
| Calidad         | Biome + Husky      | `2.5.15` / `9.1.7`                    | Lint, formato y hook `pre-commit`             |
| Env config      | dotenv             | `^16.4.7`                             | Carga de variables de entorno desde `.env`    |
| CORS            | cors               | `^2.8.5`                              | Control de orígenes permitidos                |
| Seguridad       | helmet             | `8.3.0`                               | Headers HTTP de seguridad                     |
| Logs HTTP       | morgan             | `1.12.1`                              | Log de peticiones (`dev` / `combined`)        |
| Dev runner      | tsx                | `^4.19.2`                             | `pnpm dev` con recarga (`tsx watch`)          |

## Requisitos previos

- **Git** (para clonar el repositorio)
- **Node.js `>=20`** (recomendado `22`, ver [`.nvmrc`](./.nvmrc))
- **pnpm `>=9`**

## Instalación y puesta en marcha

```bash
# 1. Clonar el repo
git clone https://github.com/JulianRiedinger7/proyecto-final-tup-backend.git
cd proyecto-final-tup-backend

# 2. Instalar dependencias EXACTAS del lockfile
pnpm install --frozen-lockfile

# 3. Configurar variables de entorno
## En Linux / MacOS
cp .env.example .env

## En Windows (PowerShell)
Copy-Item .env.example .env

# 4. Levantar el servidor en desarrollo
pnpm dev
```

La API queda disponible en `http://localhost:3000` (o el `PORT` configurado en `.env`).

### Variables de entorno

Definidas en [`.env.example`](./.env.example) y validadas al iniciar en [`src/config/env.ts`](./src/config/env.ts). El archivo `.env` no se versiona.

| Variable      | Default                 | Descripción                                                  |
| ------------- | ----------------------- | ------------------------------------------------------------ |
| `PORT`        | `3000`                  | Puerto HTTP donde escucha Express .                          |
| `NODE_ENV`    | `development`           | Entorno de ejecución (`development`, `test` o `production`). |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen permitido por CORS para las peticiones del frontend.  |

### Persistencia actual

Actualmente los repositorios cargan los datos iniciales desde archivos JSON en [`data/`](./data/) (`eventos.json`, `espectadores.json` y `tickets.json`) y mantienen los cambios **en memoria** durante la ejecución. Al reiniciar el servidor, los datos vuelven al estado inicial de esos archivos.

## Estructura del repositorio

```text
├── data/                  # Datos iniciales en JSON (eventos, espectadores, tickets)
├── docs/                  # Documentación técnica del proyecto
├── src/
│   ├── config/            # Validación y carga de variables de entorno
│   ├── controllers/       # Adaptadores HTTP (request/response y delegación)
│   ├── errors/            # Errores de dominio con código HTTP asociado
│   ├── middlewares/       # Validación con Zod (validate) y manejo global de errores
│   ├── models/            # Tipos e interfaces de dominio
│   ├── repositories/      # Acceso a datos en memoria e interfaces (contratos)
│   ├── routes/            # Definición de rutas y middlewares por recurso
│   ├── schemas/           # Esquemas Zod para params, query y body
│   ├── services/          # Lógica y reglas de negocio (actualmente TicketService)
│   ├── utils/             # Helpers de fechas (zona horaria AR) y respuestas HTTP
│   ├── app.ts             # Configuración de Express, middlewares y montaje de rutas
│   └── server.ts          # Punto de entrada que inicia el servidor HTTP
└── tests/
    ├── unit/              # Tests unitarios aislados con repositorios mockeados
    └── integration/       # Tests de integración HTTP sobre App con Supertest
```

## Comandos del proyecto

### Desarrollo, build y calidad de código

```bash
pnpm dev           # Levanta la API en modo watch (tsx watch src/server.ts)
pnpm build         # Compila TypeScript en dist/
pnpm start         # Ejecuta el código compilado (node dist/server.js)
pnpm typecheck     # Verifica tipos de TypeScript sin emitir archivos
pnpm lint          # Chequea lint y formato con Biome en todo el repo
pnpm lint:fix      # Aplica correcciones seguras y formatea con Biome
pnpm format:check  # Verifica formato en modo CI sin modificar archivos (biome ci)
```

> **Estilo de código:** **Biome 2.x** (ver [`biome.json`](./biome.json)).
> El hook `pre-commit` de **Husky** ejecuta `biome check --staged` y bloquea el commit si detecta errores.
> Si el hook frena el commit, corré `pnpm lint:fix`, revisá el diff y volvé a commitear.
> Extensión recomendada para VS Code: `biomejs.biome` (ver [`.vscode/extensions.json`](./.vscode/extensions.json)).

### Testing

Se ejecutan desde la raíz del repositorio y no requieren levantar el servidor manualmente ni contar con una base de datos externa:

| Comando           | Qué ejecuta                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| `pnpm test`       | Corre toda la suite con Vitest una vez (`tests/unit` y `tests/integration`). |
| `pnpm test:watch` | Corre Vitest en modo watch al modificar archivos.                            |

- **Tests unitarios (`tests/unit/`):** verifican la lógica de negocio de `TicketService` (cálculo de precios preventa/puerta, fecha de inicio, cupo web, espectador activo y transiciones de estado) aislando los repositorios con dobles de prueba (`vi.fn()`).
- **Tests de integración (`tests/integration/`):** prueban las rutas HTTP reales de Express mediante `Supertest` sobre una instancia de `App` con los repositorios en memoria reales (`TicketController` → `TicketService` → repositorios + validación Zod + `errorHandler`).

## Contrato de la API

Todas las rutas se exponen bajo el prefijo `/api/v1`.

### Formato estándar de respuesta

- **Éxito:** `{ "msg": "Descripción", "code": 200 | 201, "data": ... }`
- **Error:** `{ "msg": "Descripción del error", "code": 400 | 404 | 409 | 500 }`

| Endpoint                          | Descripción                                                                                            | Códigos habituales         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------- |
| `GET /api/v1/health`              | Verifica que la API esté respondiendo                                                                  | `200`                      |
| `GET /api/v1/eventos`             | Lista eventos (`page`, `limit`, `sortOrder`, `titulo`, `lugar`)                                        | `200`, `400`               |
| `GET /api/v1/eventos/:id`         | Obtiene un evento por ID                                                                               | `200`, `400`, `404`        |
| `POST /api/v1/eventos`            | Crea un evento (`cupoReservasWeb <= aforoMaximo`)                                                      | `201`, `400`               |
| `PUT /api/v1/eventos/:id`         | Reemplaza un evento existente                                                                          | `200`, `400`, `404`        |
| `PATCH /api/v1/eventos/:id`       | Actualiza parcialmente un evento                                                                       | `200`, `400`, `404`        |
| `DELETE /api/v1/eventos/:id`      | Elimina un evento                                                                                      | `200`, `400`, `404`        |
| `GET /api/v1/espectadores`        | Lista espectadores (`page`, `limit`, `sortBy`, `sortOrder`, `search`)                                  | `200`, `400`               |
| `GET /api/v1/espectadores/:id`    | Obtiene un espectador por ID                                                                           | `200`, `400`, `404`        |
| `POST /api/v1/espectadores`       | Registra un espectador (`dni` de 7-8 dígitos, `telefono` 8-12 caracteres)                              | `201`, `400`               |
| `PATCH /api/v1/espectadores/:id`  | Actualiza parcialmente un espectador                                                                   | `200`, `400`, `404`        |
| `DELETE /api/v1/espectadores/:id` | Elimina un espectador                                                                                  | `200`, `400`, `404`        |
| `GET /api/v1/tickets`             | Lista tickets (`page`, `limit`, `sortBy`, `sortOrder`, `search`, `estado`, `eventoId`, `espectadorId`) | `200`, `400`               |
| `GET /api/v1/tickets/:id`         | Obtiene un ticket por ID con `evento` y `espectador` resumidos                                         | `200`, `400`, `404`        |
| `POST /api/v1/tickets`            | Emite un ticket en estado `RESERVADO`                                                                  | `201`, `400`, `404`, `409` |
| `PATCH /api/v1/tickets/:id`       | Cambia `estado` y/o `fechaValidacionPuerta`                                                            | `200`, `400`, `404`, `409` |
| `DELETE /api/v1/tickets/:id`      | Elimina un ticket                                                                                      | `200`, `400`, `404`        |

### Detalle del módulo de Tickets (`/api/v1/tickets`)

- **Creación (`POST /api/v1/tickets`):**
  - Body estricto: `{ "eventoId": number, "espectadorId": number }`. No acepta precio ni estado desde el cliente.
  - Valida que el evento exista y que el espectador exista y esté activo (`isActive === true`); caso contrario responde `404`.
  - Si el evento ya comenzó (`ahora >= fechaHora`), responde `409`.
  - Si los tickets no cancelados del evento alcanzaron `cupoReservasWeb`, responde `409`.
  - Calcula `precioUnitario` comparando la fecha actual vs la fecha del evento en zona horaria `America/Argentina/Buenos_Aires` (`precioPreventa` en días previos, `precioPuerta` el mismo día) y crea el ticket en estado `RESERVADO`.
- **Actualización (`PATCH /api/v1/tickets/:id`):**
  - Body estricto con al menos un campo opcional: `{ "estado"?: "RESERVADO" | "CONFIRMADO" | "UTILIZADO" | "CANCELADO", "fechaValidacionPuerta"?: string | null }`.
  - Transiciones válidas de estado:
    - `RESERVADO` → `CONFIRMADO` o `CANCELADO`
    - `CONFIRMADO` → `UTILIZADO` o `CANCELADO`
    - `UTILIZADO` y `CANCELADO` son estados finales (cualquier transición desde ellos responde `409`).
  - Al pasar un ticket a `UTILIZADO`, registra automáticamente `fechaValidacionPuerta` con la fecha actual.
- **Consultas (`GET /api/v1/tickets` y `GET /api/v1/tickets/:id`):**
  - Devuelven los datos resumidos del `evento` (`id`, `titulo`, `fechaHora`, `lugar`) y del `espectador` (`id`, `nombre`, `apellido`) embebidos en cada ticket.

## Estado Actual del Proyecto

- [x] Modelo de datos inicial (ER) definido y documentado.
- [x] CRUD de Tickets, Eventos y Espectadores implementado utilizando una arquitectura en capas.
- [x] Persistencia inicial en memoria cargada desde archivos JSON (`data/`).
- [x] Reglas de negocio y tests unitarios y de integración para Tickets.
- [ ] Reglas de negocio y tests para Eventos y Espectadores.
- [ ] Colección de Postman / especificación formal de la API.
- [ ] Migración a base de datos real.
