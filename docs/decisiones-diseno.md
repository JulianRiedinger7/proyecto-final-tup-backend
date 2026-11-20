## Decisiones de Diseño CircuitoVivo

A continuacion explicaremos nuestro analisis y distintas decisiones acerca de Patrones de Diseño, Clean Code, code smells, refactoring y SOLID dentro del proyecto.

### Clase 4 Patrones Creacionales

#### Codigo analizado: [Repositories](../src/repositories), [Controllers](../src/controllers), [Routes](../src/routes)

#### Diagnostico:

Actualmente existe una cadena de dependencia a la hora de instanciar los objetos, donde `Route` debe conocer como se instancia el `Controller`, y a su vez, como se instancia el `Repository`.

Si agregamos capas extra en un futuro, como `services` para logica de negocios, seria necesario modificar en toda la cadena para su correcta incorporacion, generando mucho acoplamiento.

#### Alternativas y sus trade-offs

- **Clases estáticas**: Una alternativa sin necesidad de patrones creacionales seria evitar directamente la instanciacion y utilizar clases estaticas. El principal trade-off es desconocer si a futuro necesitaremos pasar configuraciones a la hora de la creacion, y ademas, el no poder implementar un contrato. (Las clases estaticas no implementan interfaces)

- **_Factory_** : Nos permite centralizar la instanciación y el armado de toda la cadena (`Repository` -> `Service` -> `Controller`) en un solo lugar. El cliente (`Route`) no necesita saber cómo se construyen las dependencias ni qué requieren, solo le pide a la fábrica el controlador listo para usar. El trade-off es agregar una clase extra al proyecto.

- **_Builder_** : Lo evaluamos, pero la construcción de los controladores no requiere armar objetos paso a paso con configuraciones opcionales complejas ni distintas representaciones. Usarlo agregaría complejidad innecesaria ya que la creacion de cada capa es fija.

- **_Singleton_** : En este caso especifico y en el estado actual del proyecto no nos beneficia ya que no necesitamos restringir ninguna instancia (por ejemplo de db) a una unica con un mecanismo global de acceso.

#### Decision:

**_Factory_** : Creemos que pensando a futuro y para evitar el acoplamiento en las rutas, lo mejor es implementar una clase `ControllerFactory` que se encargue de instanciar y ensamblar la cadena (Repository, Service y Controller).
De esta forma, cada `Route` solo solicita a la `Factory` el Controller que necesita (`ControllerFactory.create(type)`), quedando totalmente aislada de la construcción interna de las dependencias.

### Clase 5 Patrones Estructurales

#### Codigo analizado: [Repositories](../src/repositories), [Controllers](../src/controllers), [Routes](../src/routes)

#### Diagnostico:

Para esta clase nos basamos en la teoria que afirma `los patrones vienen despues del problema`.

Analizando las relaciones y comunicaciones entre los distintos módulos del sistema, llegamos a la conclusion de que actualmente no existe mayor acoplamiento estructural o incompatibilidad de interfaces que requieran envolver o adaptar las llamadas. Consideramos que actualmente el flujo en CircuitoVivo es directo: las rutas delegan en los controladores y estos interactúan con los servicios/repositorios.

#### Alternativas y sus trade-offs

- **_Adapter_** : Lo evaluamos para el caso de integraciones con APIs o SDKs externos con interfaces incompatibles. Como en CircuitoVivo actualmente no consumimos ningún servicio de terceros que hable un "idioma" distinto o tenga un contrato incompatible con nuestro sistema, agregar un Adapter seria complejidad extra sin ningun beneficio real.

- **_Decorator_** : Pensamos en este patrón para extender el comportamiento de algún módulo envolviéndolo (por ejemplo, para agregar un logger, métricas o reintentos). Sin embargo, actualmente nuestros módulos no necesitan agregar responsabilidades adicionales sobre las clases base. Implementarlo ahora solo haría más complejo el seguimiento del flujo de ejecución del código.

- **_Facade_** : Al evaluarlo nos generó una duda inicial por su similitud con lo que resolvimos con `ControllerFactory`, ya que tambien buscamos abstraer la complejidad para las rutas. Sin embargo, entendemos que la Factory resuelve la creación (mas adecuado para este caso), mientras que Facade abstrae operaciones de negocio complejas de un modulo. Actualmente al no tener ningun servicio complejo compuesto por múltiples pasos, creemos que agregar una Facade no nos brinda ningun beneficio real.

#### Decision:

