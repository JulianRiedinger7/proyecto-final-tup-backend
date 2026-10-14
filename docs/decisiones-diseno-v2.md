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
De esta forma, cada `Route` solo solicita a la `Factory` el Controller que necesita, quedando totalmente aislada de la construcción interna de las dependencias.
