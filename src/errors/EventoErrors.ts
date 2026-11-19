export class EventoFechaHoraNoFuturaError extends Error {
  readonly statusCode = 400;

  constructor() {
    super('La fecha y hora del evento debe ser futura');
    this.name = 'EventoFechaHoraNoFuturaError';
  }
}

export class EventoPrecioPuertaInferiorError extends Error {
  readonly statusCode = 400;

  constructor() {
    super('El precio de puerta no puede ser menor al precio de preventa');
    this.name = 'EventoPrecioPuertaInferiorError';
  }
}

export class EventoCupoMenorATicketsError extends Error {
  readonly statusCode = 409;

  constructor() {
    super('No se puede reducir el cupo por debajo de los tickets no cancelados');
    this.name = 'EventoCupoMenorATicketsError';
  }
}

export class EventoHorarioDuplicadoError extends Error {
  readonly statusCode = 409;

  constructor() {
    super('Ya existe un evento en el mismo lugar y fecha');
    this.name = 'EventoHorarioDuplicadoError';
  }
}

export class EventoRealizadoError extends Error {
  readonly statusCode = 409;

  constructor() {
    super('No se puede modificar un evento que ya comenzó');
    this.name = 'EventoRealizadoError';
  }
}

export class EventoConTicketsActivosError extends Error {
  readonly statusCode = 409;

  constructor() {
    super('No se puede eliminar un evento con tickets no cancelados');
    this.name = 'EventoConTicketsActivosError';
  }
}
