export const Espectadores_Sort_By=['id', 'nombre', 'apellido', 'dni'] as const;

export interface Espectadores {
    id: number; 
    nombre: string;
    apellido: string; 
    email: string;
    dni: number; 
    telefono: string;
    dateUsuario: Date;
    isactive: boolean; 
}

export type EspectadoresSortBy= (typeof Espectadores_Sort_By)[number];