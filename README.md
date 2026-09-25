# Sistema de Gestión de Escena Musical Local — Backend

> Repositorio **backend** del proyecto final de carrera: un sistema de gestión para la escena musical local, incluyendo bandas, eventos y espectadores/publico general. Este backend expone una API REST para ser consumida por un frontend.

## Integrantes

- Julian Riedinger (GitHub: `@JulianRiedinger7`)
- Matias Ledesma Gonzalez (GitHub: `@Matiaslegon`)
- Clara Zivano (GitHub: `@clazlo`)

## Metodologia de Trabajo y Flujo de GIT

Como equipo se decidio adoptar las siguientes pautas:

- Rama principal (`main`): contiene solo codigo estable y probado, listo para produccion. No se realizan commits directos sobre esta rama.
- Ramas cortas por funcionalidad: Cada integrante aisla su trabajo en ramas cortas y descriptivas, incluyendo las iniciales para mejor diferenciacion (ej. feature/gestion-personajes-JR, feature/combate-turnos-MLG, fix/estadisticas-personajes-CZ). Estas ramas se crean a partir de la rama `main`.
- Revision mediante Pull Requests: Una vez finalizada la funcionalidad, se realiza un Pull Request hacia la rama `main`. Otro integrante del equipo revisa el codigo, sugiere mejoras y aprueba el merge si todo es correcto.

## Tecnologías y stack inicial

| Área            | Tecnología | Versión                               | Uso                                    |
| --------------- | ---------- | ------------------------------------- | -------------------------------------- |
| Runtime         | Node.js    | `>=20` (recomendado 22, ver `.nvmrc`) | Ejecución del servidor                 |
| Lenguaje        | TypeScript | `^5.6.3`                              | Tipado estático, compilación a `dist/` |
| Framework       | Express    | `^4.21.2`                             | API HTTP / routing                     |
| Package manager | pnpm       | `>=9` (recomendado `10.33.0`)         | Instalación reproducible vía lockfile  |
| Env config      | dotenv     | `^16.4.7`                             | Variables de entorno desde `.env`      |
| CORS            | cors       | `^2.8.5`                              | Control de orígenes permitidos         |
| Seguridad       | helmet     | `8.3.0`                               | Headers HTTP de seguridad              |
| Logs HTTP       | morgan     | `1.12.1`                              | Log de peticiones (`dev` / `combined`) |
| Dev runner      | tsx        | `^4.19.2`                             | `pnpm dev` con recarga (`tsx watch`)   |

## Requisitos previos

- **Git** (para clonar el repo)
- **Node.js `>=20`**
- **pnpm `>=9`**

## Instalación

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
copy .env.example .env
```

### Correr el proyecto

```bash
pnpm dev        # desarrollo con recarga (tsx watch src/server.ts)
pnpm build      # compila TypeScript -> dist/
pnpm start      # corre lo compilado (node dist/server.js)
pnpm typecheck  # solo verifica tipos, sin compilar
```

La API queda en `http://localhost:3000` (o el `PORT` definido en tu `.env`).

## Estado Actual del Proyecto

- Taller I (actual):
  - Constitucion del equipo y repo inicial.
  - Entorno de desarrollo reproducible probado por todo el equipo.
  - API base con endpoint de prueba utilizando Express.