**_Conservar el diseño actual (Sin patrones estructurales)_** : Siguiendo la teoría entendemos que el patrón viene después de un problema real de diseño. Como no encontramos un problema de acoplamiento estructural, incompatibilidad de interfaces ni necesidad de extensión de comportamiento, decidimos no forzar la implementación de ningún patrón estructural. Mantener la arquitectura actual nos evita sumar complejidad innecesaria.

### Clase 6 Patrones de Comportamiento

#### Codigo analizado: [Repositories](../src/repositories), [Controllers](../src/controllers), [Routes](../src/routes), [Schemas](../src/schemas/)

#### Diagnostico:

Al analizar el comportamiento y la colaboración entre los distintos módulos del backend de **CircuitoVivo**, y al igual que como nos sucedio con los patrones estructurales, llegamos a la conclusion que aplica la misma teoria: `los patrones vienen despues del problema`.

Actualmente, el flujo de ejecución en nuestro sistema es directo. No detectamos un acoplamiento significativo en la interacción entre componentes ni una acumulación compleja de condicionales que justifique la introducción de clases adicionales.

#### Alternativas y sus trade-offs

- **_Observer_**: En el estado actual del sistema no contamos con ningun objeto que deba reaccionar ante cambios de otro objeto (notificaciones, emails, metricas, etc), pero consideramos que a futuro este patron podria llegar a ser considerado en el modulo de **Eventos**. Por ejemplo, si necesitamos enviar notificaciones o correos, tanto a **Bandas como Espectadores (Consumidores)** cuando cambia el horario de un **Evento (Emisor)**. Sin embargo, introducir este tipo de infraestructura interna volvería menos evidente el flujo de ejecución y dificultaría la depuración.

- **_Strategy_**: Actualmente, las reglas de nuestro backend son sencillas. Por ejemplo, basandonos en `Tickets` con sus precios, hoy lo manda el cliente (**precioUnitario** en **newTicketSchema**). Sin embargo, a futuro, nos puede ocurrir que la logica de precios evolucione (entradas anticipadas/en puerta) con distintas reglar que aplicar. En ese momento, un patron **Strategy** nos permitiria aislar cada logica en su propia clase sin necesidad de condicionales complejos.

- **_Command_**: En la actualidad, las peticiones se procesan de forma inmediata en el ciclo de solicitud y respuesta HTTP. Crear este tipo de objetos añadiría clases innecesarias. A futuro podemos analizar su aplicacion en el modulo de **Tickets** si surge la necesidad de representar la accion de pagos como un objeto y asi poder manipularlo, por ejemplo rehacer un ticket ante el fallo de un pago, esperar un pago o reimprimir ticket.

#### Decision:

**_Conservar el diseño actual (Sin patrones de comportamiento)_**: Como ocurrio con los patrones estructurales, consideramos que no debemos aplicar patrones antes de que surjan los problemas, ya que recaeriamos en sobreigenieria innecesaria. Sin embargo, tuvimos en consideracion posibles inconvenientes a futuro en el desarrollo del proyecto y en como estos Patrones de comportamiento podrian sernos de utilidad.

### Clase 7 Refactoring, Clean Code y SOLID

#### Codigo analizado: [Controllers](../src/controllers), [Repositories](../src/repositories), [Routes](../src/routes) y [errorHandler](../src/middlewares/errorHandler.ts)

#### Diagnostico:

Al analizar el backend de **CircuitoVivo** consideramos que el sistema funciona de manera clara y directa, pero existen ciertos puntos donde arrastrar la **deuda tecnica** nos puede perjudicar y es mejor crear la estrategia para modificarlo:

1. Los controllers repiten el mismo manejo de errores en cada metodo.
2. Las rutas y los controllers conocen como se instancian sus dependencias (mostrado en la Clase 4).

#### Analisis:

- **_Deuda Tecnica_**: Los datos estan **mockeados en memoria**: los repositories cargan un archivo local (`data/espectadores.json`, `data/tickets.json`, los eventos estan escritos en la propia clase) y **no escriben realmente en los archivos**, por lo que los cambios se pierden al reiniciar el server.

  Consideramos que es una **deuda tecnica consciente** ya que nos permitio avanzar con la logica de la API sin pensar en una base de datos real. Sabemos y registramos esta solucion momentanea teniendo la estrategia necesaria para migrar a una base de datos real.

- **_Code Smells y Refactoring_**:
  - **Acoplamiento Rutas**: como se menciono en la Clase 4, cada `Route` conoce como se instancia su `Controller` y el `Repository`. Lo resolveriamos con `ControllerFactory`. Hoy el costo es bajo, pero crece con cada entidad y con la futura capa de `Services`: la Factory concentra ese cambio en un solo lugar. Esto seria un **Refactoring** ya que afecta internamente pero no de forma externa para el usuario.

