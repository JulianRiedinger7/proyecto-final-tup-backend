import type { Eventos, EventosSortOrder } from '../models/Eventos';
import type { EventoFilterParams } from '../schemas/evento.schema';

interface IEventoRepository {
  findAll(params?: EventoFilterParams): Promise<{ items: Eventos[]; total: number }>;
}

const DEFAULT_LIMIT = 10;

export class EventoRepository implements IEventoRepository {
  private eventos: Eventos[] = [
    {
      id: 1,
      titulo: 'Festival de Bandas Locales',
      descripcion: 'Una noche dedicada a la música de la escena local.',
      fechaHora: '2026-10-02T20:00:00.000Z',
      lugar: 'Anfiteatro Municipal',
      aforoMaximo: 500,
      cupoReservasWeb: 300,
      precioPreventa: 4000,
      precioPuerta: 4500,
    },
    {
      id: 2,
      titulo: 'Noche de Rock',
      descripcion: 'Presentación en vivo de bandas de rock de la ciudad.',
      fechaHora: '2026-10-03T21:00:00.000Z',
      lugar: 'Sala Cultural',
      aforoMaximo: 250,
      cupoReservasWeb: 150,
      precioPreventa: 5500,
      precioPuerta: 6000,
    },
    {
      id: 3,
      titulo: 'Acústico en el Centro',
      descripcion: 'Set acústico con artistas invitados.',
      fechaHora: '2026-10-04T19:30:00.000Z',
      lugar: 'Centro Cultural',
      aforoMaximo: 180,
      cupoReservasWeb: 100,
      precioPreventa: 4500,
      precioPuerta: 5000,
    },
    {
      id: 4,
      titulo: 'Encuentro de Música Independiente',
      descripcion: 'Festival de proyectos independientes y emergentes.',
      fechaHora: '2026-10-10T18:00:00.000Z',
      lugar: 'Anfiteatro Municipal',
      aforoMaximo: 600,
      cupoReservasWeb: 400,
      precioPreventa: 5000,
      precioPuerta: 6500,
    },
    {
      id: 5,
      titulo: 'Jazz bajo las Estrellas',
      descripcion: 'Concierto al aire libre con músicos invitados.',
      fechaHora: '2026-10-17T20:30:00.000Z',
      lugar: 'Plaza de la Música',
      aforoMaximo: 350,
      cupoReservasWeb: 200,
      precioPreventa: 6000,
      precioPuerta: 7000,
    },
  ];

  async findAll(params: EventoFilterParams = {}): Promise<{ items: Eventos[]; total: number }> {
    const { page = 1, limit = DEFAULT_LIMIT, sortOrder = 'asc', titulo, lugar } = params;
    const filtered = this.filterEventos(this.eventos, titulo, lugar);
    const sorted = this.sortEventos(filtered, sortOrder);
    const start = (page - 1) * limit;

    return {
      items: sorted.slice(start, start + limit),
      total: filtered.length,
    };
  }

  private filterEventos(eventos: Eventos[], titulo?: string, lugar?: string): Eventos[] {
    const tituloTerm = titulo?.toLocaleLowerCase();
    const lugarTerm = lugar?.toLocaleLowerCase();

    return eventos.filter((evento) => {
      const matchesTitulo = !tituloTerm || evento.titulo.toLocaleLowerCase().includes(tituloTerm);
      const matchesLugar = !lugarTerm || evento.lugar.toLocaleLowerCase().includes(lugarTerm);
      return matchesTitulo && matchesLugar;
    });
  }

  private sortEventos(eventos: Eventos[], sortOrder: EventosSortOrder): Eventos[] {
    const direction = sortOrder === 'asc' ? 1 : -1;
    return [...eventos].sort(
      (eventoA, eventoB) =>
        (Date.parse(eventoA.fechaHora) - Date.parse(eventoB.fechaHora)) * direction,
    );
  }
}
