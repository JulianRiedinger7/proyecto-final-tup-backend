import { describe, expect, it } from 'vitest';
import { TicketRepository } from '../../../src/repositories/TicketRepository';

describe('Repositorio de tickets: listado', () => {
  it('devuelve el total de resultados filtrados antes de paginar', async () => {
    const repositorio = new TicketRepository();

    const resultado = await repositorio.findAll({ eventoId: 1, page: 2, limit: 2 });

    expect(resultado.total).toBe(6);
    expect(resultado.items.map((ticket) => ticket.id)).toEqual([3, 10]);
  });
});
