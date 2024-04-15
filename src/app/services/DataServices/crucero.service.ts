import { Injectable } from '@angular/core';
import { UserPreferencesService } from '../user-preferences.service';

@Injectable({
  providedIn: 'root'
})
export class CruceroService {

  private active_cruceros: Crucero[];
  constructor(private storage: UserPreferencesService) { }
 
  getCruceros() {
    return this.active_cruceros;
  }
  getCrucero(sessionid : any) {
    return this.active_cruceros.find((cru: Crucero) => {
      return cru.SessionId === sessionid; 
       });
    }  
  setActualCrucero(cru : Crucero) {
        this.storage.setElement("crucero",cru);
  }
}


export interface Crucero {
    SessionId : string,
    ItinerarioCode: string,
    MonedaMercado: string,
    Mercado: string,
    Company: string,
    ShipCode: string,
    Nnoches: string,
    SalidaCode: string,
    PuertoSalidaCode: string,
    Saildate: string,
    Metacategoria: string,
    DestinoCode: string,
    PriceProgramId: string,
    CantPasajeros: string,
    ListaPasajeros:Pasajero[],
    CategoriaCabina: string,
    TransactionCode: string,
    PackageId: string,
    NoCabina: string
  };

  export interface Pasajero {
    titulo: string,
    codigoPromocional: string,
    LoyaltyNumber: string,
    nombre:string,
    apellido: string,
    fechaNacimiento: string,
    tipoDocumento: string,
    numeroDocumento: string,
    nacionalidad:string,
    correo: string,
    edad: string,
    telefono: string
  };