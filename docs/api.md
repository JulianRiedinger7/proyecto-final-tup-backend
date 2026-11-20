# Contrato de la API — CircuitoVivo Backend

Todas las rutas se exponen bajo el prefijo `/api/v1`.

## Formato estándar de respuesta

- **Éxito:** `{ "msg": "Descripción", "code": 200 | 201, "data": ... }`
- **Error:** `{ "msg": "Descripción del error", "code": 400 | 404 | 409 | 500 }`

## Resumen de endpoints

| Endpoint                         | Descripción                                                                                        | Códigos habituales         |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------- |
| `GET /api/v1/health`             | Verifica que la API esté respondiendo                                                              | `200`                      |
| `GET /api/v1/eventos`            | Lista eventos (`page`, `limit`, `sortOrder`, `titulo`, `lugar`)                                    | `200`, `400`               |
| `GET /api/v1/eventos/:id`        | Obtiene un evento por ID                                                                           | `200`, `400`, `404`        |
| `POST /api/v1/eventos`           | Crea un evento                                                                                     | `201`, `400`               |
| `PUT /api/v1/eventos/:id`        | Reemplaza un evento existente                                                                      | `200`, `400`, `404`        |
| `PATCH /api/v1/eventos/:id`      | Actualiza parcialmente un evento                                                                   | `200`, `400`, `404`        |
| `DELETE /api/v1/eventos/:id`     | Elimina un evento                                                                                  | `200`, `400`, `404`        |
| `GET /api/v1/espectadores`       | Lista espectadores (`page`, `limit`, `sortBy`, `sortOrder`, `search`)                              | `200`, `400`               |
| `GET /api/v1/espectadores/:id`   | Obtiene un espectador por ID                                                                       | `200`, `400`, `404`        |
| `POST /api/v1/espectadores`      | Registra un espectador                                                                             | `201`, `400`, `409`        |
| `PATCH /api/v1/espectadores/:id` | Actualiza parcialmente un espectador                                                               | `200`, `400`, `404`, `409` |
| `DELETE /api/v1/espectadores/:id`| Elimina un espectador                                                                              | `200`, `400`, `404`, `409` |
| `GET /api/v1/tickets`            | Lista tickets (`page`, `limit`, `sortBy`, `sortOrder`, `search`, `estado`, `eventoId`, `espectadorId`) | `200`, `400`           |
| `GET /api/v1/tickets/:id`        | Obtiene un ticket por ID con `evento` y `espectador` resumidos                                     | `200`, `400`, `404`        |
| `POST /api/v1/tickets`           | Emite un ticket en estado `RESERVADO`                                                              | `201`, `400`, `404`, `409` |
| `PATCH /api/v1/tickets/:id`      | Cambia `estado` y/o `fechaValidacionPuerta`                                                        | `200`, `400`, `404`, `409` |
| `DELETE /api/v1/tickets/:id`     | Elimina un ticket                                                                                  | `200`, `400`, `404`        |

---

## Reglas y comportamiento por módulo

### Eventos (`/api/v1/eventos`)

- **Payload de creación/reemplazo (`POST` / `PUT`):** `titulo`, `descripcion`, `fechaHora` (ISO datetime), `lugar`, `aforoMaximo` (entero `> 0`), `cupoReservasWeb` (entero `>= 0`), `precioPreventa` (`>= 0`) y `precioPuerta` (`>= 0`).
- **Validación de capacidad:** `cupoReservasWeb` no puede superar `aforoMaximo` (si ocurre en creación, reemplazo o `PATCH`, responde `400`).
- **Listado:** pagina por defecto de a `10` elementos (`limit` máximo `100`), ordena por `fechaHora` (`asc` o `desc`) y filtra por `titulo` y `lugar`.

### Espectadores (`/api/v1/espectadores`)

- **Payload de creación (`POST`):** `nombre`, `apellido`, `email`, `dni` (7 u 8 dígitos numéricos) y `telefono` (8 a 12 caracteres). Se registra con `isActive: true`.
- **Unicidad:** `POST` y `PATCH` validan que el `dni` y el `email` no pertenezcan a otro espectador; si están duplicados responden `409`.
- **Eliminación:** `DELETE` responde `409` si el espectador tiene tickets en estado `RESERVADO` o `CONFIRMADO`.
- **Listado:** pagina por defecto de a `10` elementos (`limit` máximo `100`), ordena por `id`, `nombre`, `apellido`, `dni` o `email`, y filtra por `search` sobre `dni` o `email`.

### Tickets (`/api/v1/tickets`)

- **Creación (`POST /api/v1/tickets`):**
  - Body estricto: `{ "eventoId": number, "espectadorId": number }`. No acepta precio ni estado desde el cliente.
  - Verifica que el evento exista y que el espectador exista y esté activo (`isActive === true`); caso contrario responde `404`.
  - Si el evento ya comenzó (`ahora >= fechaHora`), responde `409`.
  - Si la cantidad de tickets con estado distinto de `CANCELADO` para ese evento alcanzó `cupoReservasWeb`, responde `409`.
  - Calcula `precioUnitario` comparando la fecha actual frente a la fecha del evento en zona horaria `America/Argentina/Buenos_Aires` (`precioPreventa` en días previos al evento; `precioPuerta` el mismo día).
  - Genera `codigoQr` y crea el ticket con `estado: "RESERVADO"` y `fechaValidacionPuerta: null`.
- **Actualización (`PATCH /api/v1/tickets/:id`):**
  - Body estricto con al menos un campo opcional: `{ "estado"?: "RESERVADO" | "CONFIRMADO" | "UTILIZADO" | "CANCELADO", "fechaValidacionPuerta"?: string | null }`.
  - Máquina de estados permitida (cualquier transición fuera de esta tabla responde `409`):
    - `RESERVADO` → `CONFIRMADO` o `CANCELADO`
    - `CONFIRMADO` → `UTILIZADO` o `CANCELADO`
    - `UTILIZADO` y `CANCELADO` son estados finales (no admiten nuevas transiciones).
  - Al pasar un ticket a `UTILIZADO`, registra automáticamente `fechaValidacionPuerta` con la fecha y hora actual en formato ISO.
- **Consultas (`GET /api/v1/tickets` y `GET /api/v1/tickets/:id`):**
  - Cada ticket devuelto reemplaza `eventoId` y `espectadorId` por los objetos resumidos `evento` (`id`, `titulo`, `fechaHora`, `lugar`) y `espectador` (`id`, `nombre`, `apellido`).
  - `GET /api/v1/tickets` permite filtrar por `search` (sobre `codigoQr`), `estado`, `eventoId` y `espectadorId`, además de ordenar (`id`, `precioUnitario`, `estado`, `createdAt`) y paginar.
