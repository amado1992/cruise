import { Injectable } from '@angular/core';
import { Pasajero } from "../../models/Pasajero.model";

@Injectable({
  providedIn: 'root'
})
export class PasajeroDataService {

  pasajeros: Pasajero[];
  pasajerosLenght: Number = 1;
  constructor() { }
}
