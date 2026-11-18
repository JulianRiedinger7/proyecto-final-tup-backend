export class EspectadorDependencyNotFoundError extends Error {
    readonly StatusCode = 404; 

    constructor(message: string) {
        super(message);
        this.name = 'EspectadorDependencyNotFoundError'; 
    }
}

export class EspectadorIdRepeatedError extends Error {
    readonly StatusCode = 409; 
    constructor (message: string) {
        super(message); 
        this.name = 'EspectadorIdRepeatedError'; 
    }
}

export class EspectadorEmailRepeatedError extends Error {
    readonly StatusCode=409; 
    constructor () {
        super('E-mail ya existente para otro usuario');
        this.name = 'EspectadorEmailRepeatedError';
    }
}

export class EspectadorStatusCannotDecline extends Error{
    readonly StatusCode = 409; 
    constructor () {
        super('No se puede dar de baja teniendo tickets RESERVADOS o CONFIRMADOS');
        this.name = 'EspectadorStatusCannotDecline';
    }
}

export class ExpectadorInactivoNoPuedeReservar extends Error {
    readonly StatusCode=409;
    constructor () {
        super('Un espectador inactivo no puede reservar');
        this.name = 'ExpectadorInactivoNoPuedeReservar'; 
    }
}