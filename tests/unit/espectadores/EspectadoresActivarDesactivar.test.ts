import type { Espectadores } from '../../../src/models/Espectadores';
import type { IEspectadorRepository } from '../../../src/repositories/interfaces/IEspectadorRepository';
import { EspectadorService} from '../../../src/services/EspectadorService';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

     it('dar de baja a un espectador, cambiar isActive = true a false', async ()=> {
       const inactivo = { ...espectador, isActive: false };
        vi.mocked(repositorioEspectador.changeIsActive).mockResolvedValue(inactivo);

        const resultado = await servicio.darDeBaja(espectador.id);

        expect(repositorioEspectador.findByID).toHaveBeenCalledWith(espectador.id);
        expect(repositorioTicket.existsByEspectadorAndEstados).toHaveBeenCalledWith(
            String(espectador.id),
            ['RESERVADO', 'CONFIRMADO'],
        );
        expect(repositorioEspectador.changeIsActive).toHaveBeenCalledWith(espectador.id);
        expect(repositorioEspectador.delete).not.toHaveBeenCalled(); 
        expect(resultado?.isActive).toBe(false);
     });


     it('no da de baja si tiene tickets RESERVADO o CONFIRMADO', async () => {
  vi.mocked(repositorioTicket.existsByEspectadorAndEstados).mockResolvedValue(true);

  await expect(servicio.darDeBaja(espectador.id))
    .rejects.toMatchObject({ name: 'EspectadorStatusCannotDecline' });

  expect(repositorioEspectador.changeIsActive).not.toHaveBeenCalled();
});

it('si ya está inactivo, lo devuelve sin cambios', async () => {
  const inactivo = { ...espectador, isActive: false };
  vi.mocked(repositorioEspectador.findByID).mockResolvedValue(inactivo);

  const resultado = await servicio.darDeBaja(espectador.id);

  expect(resultado).toEqual(inactivo);
  expect(repositorioTicket.existsByEspectadorAndEstados).not.toHaveBeenCalled();
  expect(repositorioEspectador.changeIsActive).not.toHaveBeenCalled();
});

it('lanza error si el espectador no existe', async () => {
  vi.mocked(repositorioEspectador.findByID).mockResolvedValue(undefined);

  await expect(servicio.darDeBaja(999))
    .rejects.toMatchObject({ name: 'EspectadorDependencyNotFoundError' });
});

it('reactiva a un espectador inactivo (isActive false -> true)', async () => {
  const inactivo = { ...espectador, isActive: false };
  const reactivado = { ...espectador, isActive: true };
  vi.mocked(repositorioEspectador.findByID).mockResolvedValue(inactivo);
  vi.mocked(repositorioEspectador.changeIsActive).mockResolvedValue(reactivado);

  const resultado = await servicio.reactivar(espectador.id);

  expect(repositorioEspectador.findByID).toHaveBeenCalledWith(espectador.id);
  expect(repositorioEspectador.changeIsActive).toHaveBeenCalledWith(espectador.id);
  expect(resultado?.isActive).toBe(true);
});

it('si ya está activo, lo devuelve sin cambios', async () => {
  const resultado = await servicio.reactivar(espectador.id);

  expect(resultado).toEqual(espectador);
  expect(repositorioEspectador.changeIsActive).not.toHaveBeenCalled();
});

it('lanza error si el espectador no existe', async () => {
  vi.mocked(repositorioEspectador.findByID).mockResolvedValue(undefined);

  await expect(servicio.reactivar(999))
    .rejects.toMatchObject({ name: 'EspectadorDependencyNotFoundError' });

  expect(repositorioEspectador.changeIsActive).not.toHaveBeenCalled();
});
});