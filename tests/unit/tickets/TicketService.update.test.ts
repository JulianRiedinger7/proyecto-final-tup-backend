import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketInvalidTransitionError } from '../../../src/errors/TicketErrors';
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

describe('Servicio de tickets: actualización', () => {
  let servicio: TicketService;
  let repositorioTickets: ITicketRepository;

  beforeEach(() => {
    repositorioTickets = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(ticketReservado),
      countNonCancelledByEvento: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(ticketConfirmado),
      delete: vi.fn(),
    };
    const repositorioEventos: IEventoRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      replace: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const repositorioEspectadores: IEspectadorRepository = {
      findAll: vi.fn(),
      findByID: vi.fn(),
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
    expect(resultado).toEqual(ticketConfirmado);
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
});
