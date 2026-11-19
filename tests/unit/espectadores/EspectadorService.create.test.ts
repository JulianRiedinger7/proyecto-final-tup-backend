import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Espectadores } from '../../../src/models/Espectadores';
import type { IEspectadorRepository } from '../../../src/repositories/interfaces/IEspectadorRepository';
import { EspectadorService} from '../../../src/services/EspectadorService';
import { EspectadorEmailRepeatedError, EspectadorIdRepeatedError } from '../../../src/errors/EspectadorError';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';

const espectador: Espectadores = {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '25083569',
    email: 'juanperez@hotmail.com',
    isActive: true,
    telefono: '2915680245',
    createdAt: new Date(),
};

describe('Servicios de usuarios: creación de un usuario', () =>{
      let servicio: EspectadorService;
      let repositorioEspectador: IEspectadorRepository;
      let repositorioTicket: ITicketRepository;

      beforeEach(() => {
          repositorioEspectador = {
            findAll: vi.fn(),
            findByID: vi.fn().mockResolvedValue(espectador),
            findByDNI: vi.fn(),
            findByEmail: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            changeIsActive: vi.fn(),
            delete: vi.fn(),
          };

          repositorioTicket = {
        existsByEspectadorAndEstados: vi.fn().mockResolvedValue(false),
        } as unknown as ITicketRepository;

      
          servicio = new EspectadorService(repositorioEspectador, repositorioTicket);
        });
    
     afterEach(() => {vi.useRealTimers();});

     it ('crea un espectador', async () => {
        await servicio.create(espectador);

        expect (repositorioEspectador.create).toHaveBeenCalledWith({
            id: espectador.id,
            nombre: espectador.nombre,
            apellido: espectador.apellido,
            dni: espectador.dni,
            email: espectador.email,
            isActive: espectador.isActive,
            telefono: espectador.telefono,
            createdAt: espectador.createdAt,
        });
     });

    it('no crea un espectador si el dni ya existe', async () => {
        vi.mocked(repositorioEspectador.findByDNI).mockResolvedValue(espectador);
        await expect(servicio.create(espectador)).rejects.toThrow(EspectadorIdRepeatedError);

    expect(repositorioEspectador.findByDNI).toHaveBeenCalledWith(espectador.dni);
    expect(repositorioEspectador.create).not.toHaveBeenCalled();
    });

    it ('no crea un espectador con email repetido', async ()=> {
        vi.mocked(repositorioEspectador.findByEmail).mockResolvedValue(espectador);
        await expect(servicio.create(espectador)).rejects.toThrow(EspectadorEmailRepeatedError);

        expect(repositorioEspectador.findByEmail).toHaveBeenCalledWith(espectador.email);
        expect(repositorioEspectador.create).not.toHaveBeenCalled();
    });
})