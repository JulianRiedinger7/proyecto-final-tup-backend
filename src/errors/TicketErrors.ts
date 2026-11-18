export class TicketDependencyNotFoundError extends Error {
  readonly statusCode = 404;

  constructor(message: string) {
    super(message);
    this.name = 'TicketDependencyNotFoundError';
  }
}

export class TicketEventStartedError extends Error {
  readonly statusCode = 409;

  constructor() {
    super('No se pueden emitir tickets para un evento que ya comenzó');
    this.name = 'TicketEventStartedError';
  }
}

export class TicketCapacityExceededError extends Error {
  readonly statusCode = 409;

  constructor() {
    super('Se alcanzó el cupo de reservas web para este evento');
    this.name = 'TicketCapacityExceededError';
  }
}

export class TicketInvalidTransitionError extends Error {
  readonly statusCode = 409;

  constructor(currentState: string, requestedState: string) {
    super(`No se puede cambiar el estado del ticket de ${currentState} a ${requestedState}`);
    this.name = 'TicketInvalidTransitionError';
  }
}
