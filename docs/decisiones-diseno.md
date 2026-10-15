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

#### Codigo analizado: [src/](../src/) (Controllers, Services, Repositories, Routes)

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

#### Codigo analizado: [src/](../src/) (Controllers, Services, Repositories, Routes)

#### Diagnostico:

Al analizar el comportamiento y la colaboración entre los distintos módulos del backend de **CircuitoVivo**, y al igual que como nos sucedio con los patrones estructurales, llegamos a la conclusion que aplica la misma teoria: `los patrones vienen despues del problema`.

Actualmente, el flujo de ejecución en nuestro sistema es directo. No detectamos un acoplamiento significativo en la interacción entre componentes ni una acumulación compleja de condicionales que justifique la introducción de clases adicionales.

#### Alternativas y sus trade-offs

- **_Observer_**: En el estado actual del sistema no contamos con ningun tipo de reaccion ante cambios (notificaciones, emails, metricas, etc), pero consideramos que a futuro este patron podria llegar a ser considerado en el modulo de **Eventos**. Por ejemplo, si necesitamos enviar notificaciones o correos, tanto a **Bandas como Espectadores (Consumidores)** cuando cambia el horario de un **Evento (Emisor)**. Sin embargo, introducir este tipo de infraestructura interna volvería menos evidente el flujo de ejecución y dificultaría la depuración.

- **_Strategy_**: Actualmente, las reglas de nuestro backend son sencillas. Resolverlas mediante condicionales no nos genera mayores problemas de mantenibilidad. A futuro, nos puede ocurrir que, por ejemplo, la logica de precios evolucione (entradas anticipadas/en puerta) con distintas reglar que aplicar. En ese momento, un patron **Strategy** nos permitiria aislar cada logica en su propia clase sin necesidad de condicionales complejos.

- **_Command_**: Analizamos su aplicación para encapsular solicitudes de reserva o compra de entradas como objetos manipulables. En la actualidad, las peticiones se procesan de forma inmediata en el ciclo de solicitud-respuesta HTTP. Crear objetos comando añadiría indirección y clases adicionales sin un motivo claro. **A futuro**, si surge la necesidad de diferir tareas en colas de trabajo, ejecutar reintentos automáticos (retries) o registrar un historial auditable de acciones, **Command** será la alternativa adecuada para desacoplar la ejecución de la solicitud.

- **_Command_**: En la actualidad, las peticiones se procesan de forma inmediata en el ciclo de solicitud y respuesta HTTP. Crear este tipo de objetos añadiría clases innecesarias. A futuro podemos analizar su aplicacion en el modulo de **Tickets** si surge la necesidad de representarlos como una accion manipulable, por ejemplo rehacer un ticket ante el fallo de un pago, esperar un pago o reimprimir ticket, **Command** seria la alternativa adecuada.

#### Decision:

**_Conservar el diseño actual (Sin patrones de comportamiento)_**: Como ocurrio con los patrones estructurales, consideramos que no debemos aplicar patrones antes de que surjan los problemas, ya que recaeriamos en sobreigenieria innecesaria. Sin embargo, tuvimos en consideracion posibles inconvenientes a futuro en el desarrollo del proyecto y en como estos Patrones de comportamiento podrian sernos de utilidad.

### Clase 7 Refactoring, Clean Code y SOLID

#### Codigo analizado: [src/](../src/) (Controllers, Services, Repositories, Routes)
