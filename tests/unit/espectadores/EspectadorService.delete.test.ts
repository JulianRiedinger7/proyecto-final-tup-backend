
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Espectadores } from '../../../src/models/Espectadores';
import type { IEspectadorRepository } from '../../../src/repositories/interfaces/IEspectadorRepository';
import { EspectadorService} from '../../../src/services/EspectadorService';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';
// import { EspectadorEmailRepeatedError, EspectadorIdRepeatedError } from '../../../src/errors/EspectadorError';

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

describe('Servicios de usuarios: eliminación', () => {
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

    it ('eliminación de un usuario', async () => {
        vi.mocked(repositorioEspectador.delete).mockResolvedValue(espectador);

        const resultado = await servicio.eliminarUsuario(espectador.id);

        expect(repositorioEspectador.findByID).toHaveBeenCalledWith(espectador.id);
        expect(repositorioEspectador.delete).toHaveBeenCalledWith(espectador.id);
        expect(resultado).toEqual(espectador);
    });
    });

