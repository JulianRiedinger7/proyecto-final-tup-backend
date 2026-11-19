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

describe('Servicios de usuarios: editar usuario', () =>{
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


    it('Edición de espectador', async () => {
        const datos = { telefono: '2911111111' };
        const actualizado = { ...espectador, ...datos };
        vi.mocked(repositorioEspectador.update).mockResolvedValue(actualizado);

        const resultado = await servicio.editarUsuario(espectador.id, datos);

        expect(repositorioEspectador.findByID).toHaveBeenCalledWith(espectador.id);
        expect(repositorioEspectador.update).toHaveBeenCalledWith(espectador.id, datos);
        expect(resultado).toEqual(actualizado);
    });

    it('impide editar un usuario con un dni que ya pertenece a otro', async () => {
    const dniNuevo = '99999999';
    const otroEspectador = { ...espectador, id: 2, dni: dniNuevo };
    vi.mocked(repositorioEspectador.findByDNI).mockResolvedValue(otroEspectador);

    await expect(servicio.editarUsuario(espectador.id, { dni: dniNuevo }))
        .rejects.toThrow(EspectadorIdRepeatedError);

    expect(repositorioEspectador.findByDNI).toHaveBeenCalledWith(dniNuevo);
    expect(repositorioEspectador.update).not.toHaveBeenCalled();
    });

    it('impide editar un usaurio con un e-mail ya existente en otro espectador', async ()=> {
        const emailNuevo = 'JuanPerezModificado@hotmail.com';
        const otroEspectador = {...espectador, id: 2, email: emailNuevo};
        vi.mocked(repositorioEspectador.findByEmail).mockResolvedValue(otroEspectador);
        await expect(servicio.editarUsuario(espectador.id, {email: emailNuevo}))
            .rejects.toThrow(EspectadorEmailRepeatedError);
        expect(repositorioEspectador.findByEmail).toHaveBeenCalledWith(emailNuevo);
        expect(repositorioEspectador.update).not.toHaveBeenCalled();
    });
    });