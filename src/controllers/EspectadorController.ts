import type { NextFunction, Request, Response } from 'express';
import type { EspectadoresFilterParams } from '../schemas/espectador.schema';
import type { IEspectadorService } from '../services/interfaces/IEspectadorService';
import { errorResponse, successResponse } from '../utils/response';

export class EspectadorController {
  constructor(private readonly service: IEspectadorService) {}

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const filters = req.query as unknown as EspectadoresFilterParams;
      const espectadores = await this.service.findAll(filters);
      return successResponse(res, 'Espectadores encontrados', 200, espectadores);
    } catch (error) {
      next(error);
    }
  };

  findByID = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const id = Number(req.params.id);
      const espectadores = await this.service.findByID(id);
      if (!espectadores) {
        return errorResponse(res, 'Espectador no encontrado', 404);
      }
      return successResponse(res, 'Espectador encontrado', 200, espectadores);
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const EspectadorData = req.body;
      const NuevoEspectador = await this.service.registrar(EspectadorData);
      return successResponse(res, 'Espectador creado', 201, NuevoEspectador);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const id = Number(req.params.id);
      const espectadorData = req.body;
      const espectador = await this.service.editarUsuario(id, espectadorData);
      if (!espectador) {
        return errorResponse(res, 'Espectador no encontrado', 404);
      }
      return successResponse(res, 'Espectador actualizado', 200, espectador);
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const id = Number(req.params.id);
      const espectador = await this.service.eliminarUsuario(id);
      if (!espectador) {
        return errorResponse(res, 'Espectador no encontrado', 404);
      }
      return successResponse(res, 'Espectador eliminado', 200, espectador);
    } catch (error) {
      next(error);
    }
  };

  darDeBaja = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const espectador = await this.service.darDeBaja(Number(req.params.id));
      res.status(200).json({ msg: 'Espectador dado de baja', code: 200, data: espectador });
    } catch (error) {
      next(error);
    }
  };

  reactivar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const espectador = await this.service.reactivar(Number(req.params.id));
      res.status(200).json({ msg: 'Espectador reactivado', code: 200, data: espectador });
    } catch (error) {
      next(error);
    }
  };
}
