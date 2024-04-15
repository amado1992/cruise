import { Pasajero } from "./Pasajero.model";

export interface Reservacion {
  idItinerario: string;
  idSalida: string;
  idCategoriaHabitacion: string;
  pasajeros: Pasajero[];
  movilidadEspecial: boolean;
  clubFidelizacion: boolean;
  idTarifa: string;
  idCategoriaVista: string;
  mode: string;
}
