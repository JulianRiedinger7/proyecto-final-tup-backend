import {
  EspectadorDependencyNotFoundError,
  EspectadorEmailRepeatedError,
  EspectadorIdRepeatedError,
  EspectadorStatusCannotDecline,
} from '../errors/EspectadorError';
import type { Espectadores } from '../models/Espectadores';
import type { IEspectadorRepository } from '../repositories/interfaces/IEspectadorRepository';
import type { ITicketRepository } from '../repositories/interfaces/ITicketRepository';
import type { EspectadoresFilterParams } from '../schemas/espectador.schema';
import type { IEspectadorService } from './interfaces/IEspectadorService';


export class EspectadorService implements IEspectadorService {
  constructor(private repo: IEspectadorRepository, private ticketRepo: ITicketRepository) {}


 async create(datos: Espectadores) {
  const dniExistente = await this.repo.findByDNI(datos.dni);
  if (dniExistente) {
    throw new EspectadorIdRepeatedError("Ya existe un usuario con ese DNI");
  }

  const emailExistente = await this.repo.findByEmail(datos.email);
  if (emailExistente) {
    throw new EspectadorEmailRepeatedError();
  }

  return this.repo.create(datos);
}

  async findAll(params: EspectadoresFilterParams = {}): Promise<{
    items: Espectadores[];
    total: number;
  }> {
    return this.repo.findAll(params);
  }

  async findByID(id: number): Promise<Espectadores | undefined> {
    return this.repo.findByID(id);
  }

  async registrar(datos: {
    nombre: string;
    apellido: string;
    email: string;
    dni: string;
    telefono: string;
  }) {
    const DNIexistente = await this.repo.findByDNI(datos.dni);
    const emailExistente = await this.repo.findByEmail(datos.email);

    if (DNIexistente) {
      throw new EspectadorIdRepeatedError('Ya existe un usuario con ese DNI');
    }
    if (emailExistente) {
      throw new EspectadorEmailRepeatedError();
    }
    return this.repo.create(datos);
  }

  async editarUsuario(
    id: number,
    datos: Partial<{
      nombre: string;
      apellido: string;
      email: string;
      dni: string;
      telefono: string;
      isActive: boolean;
    }>,
  ) {
    const espectador = await this.repo.findByID(id);
    if (!espectador) {
      throw new EspectadorDependencyNotFoundError('Espectador no encontrado');
    }

    if (datos.dni && datos.dni !== espectador.dni) {
      const dniExistente = await this.repo.findByDNI(datos.dni);
      if (dniExistente) {
        throw new EspectadorIdRepeatedError('Ya existe un usuario con ese DNI');
      }
    }

    if (datos.email && datos.email !== espectador.email) {
      const emailExistente = await this.repo.findByEmail(datos.email);
      if (emailExistente) {
        throw new EspectadorEmailRepeatedError();
      }
    }

    return this.repo.update(id, datos);
  }

  async eliminarUsuario(id: number) {
    const espectador = await this.repo.findByID(id);
    if (!espectador) {
      throw new EspectadorDependencyNotFoundError('Espectador no encontrado');
    }

    const tieneTicketsActivos = await this.ticketRepo.existsByEspectadorAndEstados(
      espectador.id.toString(),
      ['RESERVADO', 'CONFIRMADO'],
    );

    if (tieneTicketsActivos) {
      throw new EspectadorStatusCannotDecline();
    }

    return this.repo.delete(id);
  }

  async reactivar(id: number) {
    const espectador = await this.repo.findByID(id);
    if (!espectador) {
      throw new EspectadorDependencyNotFoundError('Espectador no encontrado');
    }
    if (!espectador.isActive) {
      return this.repo.changeIsActive(id);
    } else {
      return espectador;
    }
  }

  async darDeBaja(id: number) {
    const espectador = await this.repo.findByID(id);
    if (!espectador) {
      throw new EspectadorDependencyNotFoundError('Espectador no encontrado');
    }

    if (!espectador.isActive) {
      return espectador;
    }

    const tieneTicketsActivos = await this.ticketRepo.existsByEspectadorAndEstados(
      id.toString(), 
      ['RESERVADO', 'CONFIRMADO'],
    );
    if (tieneTicketsActivos) throw new EspectadorStatusCannotDecline();

    return this.repo.changeIsActive(id);
  }
}
