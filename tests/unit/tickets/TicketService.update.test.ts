import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketInvalidTransitionError } from '../../../src/errors/TicketErrors';
import type { Espectadores } from '../../../src/models/Espectadores';
import type { Eventos } from '../../../src/models/Eventos';
import type { Ticket } from '../../../src/models/Ticket';
import type { IEspectadorRepository } from '../../../src/repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../../../src/repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';
import { TicketService } from '../../../src/services/TicketService';

const ticketReservado: Ticket = {
  id: 3,
  espectadorId: 2,
  eventoId: 1,
  codigoQr: 'ticket-qr',
  precioUnitario: 5000,
  estado: 'RESERVADO',
  createdAt: '2030-10-09T15:00:00.000Z',
  fechaValidacionPuerta: null,
};

const ticketConfirmado: Ticket = {
  ...ticketReservado,
  estado: 'CONFIRMADO',
};

const ticketUtilizado: Ticket = {
  ...ticketConfirmado,
  estado: 'UTILIZADO',
  fechaValidacionPuerta: '2030-10-10T20:00:00.000Z',
};

const ticketCancelado: Ticket = {
  ...ticketReservado,
  estado: 'CANCELADO',
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

describe('Servicio de tickets: actualización', () => {
  let servicio: TicketService;
  let repositorioTickets: ITicketRepository;
  let repositorioEventos: IEventoRepository;
  let repositorioEspectadores: IEspectadorRepository;

  beforeEach(() => {
    repositorioTickets = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(ticketReservado),
      countNonCancelledByEvento: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(ticketConfirmado),
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('confirma un ticket reservado', async () => {
    const resultado = await servicio.updateTicket(ticketReservado.id, {
      estado: 'CONFIRMADO',
    });

    expect(repositorioTickets.update).toHaveBeenCalledWith(ticketReservado.id, {
      estado: 'CONFIRMADO',
    });
    expect(resultado).toMatchObject({
      id: ticketConfirmado.id,
      codigoQr: ticketConfirmado.codigoQr,
      precioUnitario: ticketConfirmado.precioUnitario,
      estado: ticketConfirmado.estado,
      createdAt: ticketConfirmado.createdAt,
      fechaValidacionPuerta: ticketConfirmado.fechaValidacionPuerta,
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

  it('cancela un ticket reservado', async () => {
    await servicio.updateTicket(ticketReservado.id, {
      estado: 'CANCELADO',
    });

    expect(repositorioTickets.update).toHaveBeenCalledWith(ticketReservado.id, {
      estado: 'CANCELADO',
    });
  });

  it('marca como utilizado un ticket confirmado y registra la fecha de validación', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-10T20:00:00.000Z'));
    vi.mocked(repositorioTickets.findById).mockResolvedValueOnce(ticketConfirmado);

    await servicio.updateTicket(ticketConfirmado.id, {
      estado: 'UTILIZADO',
    });

    expect(repositorioTickets.update).toHaveBeenCalledWith(ticketConfirmado.id, {
      estado: 'UTILIZADO',
      fechaValidacionPuerta: '2030-10-10T20:00:00.000Z',
    });
  });

  it('actualiza la fecha de validación sin requerir un cambio de estado', async () => {
    const fechaValidacionPuerta = '2030-10-10T20:00:00.000Z';

    await servicio.updateTicket(ticketReservado.id, { fechaValidacionPuerta });

    expect(repositorioTickets.update).toHaveBeenCalledWith(ticketReservado.id, {
      fechaValidacionPuerta,
    });
  });

  it('cancela un ticket confirmado', async () => {
    vi.mocked(repositorioTickets.findById).mockResolvedValueOnce(ticketConfirmado);

    await servicio.updateTicket(ticketConfirmado.id, {
      estado: 'CANCELADO',
    });

    expect(repositorioTickets.update).toHaveBeenCalledWith(ticketConfirmado.id, {
      estado: 'CANCELADO',
    });
  });

  it('rechaza cambiar un ticket utilizado a confirmado', async () => {
    vi.mocked(repositorioTickets.findById).mockResolvedValueOnce(ticketUtilizado);

    await expect(
      servicio.updateTicket(ticketUtilizado.id, {
        estado: 'CONFIRMADO',
      }),
    ).rejects.toBeInstanceOf(TicketInvalidTransitionError);

    expect(repositorioTickets.update).not.toHaveBeenCalled();
  });

  it('rechaza cambiar un ticket cancelado a confirmado', async () => {
    vi.mocked(repositorioTickets.findById).mockResolvedValueOnce(ticketCancelado);

    await expect(
      servicio.updateTicket(ticketCancelado.id, {
        estado: 'CONFIRMADO',
      }),
    ).rejects.toBeInstanceOf(TicketInvalidTransitionError);

    expect(repositorioTickets.update).not.toHaveBeenCalled();
  });

  it('si no se encuentra el ticket, devuelve undefined', async () => {
    vi.mocked(repositorioTickets.findById).mockResolvedValueOnce(undefined);

    const resultado = await servicio.updateTicket(999, {
      estado: 'CONFIRMADO',
    });

    expect(resultado).toBeUndefined();
    expect(repositorioTickets.update).not.toHaveBeenCalled();
  });
});
