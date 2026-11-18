import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Espectadores } from '../../../src/models/Espectadores';
import type { Eventos } from '../../../src/models/Eventos';
import type { Ticket } from '../../../src/models/Ticket';
import type { IEspectadorRepository } from '../../../src/repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../../../src/repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';
import type { TicketFilterParams } from '../../../src/schemas/ticket.schema';
import { TicketService } from '../../../src/services/TicketService';

const tickets: Ticket[] = [
  {
    id: 3,
    espectadorId: 2,
    eventoId: 1,
    codigoQr: 'ticket-qr',
    precioUnitario: 5000,
    estado: 'RESERVADO',
    createdAt: '2030-10-09T15:00:00.000Z',
    fechaValidacionPuerta: null,
  },
];

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

describe('Servicio de tickets: listado', () => {
  let servicio: TicketService;
  let repositorioTickets: ITicketRepository;
  let repositorioEventos: IEventoRepository;
  let repositorioEspectadores: IEspectadorRepository;

  beforeEach(() => {
    repositorioTickets = {
      findAll: vi.fn().mockResolvedValue({ items: tickets, total: tickets.length }),
      findById: vi.fn(),
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

  it('devuelve los tickets del repositorio aplicando los filtros recibidos', async () => {
    const filtros: TicketFilterParams = {
      estado: 'RESERVADO',
      eventoId: 1,
      page: 1,
      limit: 10,
    };

    const resultado = await servicio.listTickets(filtros);

    expect(repositorioTickets.findAll).toHaveBeenCalledWith(filtros);
    expect(repositorioEventos.findById).toHaveBeenCalledWith(tickets[0].eventoId);
    expect(repositorioEspectadores.findByID).toHaveBeenCalledWith(tickets[0].espectadorId);
    expect(resultado).toEqual({
      items: [
        {
          id: tickets[0].id,
          codigoQr: tickets[0].codigoQr,
          precioUnitario: tickets[0].precioUnitario,
          estado: tickets[0].estado,
          createdAt: tickets[0].createdAt,
          fechaValidacionPuerta: tickets[0].fechaValidacionPuerta,
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
        },
      ],
      total: tickets.length,
    });
  });
});
