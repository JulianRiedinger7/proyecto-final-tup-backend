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