- **_Clean Code_**:
  - **Nombres Significativos y Metodos Coherentes**: en general nombramos los distintos modulos con intencion (`findAll`, `EventoRepository`, `codigoQr`). Sin embargo detectamos algunas inconsistencias puntuales a corregir: por ejemplo, el archivo `EspectadoresRepository.ts` contiene la clase `EspectadorRepository`.
  - **Simplicidad Contextual**: nos basamos en la idea de que la solucion debe ser proporcional al problema, y por eso no incorporamos patrones o capas que el estado actual aun no justifica.

- **_Principios SOLID_**:
  - **_SRP_**: Consideramos que en general lo cumplimos (rutas definen los endpoints, controllers conocen sobre HTTP, repositories acceden a datos). Sin embargo consideramos una excepcion: los controllers tambien deciden **como se maneja y se loguea cada error**.
  - **_DIP_**: Los controllers dependen de contratos (`IEventoRepository`, `IEspectadorRepository` e `ITicketRepository`) definidos independientemente de las implementaciones, y no de las clases concretas de los repositories. Las rutas todavía instancian los controllers y repositories concretos; centralizar esa construcción en una Factory queda como una mejora pendiente.
  - **_ISP_**: Consideramos cumplirlo al declarar interfaces (`ITicketRepository`, `IEspectadorRepository`) pequeñas y bien definidas, siendo correctamente cumplidos por las clases.
  - **_OCP, LSP_**: por ahora no encontramos evidencia real comparable en nuestro codigo.

#### Caso principal: manejo de errores en los controllers

#### Codigo analizado

Los tres controllers ([TicketController](../src/controllers/TicketController.ts), [EspectadorController](../src/controllers/EspectadorController.ts), [EventoController](../src/controllers/EventoController.ts)). Y [errorHandler](../src/middlewares/errorHandler.ts) global.

#### Evidencia (code smell)

Cada metodo de los controllers repite la misma estructura: ` catch (error) { console.error(...); return errorResponse(res, '...', 500); }` y en ningun momento estamos aprovechando el `errorHandler` global para no repetirnos.

Osea hay una duplicacion de conocimiento, ya que existen dos mecanismos distintos para manejo de errores conviviendo (`catch` y `errorHandler`)

Esto tambien nos hacer romper el **SRP** en los controladores, ya que no solo tienen la responsabilidad de los metodos HTTP, sino tambien de como decidir sobre los errores.

#### Alternativas y trade-offs

- **Conservar lo actual**: no requiere cambios ni riesgo. Se puede considerar que todavia es manejable. El costo es que cada nuevo endpoint copia el bloque, y hay mucha repeticion de codigo. Ante un cambio en el manejo de los mismos, habria que modificar cada codigo copiado

- **Pasar el error con `next(error)` desde el controller**: en vez de resolver el error en cada `catch`, el controller se lo pasa al `errorHandler` global con `next(error)`, y es ese el unico lugar que decide que responder. El trade-off es que cada metodo tiene que recibir `next` por parametro, lo cual nos parece minimo.

#### Decision:

**_Pasar el error con `next(error)` desde cada controller_**: nos parecio la opcion mas simple y directa. No agregamos ninguna clase ni modulo nuevo, el cambio en cada metodo es chico.

Lo vamos a hacer en pasos chicos:

- Un controller por vez: agregar `next` como parametro y reemplazar el contenido del `catch` por `return next(error)`.

Los casos de "no encontrado" (404) no los tratamos como error, siguen resolviendose dentro del controller.

#### Seguridad

El proyecto todavia no tiene tests, asi que no tenemos esa red de seguridad. Para compensarlo, antes y despues de cada cambio probamos con Postman las mismas peticiones y comparamos **status y body**: listar, detalle existente, detalle inexistente (404), crear algo valido, crear algo invalido (400). Tambien forzamos un error en el repository para confirmar que llega al `errorHandler`.

#### Evidencia y trade-offs

- **Codigo:** [EspectadorController](../src/controllers/EspectadorController.ts), [TicketController](../src/controllers/TicketController.ts), [EventoController](../src/controllers/EventoController.ts), [errorHandler](../src/middlewares/errorHandler.ts) y [app.ts](../src/app.ts) (donde se registra).
- **Beneficios:** un solo lugar decide como se responde un error, los controllers quedan mas cortos y con una sola responsabilidad (SRP).
- **Costos:** Hay que acordarse de pasar `next` en los metodos nuevos, y las respuestas 500 ahora devuelven un mensaje generico (`Error interno del servidor`) en vez de uno por metodo (por ejemplo `Error al buscar los eventos`). Aceptamos ese cambio por simplicidad.

