import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { AdminUsersService } from '../admin-users.service';
import { UserPreferencesService } from '../user-preferences.service';

@Injectable({
  providedIn: 'root'
})
export class AgenciaService {

  private active_agencias: Agencia[] = [];
  dataSubscription: Subscription;
  messageValidate: any
  constructor(private storage: UserPreferencesService, private adminService: AdminUsersService) { }

  ngOnInit() {
    this.active_agencias = new Array<Agencia>();  
    console.log("pase por aqui primero")
    this.updateStorage();
  }

  getAgencias() {
    this.updatefromStorage();
    return this.active_agencias;
  }

  getAgencia(sessionid: any) {
    return this.active_agencias.find((age: Agencia) => {
      return age.SessionId === sessionid;
    });
  }

  getAgenciabyurl(url: any):Agencia {
    this.updatefromStorage();
    var nueva = <Agencia>{};
    for (let i = 0; i < this.active_agencias.length; i++) {
      if(this.active_agencias[i].urlConexion === url){
        nueva = this.active_agencias[i]
      }
    }
    return nueva;
  }

  SignIn(urlConexion: string, queryparams: any[]): string {

    let errorMessage = '';
    var singFilter =
    {
      urlConexion: urlConexion,
      queryparams: queryparams
    };
    const sources = [
      this.adminService.SignIn(singFilter),
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(([response]: any[]) => {
        this.createAgencia(urlConexion,response)
      },
        (error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
          } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
          if (Object.keys(error.error).length != 0 && typeof (error.error) === 'string') {
            errorMessage = `Error Code: ${error.error}`;

          } else {
            if (error.error.value && typeof (error.error) === 'object') {
              errorMessage = `Error Code: ${error.error.value}`;
            } else {
              if (error.status == 400) {
                errorMessage = `Error: ${this.messageValidate.err_400Controlado}`;
              }
              if (error.status == 404) {
                errorMessage = `Error: ${this.messageValidate.err_404PaginaNoEncontrada}`;
              }
              if (error.status == 500) {
                errorMessage = `Error: ${this.messageValidate.err_500NoControlado}`;
              }
            }
          }
        });
    return errorMessage;
  }

  createAgencia(urlConexion: string,signData: any[]): Agencia {
    var newAge: Agencia = <Agencia>{}; 
    for (let i = 0; i < signData.length; i++) {
      newAge.urlConexion = urlConexion;
      var element = signData[i];
      if (element.key .indexOf("CultureInfo") >= 0) {
        newAge.CultureInfo = element.value;
      }
      if (element.key.indexOf("AgenciaIDPais") >= 0) {
        newAge.AgenciaIDPais = element.value;
      }
      if (element.key.indexOf("UrlRelativaPageError") >= 0) {
        newAge.UrlRelativaPageError = element.value;
      }
      if (element.key.indexOf("AgenciaNombrePais") >= 0) {
        newAge.AgenciaNombrePais = element.value;
      }

      if (element.key.indexOf("TelefonoCallCenter") >= 0) {
        newAge.TelefonoCallCenter = element.value;
      }

      if (element.key.indexOf("MostrarCallCenter") >= 0) {
        newAge.MostrarCallCenter = element.value;
      }

      if (element.key.indexOf("IconsCallCenter") >= 0) {
        newAge.IconsCallCenter = element.value;
      }

      if (element.key.indexOf("MostrarENnews") >= 0) {
        newAge.MostrarENnews = element.value;
      }

      if (element.key.indexOf("TerminosCondiciones") >= 0) {
        if (!element.value) {
          element.value = "";
        }
        newAge.TerminosCondiciones = element.value;
      }
      if (element.key.indexOf("MostrarAgenteViajes") >= 0) {
        newAge.MostrarAgenteViajes = element.value;
      }
      if (element.key.indexOf("MostrarTipoCambio") >= 0) {
        newAge.MostrarTipoCambio = element.value;
      }
      if (element.key.indexOf("MostrarPropinas") >= 0) {
        newAge.MostrarPropinas = element.value;
      }
      if (element.key.indexOf("AgenciaMoneda") >= 0) {
        newAge.AgenciaMoneda = element.value;
      }
      if (element.key.indexOf("MostraOpcionVuelo") >= 0) {
        newAge.MostraOpcionVuelo = element.value;
      }
      if (element.key.indexOf("CuentaAnalytics_ag") >= 0) {
        newAge.CuentaAnalytics_ag = element.value;
      }
      if (element.key.indexOf("CuentaAnalyticsInternna_ag") >= 0) {
        newAge.CuentaAnalyticsInterna_ag = element.value;
      }
      if (element.key.indexOf("CuentaAnalytics_di") >= 0) {
        newAge.CuentaAnalytics_di = element.value;
      }
      if (element.key.indexOf("CuentaAnalyticsInterna_di") >= 0) {
        newAge.CuentaAnalyticsInterna_di = element.value;
      }
    }   
    this.setAgencia(newAge);
    return newAge
  }

  setAgencia(age: Agencia) {
    if (!this.active_agencias || typeof this.active_agencias === 'undefined' ) {
      this.active_agencias = new Array<Agencia>();
    }
    this.active_agencias.push(age)
    this.updateStorage();
  }

  updateStorage() {
    this.storage.setElement("naveo_active_sessions", this.active_agencias);
    this.active_agencias = this.storage.getElement("naveo_active_sessions");
  }
  updatefromStorage() {
    this.active_agencias = this.storage.getElement("naveo_active_sessions");
    if (!this.active_agencias || typeof this.active_agencias === 'undefined' ) {
      this.active_agencias = new Array<Agencia>();
    }
  }

  validationLocale() {
    this.adminService.GetScreenValidationLocale().subscribe(next => {
      this.messageValidate = next
    })
  }
  getAnalyticsIdsArray(aged: Agencia):string[] {
    var result = [];
    result.push(aged.CuentaAnalytics_ag,aged.CuentaAnalyticsInterna_ag,aged.CuentaAnalytics_di,aged.CuentaAnalyticsInterna_di);
    return result;
  }
}
export interface Agencia {
  MostrarTipoCambio: any;
  urlConexion: string;
  SessionId: string,
  AgenciaIDPais: string,
  UrlRelativaPageError: string,
  CultureInfo: string,
  AgenciaNombrePais: string,
  TelefonoCallCenter: string,
  MostrarCallCenter: string
  IconsCallCenter: string,
  TerminosCondiciones: string,
  MostrarENnews: string,
  MostrarAgenteViajes: string,
  MostrarPropinas: string,
  AgenciaMoneda: string,
  MostraOpcionVuelo: string,
  CuentaAnalytics_ag: string,
  CuentaAnalyticsInterna_ag: string,
  CuentaAnalytics_di: string,
  CuentaAnalyticsInterna_di: string,
};