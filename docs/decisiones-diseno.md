## Decisiones de Diseño CircuitoVivo

A continuacion explicaremos nuestro analisis y distintas decisiones acerca de Patrones de Diseño, Clean Code, code smells, refactoring y SOLID dentro del proyecto.

### Clase 4 Patrones Creacionales

#### Codigo analizado: [Repositories](../src/repositories), [Controllers](../src/controllers), [Routes](../src/routes)

#### Diagnostico:

Actualmente existe una cadena de dependencia a la hora de instanciar los objetos, donde `Route` debe conocer como se instancia el `Controller`, y este, como se instancia el `Repository`.

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

Analizando las relaciones y comunicaciones entre los distintos módulos del sistema, llegamos a la conclusion de que actualmente no existe mayor acoplamiento estructural o incompatibilidad de interfaces que requieran envolver o adaptar las llamadas.Consideramos que actualmente el flujo en CircuitoVivo es directo: las rutas delegan en los controladores y estos interactúan con los servicios/repositorios.

#### Alternativas y sus trade-offs

- **_Adapter_** : Lo evaluamos para el caso de integraciones con APIs o SDKs externos con interfaces incompatibles. Como en CircuitoVivo actualmente no consumimos ningún servicio de terceros que hable un "idioma" distinto o tenga un contrato incompatible con nuestro sistema, agregar un Adapter seria complejidad extra sin ningun beneficio real.

- **_Decorator_** : Pensamos en este patrón para extender el comportamiento de algún módulo envolviéndolo (por ejemplo, para agregar un logger, métricas o reintentos). Sin embargo, actualmente nuestros módulos no necesitan agregar responsabilidades adicionales sobre las clases base. Implementarlo ahora solo haría más complejo el seguimiento del flujo de ejecución del código.

- **_Facade_** : Al evaluarlo nos generó una duda inicial por su similitud con lo que resolvimos con `ControllerFactory`, ya que tambien buscamos abstraer la complejidad para las rutas. Sin embargo, entendemos que la Factory resuelve la creación (mas adecuado para este caso), mientras que Facade abstrae operaciones de negocio complejas de un modulo. Actualmente al no tener ningun servicio complejo compuesto por múltiples pasos, agregar una Facade sería crear un envoltorio vacío.

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
3. Existe una regla de negocio dentro de un repository (ver Code Smells).

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
  - **_DIP_**: Actualmente las rutas instancian directamente los controllers y el repository. La Factory (`ControllerFactory`) permitiria que el nivel alto dependa de abstracciones. Por otro lado, los controllers dependen de la clase concreta del repository (`repo: EventoRepository`), cuando deberian depender del contrato de las interfaces (`IEventoRepository`, etc.).
  - **_ISP_**: Consideramos cumplirlo al declarar interfaces (`ITicketRepository`, `IEspectadorRepository`) pequeñas y bien definidas, siendo correctamente cumplidos por las clases.
  - **_OCP, LSP_**: por ahora no encontramos evidencia real comparable en nuestro codigo.

#### Caso principal: manejo de errores en los controllers

#### Codigo analizado

Los tres controllers ([TicketController](../src/controllers/EspectadorController.ts), [EspectadorController](../src/controllers/EspectadorController.ts), [EventoController](../src/config/EventoController.ts)). Y [errorHandler](../src/middlewares/errorHandler.ts) global.

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
