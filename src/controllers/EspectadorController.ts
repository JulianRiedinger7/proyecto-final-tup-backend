import type { Request, Response } from 'express';
import type { EspectadorRepository } from '../repositories/EspectadoresRepository';
import type { EspectadoresFilterParams } from '../schemas/espectador.schema';
import { errorResponse, successResponse } from '../utils/response';

export class EspectadorController {
  constructor(private readonly repo: EspectadorRepository) {}

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const filters = req.query as unknown as EspectadoresFilterParams;
      const espectadores = await this.repo.findAll(filters);
      return successResponse(res, 'Espectadores encontrados', 200, espectadores);
    } catch (error) {
      console.error(`Error al buscar los espectadores: ${error}`);
      return errorResponse(res, 'Error al buscar los espectadores', 500);
    }
  };

  findByID = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Number(req.params.id);
      const espectadores = await this.repo.findByID(id);
      return successResponse(res, 'Espectador encontrado', 200, espectadores);
    } catch (error) {
      console.error('No se encontró al espectador', error);
      return errorResponse(res, 'Error al buscar a este espectaddor');
    }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const EspectadorData = req.body;
      const NuevoEspectador = await this.repo.create(EspectadorData);
      return successResponse(res, 'Espectador creado', 200, NuevoEspectador);
    } catch (error) {
      console.error('Error al crear el espectador', error);
      return errorResponse(res, 'Error al crear el espectador', 500);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Number(req.params.id);
      const espectadorData = req.body;
      const espectador = await this.repo.update(id, espectadorData);
      return successResponse(res, 'Espectador actualizado', 200, espectador);
    } catch (error) {
      console.error(`Error al actualizar el espectador: ${error}`);
      return errorResponse(res, 'Error al actualizar el espectador', 500);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Number(req.params.id);
      const _espectadorData = req.body;
      const espectador = await this.repo.delete(id);
      return successResponse(res, 'Espectador eliminado', 200, espectador);
    } catch (error) {
      console.error(`Error al borrar el espectador: ${error}`);
      return errorResponse(res, 'Error al borrar el espectador', 500);
    }
  };
}