---

### Clase 8 — Documentación, automatización y evolución del diseño

#### 1. Ensamblado de dependencias en `App` y capa `Services` (sin `ControllerFactory`)

- **Código analizado:** [app.ts](../src/app.ts), [EventoService](../src/services/EventoService.ts), [EspectadorService](../src/services/EspectadorService.ts) y [TicketService](../src/services/TicketService.ts).
- **Contexto:** En el análisis de la Clase 4 habíamos planteado una `ControllerFactory` para desacoplar las rutas. Al incorporar la capa de `Services` en las tres entidades, vimos que los servicios colaboran entre sí (por ejemplo, `EventoService` y `EspectadorService` consultan `ITicketRepository`, y `TicketService` consulta eventos y espectadores) y necesitan compartir exactamente las mismas instancias de los repositorios en memoria.
- **Alternativas consideradas:**
  - _Implementar `ControllerFactory.create(tipo)` instanciando repositorios en cada llamada:_ introduciría el riesgo de crear instancias duplicadas en memoria que no compartan estado entre módulos.
  - _Composición centralizada en `App.setupRoutes()` (Composition Root):_ instanciar los tres repositorios una sola vez en [app.ts](../src/app.ts) e inyectarlos por constructor a cada `Service` y luego cada `Service` a su `Controller` y `Route`.
- **Decisión y trade-offs:** Elegimos centralizar el ensamblado en [app.ts](../src/app.ts). Mantenemos **DIP** (controllers y servicios dependen de interfaces) y evitamos una clase fábrica extra sin necesidad real. Como costo, `App` conoce las clases concretas, algo aceptable por ser el punto de composición de la aplicación.

#### 2. Mantener condicionales simples en reglas de Tickets (no implementar `Strategy`)

- **Código analizado:** [TicketService](../src/services/TicketService.ts) y [date.ts](../src/utils/date.ts).
- **Contexto:** Al implementar las reglas de negocio de Tickets incorporamos cálculo de precio (`precioPreventa` vs `precioPuerta` según la fecha en zona horaria Argentina).
- **Alternativas consideradas:** Introducir patrones `Strategy` (para precios).
- **Decisión y trade-offs:** Conservamos un condicional simple para el precio (dos variantes estables). Crear jerarquías de clases ahora sumaría indirección y archivos sin beneficio concreto; recién tendría sentido migrar si aparecieran promociones combinables.

#### 3. Separar la documentación técnica y unificar verificaciones locales (`pnpm check`)

- **Código analizado:** [README.md](../README.md), [api.md](./api.md) y [package.json](../package.json).
- **Contexto:** Al sumar reglas de negocio en las tres entidades, concentrar todos los endpoints y comportamientos en `README.md` lo volvía difícil de recorrer. Además, validar lint, tipos y tests con comandos separados aumentaba el riesgo de omisiones antes de cada Pull Request.
- **Alternativas consideradas:** Mantener un único `README.md` extenso y ejecutar comandos individuales vs separar la referencia de API y definir un comando compuesto.
- **Decisión y trade-offs:** Dejamos [README.md](../README.md) enfocado en puesta en marcha, entorno y comandos, moviendo el detalle de endpoints y reglas por módulo a [docs/api.md](./api.md). En [package.json](../package.json) definimos `"check": "pnpm format:check && pnpm typecheck && pnpm test"` con criterio _fail-fast_ para estandarizar la validación local y en CI.

---

### Clase 9 — Estrategia de Testing

#### 1. Pirámide de pruebas en el backend: unitarios aislados + integración HTTP real

- **Código analizado:** [tests/unit/](../tests/unit/) y [tests/integration/](../tests/integration/).
- **Contexto:** Las tres entidades poseen reglas de negocio con validaciones de fechas, unicidad, cupos y estados. Necesitábamos detectar regresiones rápido sin caer en falsa confianza por exceso de mocks.
- **Alternativas consideradas:**
  - _Solo tests unitarios con mocks:_ son rápidos, pero no validan el ruteo Express, la validación Zod (`validate`), los códigos HTTP ni el `errorHandler`.
  - _Solo tests de integración HTTP:_ cubren el recorrido real, pero resultan más pesados para probar combinaciones de borde y aislar fallas.
  - _Combinar ambos niveles según el riesgo:_ unitarios para lógica de dominio y bordes; integración HTTP para contratos y colaboración entre capas.
