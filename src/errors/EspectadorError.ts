export class EspectadorDependencyNotFoundError extends Error {
  readonly statusCode = 404;

  constructor(message: string) {
    super(message);
    this.name = 'EspectadorDependencyNotFoundError';
  }
}

export class EspectadorIdRepeatedError extends Error {
  readonly statusCode = 409;

  constructor(message: string) {
    super(message);
    this.name = 'EspectadorIdRepeatedError';
  }
}

export class EspectadorEmailRepeatedError extends Error {
  readonly statusCode = 409;

  constructor() {
    super('Ya existe un usuario con esa dirección de e-mail');
    this.name = 'EspectadorEmailRepeatedError';
  }
}

export class EspectadorStatusCannotDecline extends Error {
  readonly statusCode = 409;

  constructor() {
    super('No se puede dar de baja un usuario que tiene tickets RESERVADOS o CONFIRMADOS');
    this.name = 'EspectadorStatusCannotDecline';
  }
}

export class ExpectadorInactivoNoPuedeReservar extends Error {
  readonly statusCode = 409;

  constructor() {
    super('Un espectador inactivo no puede reservar');
    this.name = 'ExpectadorInactivoNoPuedeReservar';
  }
}
