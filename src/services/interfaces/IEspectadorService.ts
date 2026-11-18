import type { Espectadores } from "../../models/Espectadores";
import type { NewEspectador, PatchEspectador } from "../../schemas/espectador.schema";


export interface IEspectadorService {
  registrar(datos: NewEspectador): Promise<Espectadores>;
  editarUsuario(id: number, datos: PatchEspectador): Promise<Espectadores | undefined>;
  darDeBaja(id: number): Promise<Espectadores | undefined>;
  reactivar(id: number): Promise<Espectadores | undefined>;
}