- **Decisión y trade-offs:** Combinamos ambos niveles con Vitest y Supertest:
  - **Unitarios (`tests/unit/`):** prueban `EventoService`, `EspectadorService`, `TicketService` y `EventoRepository` aislando dependencias externas con dobles (`vi.fn()`) y controlando el tiempo mediante `vi.useFakeTimers()` o inyección de reloj (`now` en `EventoService`) para cumplir **FIRST** (pruebas rápidas, independientes y repetibles).
  - **Integración (`tests/integration/`):** levantan `new App()` con `Supertest` sobre los repositorios reales en memoria (sin mockear repositorios), verificando contratos JSON, validaciones de esquemas, códigos `400/404/409` y colaboración real entre módulos.

#### 2. Por qué no implementamos tests E2E en el backend y sí en el frontend

- **Contexto:** Para completar la pirámide de testing evaluamos si convenía agregar pruebas End-to-End con Playwright dentro de este repositorio backend o en el repositorio frontend (`proyecto-final-tup-frontend`).
- **Alternativas consideradas:**
  - _Agregar Playwright en el backend para realizar llamadas HTTP:_ exige sumar una dependencia pesada y mantener un segundo runner junto a Vitest.
  - _Implementar el flujo crítico E2E en el frontend con Playwright contra el backend real:_ ejercita el sistema completo desde el navegador.
- **Decisión y trade-offs:** **No agregar tests E2E en el backend y ubicar el flujo crítico E2E en el frontend.** En una API REST sin interfaz gráfica y con persistencia en memoria, la suite `tests/integration/` con `Supertest` ya recorre de punta a punta toda la pila del backend (`Router -> validate -> Controller -> Service -> Repositories -> errorHandler`); sumar E2E solo en el backend duplicaría esas verificaciones con mayor costo y lentitud. En cambio, ejecutar un flujo crítico E2E desde el frontend valida el sistema completo (`UI -> red/CORS -> API real -> renderizado`), atrapando problemas de integración entre ambos repositorios que ningún test aislado detectaría. Como trade-off, requiere levantar frontend y backend juntos y controlar los datos de prueba (por ejemplo, usar eventos con fecha futura).

---

### Clase 10 — Calidad del código e Integración Continua

#### 1. Análisis estático unificado con Biome, TypeScript estricto y Husky

- **Código analizado:** [biome.json](../biome.json), [tsconfig.json](../tsconfig.json) y [.husky/pre-commit](../.husky/pre-commit).
- **Contexto:** Al trabajar tres integrantes en paralelo, las diferencias de formato, imports desordenados o variables sin uso generaban ruido en los diffs y fallas evitables.
- **Alternativas consideradas:** Configurar ESLint y Prettier por separado vs adoptar Biome como linter, formatter y organizador de imports en una sola herramienta.
- **Decisión y trade-offs:** Usamos **Biome 2.x** junto con TypeScript (`"strict": true`) y un hook `pre-commit` de **Husky** que corre `biome check --staged`. Reduce configuración y estandariza el estilo en todo el equipo. Como limitación conocida, el análisis estático no demuestra que una regla de negocio sea correcta, por lo que se complementa siempre con los tests automatizados.

#### 2. Integración Continua con GitHub Actions reutilizando los mismos scripts locales

- **Código analizado:** [.github/workflows/ci.yml](../.github/workflows/ci.yml), [package.json](../package.json) y [.nvmrc](../.nvmrc).
- **Contexto:** Las verificaciones locales dependen de cada integrante y pueden omitirse (por ejemplo, durante el desarrollo se llegaron a integrar PRs con diferencias de formato y un ajuste de `tsconfig.json` incompatible con TypeScript `5.9.3`, lo cual fue detectado al ejecutar `pnpm check` y en CI).
- **Alternativas consideradas:** Depender únicamente de verificaciones manuales locales vs ejecutar las mismas validaciones automáticamente en cada `push` y `pull_request`.
- **Decisión y trade-offs:** Incorporamos [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) para las ramas `main` y `dev`. El workflow fija Node desde [`.nvmrc`](../.nvmrc), instala exacto con `pnpm install --frozen-lockfile` y ejecuta `pnpm check` (que utiliza `biome ci .` en modo solo lectura sin modificar archivos) seguido de `pnpm build`. Como trade-off, un check fallido en GitHub Actions solo _informa_ el problema en el PR; para bloquear merges automáticamente se requiere habilitar reglas de protección de rama (_branch protection_). No se implementa despliegue continuo (CD) por estar fuera del alcance del proyecto actual.
