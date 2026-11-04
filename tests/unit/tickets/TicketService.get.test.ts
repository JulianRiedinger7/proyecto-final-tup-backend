import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Espectadores } from '../../../src/models/Espectadores';
import type { Eventos } from '../../../src/models/Eventos';
import type { Ticket } from '../../../src/models/Ticket';
import type { IEspectadorRepository } from '../../../src/repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../../../src/repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';
import { TicketService } from '../../../src/services/TicketService';

const ticket: Ticket = {
  id: 3,
  espectadorId: 2,
  eventoId: 1,
  codigoQr: 'ticket-qr',
  precioUnitario: 5000,
  estado: 'RESERVADO',
  createdAt: '2030-10-09T15:00:00.000Z',
  fechaValidacionPuerta: null,
};

const evento: Eventos = {
  id: 1,
  titulo: 'Evento de prueba',
  descripcion: 'Descripción',
  fechaHora: '2030-10-10T18:00:00.000Z',
  lugar: 'Sala de prueba',
  aforoMaximo: 100,
  cupoReservasWeb: 50,
  precioPreventa: 4000,
  precioPuerta: 5000,
};

const espectador: Espectadores = {
  id: 2,
  nombre: 'Ana',
  apellido: 'Pérez',
  email: 'ana@example.com',
  dni: '12345678',
  telefono: '1112345678',
  createdAt: new Date('2030-01-01T00:00:00.000Z'),
  isActive: true,
};

describe('Servicio de tickets: consulta por ID', () => {
  let servicio: TicketService;
  let repositorioTickets: ITicketRepository;
  let repositorioEventos: IEventoRepository;
  let repositorioEspectadores: IEspectadorRepository;

  beforeEach(() => {
    repositorioTickets = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(ticket),
      countNonCancelledByEvento: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    repositorioEventos = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(evento),
      create: vi.fn(),
      replace: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    repositorioEspectadores = {
      findAll: vi.fn(),
      findByID: vi.fn().mockResolvedValue(espectador),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    servicio = new TicketService(repositorioTickets, repositorioEventos, repositorioEspectadores);
  });

  it('devuelve el ticket encontrado por su ID', async () => {
    const resultado = await servicio.getTicket(ticket.id);

    expect(repositorioTickets.findById).toHaveBeenCalledWith(ticket.id);
    expect(repositorioEventos.findById).toHaveBeenCalledWith(ticket.eventoId);
    expect(repositorioEspectadores.findByID).toHaveBeenCalledWith(ticket.espectadorId);
    expect(resultado).toEqual({
      id: ticket.id,
      codigoQr: ticket.codigoQr,
      precioUnitario: ticket.precioUnitario,
      estado: ticket.estado,
      createdAt: ticket.createdAt,
      fechaValidacionPuerta: ticket.fechaValidacionPuerta,
      evento: {
        id: evento.id,
        titulo: evento.titulo,
        fechaHora: evento.fechaHora,
        lugar: evento.lugar,
      },
      espectador: {
        id: espectador.id,
        nombre: espectador.nombre,
        apellido: espectador.apellido,
      },
    });
  });

  it('devuelve undefined cuando el ticket no existe', async () => {
    vi.mocked(repositorioTickets.findById).mockResolvedValueOnce(undefined);

    const resultado = await servicio.getTicket(999);

    expect(repositorioTickets.findById).toHaveBeenCalledWith(999);
    expect(resultado).toBeUndefined();
  });
});
