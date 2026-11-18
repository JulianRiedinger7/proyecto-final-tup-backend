import { EspectadorDependencyNotFoundError, EspectadorIdRepeatedError, EspectadorEmailRepeatedError, EspectadorStatusCannotDecline, ExpectadorInactivoNoPuedeReservar } from "../errors/EspectadorError";
import type { EspectadoresSortBy, EspectadoresSortOrder } from "../models/Espectadores";
import type { EspectadoresFilterParams, NewEspectador, deleteEspectador, patchEspectador } from "../schemas/espectador.schema";
import { IEspectadorRepository } from "../repositories/interfaces/IEspectadorRepository";
import { TicketRepository } from "../repositories/TicketRepository";

export class EspectadorService {
  constructor(private repo: IEspectadorRepository) {}

  async registrar(datos: {nombre: string; apellido:string; email: string; dni: string; telefono: string }) {
    const DNIexistente = await this.repo.findByDNI(datos.dni);
    const emailExistente = await this.repo.findByEmail(datos.email); 

    if (DNIexistente) {
      throw new EspectadorIdRepeatedError("Ya existe un usuario con ese DNI");
    }
    if (emailExistente){
        throw new EspectadorEmailRepeatedError();
    }
    return this.repo.create(datos);
  }

 async editarUsuario(
  id: number,
  datos: Partial<{ nombre: string; apellido: string; email: string; dni: string; telefono: string }>
) {
  const espectador = await this.repo.findByID(id);
  if (!espectador) {
    throw new EspectadorDependencyNotFoundError("Espectador no encontrado");
  }

  if (datos.dni && datos.dni !== espectador.dni) {
    const dniExistente = await this.repo.findByDNI(datos.dni);
    if (dniExistente) {
      throw new EspectadorIdRepeatedError("Ya existe un usuario con ese DNI");
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
      throw new EspectadorDependencyNotFoundError("Espectador no encontrado");
    }

    const tieneTicketsActivos = await new TicketRepository().existsByEspectadorAndEstados(
      id.toString(),["RESERVADO", "CONFIRMADO"]);
   
      if (tieneTicketsActivos) {
      throw new EspectadorStatusCannotDecline();
    }

    return this.repo.delete(id); 
  }
}
}

