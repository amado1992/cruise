import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { UserPreferencesService } from './user-preferences.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {

  usersReloadRequired = new Subject<any>();

  constructor(private http: HttpClient, private userPreferencesService: UserPreferencesService) { }

  getFiltersCombos(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetFullSearchData), filter);
  }

  ItineraryCount(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.ItineraryCount), filter);
  }

  SignIn(filter: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      withCredentials: false // this is required so that Angular returns the Cookies received from the server. 
      // The server sends cookies in Set-Cookie header. Without this, Angular will ignore the Set-Cookie header
    };
    return this.http.post(environment.urls.SignIn, filter);
  }

  GetScreenSearchLocale(): Observable<any> {
    const requestparams = new HttpParams()
      .set('ui-culture', this.userPreferencesService.getUserLanguage());
    return this.http.get(environment.urls.GetScreenSearchLocale, { params: requestparams });
  }

  GetScreenBarcoItinerarioLocale(): Observable<any> {
    const requestparams = new HttpParams()
      .set('ui-culture', this.userPreferencesService.getUserLanguage());
    return this.http.get(environment.urls.GetScreenBarcoItinerarioLocale, { params: requestparams });
  }

  GetScreenPaxSelectionLocale(): Observable<any> {
    const requestparams = new HttpParams()
      .set('ui-culture', this.userPreferencesService.getUserLanguage());
    return this.http.get(environment.urls.GetScreenPaxSelectionLocale, { params: requestparams });
  }

  GetScreenTarifaSelectionLocale(): Observable<any> {
    const requestparams = new HttpParams()
      .set('ui-culture', this.userPreferencesService.getUserLanguage());
    return this.http.get(environment.urls.GetScreenTarifaSelectionLocale, { params: requestparams });
  }

  GetScreenPaxDataLocale(): Observable<any> {
    const requestparams = new HttpParams()
      .set('ui-culture', this.userPreferencesService.getUserLanguage());
    return this.http.get(environment.urls.GetScreenPaxDataLocale, { params: requestparams });
  }

  GetScreenValidationLocale(): Observable<any> {
    const requestparams = new HttpParams()
      .set('ui-culture', this.userPreferencesService.getUserLanguage());
    return this.http.get(environment.urls.GetScreenValidationLocale, { params: requestparams });
  }

  GetScreenCotizationSelectionLocale(): Observable<any> {
    const requestparams = new HttpParams()
      .set('ui-culture', this.userPreferencesService.getUserLanguage());
    return this.http.get(environment.urls.GetScreenCotizationSelectionLocale, { params: requestparams });
  }

  
  GetScreenCabinaSelection(): Observable<any> {
    const requestparams = new HttpParams()
      .set('ui-culture', this.userPreferencesService.getUserLanguage());
    return this.http.get(environment.urls.GetScreenCabinaSelection, { params: requestparams });
  }

  GetScreenCabinaNumberSelection(): Observable<any> {
    const requestparams = new HttpParams()
      .set('ui-culture', this.userPreferencesService.getUserLanguage());
    return this.http.get(environment.urls.GetScreenCabinaNumberSelection, { params: requestparams });
  }


  

  GetScreenResumenCotizacionLocale(): Observable<any> {
    const requestparams = new HttpParams()
      .set('ui-culture', this.userPreferencesService.getUserLanguage());
    return this.http.get(environment.urls.GetScreenResumenCotizacionLocale, { params: requestparams });
  }


  GetScreenCallCenterLocale(): Observable<any> {
    const requestparams = new HttpParams()
      .set('ui-culture', this.userPreferencesService.getUserLanguage());
    return this.http.get(environment.urls.GetScreenCallCenter, { params: requestparams });
  }

  ImagenesVerBarco(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetImagenesVerBarco), filter);
  }

  GetListItinerario(filter: any, page: number, size: number): Observable<any> {
    const requestparams = new HttpParams()
      .set('PageNumber', page.toString())
      .set('PageSize', size.toString());
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetListItinerario), filter, { params: requestparams });
  }

  GetSalidasXItinerario(filter: any, page: number, size: number): Observable<any> {
    const requestparams = new HttpParams()
      .set('PageNumber', page.toString())
      .set('PageSize', size.toString());
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetSalidasXItinerario), filter, { params: requestparams });
  }

  GetCabinasXSalidas(filter: any, page: number, size: number): Observable<any> {
    const requestparams = new HttpParams()
      .set('PageNumber', page.toString())
      .set('PageSize', size.toString());
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetCabinasXSalidas), filter, { params: requestparams });
  }

  VerCabinasXCategorias(filter: any, page: number, size: number): Observable<any> {
    const requestparams = new HttpParams()
      .set('PageNumber', page.toString())
      .set('PageSize', size.toString());
    return this.http.post(this.ReplaceLanguaje(environment.urls.VerCabinasXCategorias), filter, { params: requestparams });
  }

  LoadXMLShipCabinMap(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.LoadXMLShipCabinMap), filter);

  }

  setHoldCabina(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.setHoldCabina), filter);

  }

  getTurnosComidasOnline(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.getTurnosComidaOnline), filter);

  }


  GetOfertasActivas(): Observable<any> {
    return this.http.get(this.ReplaceLanguaje(environment.urls.GetOfertasActivas));

  }

  GetCabinaMasBarataPosition(filter: any, page: number, size: number): Observable<any> {
    const requestparams = new HttpParams()
      .set('PageNumber', page.toString())
      .set('PageSize', size.toString());
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetCabinaMasBarataPosition), filter, { params: requestparams });
  }

  GetListCountry(): Observable<any> {
    return this.http.get(environment.urls.GetListCountry);
  }

  GetImagenBarco(filter: any): Observable<any> {
    return this.http.post(environment.urls.GetImagenBarco, filter);
  }

  GetImagenDesgolse(): Observable<any> {
    return this.http.get(environment.urls.GetImagenDesgolse);
  }

  GetResumenCotizacion(filter: any): Observable<any> {
    return this.http.post(environment.urls.GetResumenCotizacion, filter);
  }

  GetItinerarioById(filter: any): Observable<any> {
    return this.http.post(environment.urls.GetItinerarioById, filter);
  }

  SignInWidget(): Observable<any> {
    return this.http.get(environment.urls.SignInWidget);
  }

  SendResumenEmails(mailData: any): Observable<any> {
    return this.http.post(environment.urls.SendResumenEmails, mailData);
  }

  SendEmailSupport(mailData: any): Observable<any> {
    return this.http.post(environment.urls.SendEmailSupport, mailData);
  }

  SendEmailClient(mailData: any): Observable<any> {
    return this.http.post(environment.urls.SendEmailClient, mailData);
  }

  GetPrintVersionCotizacion(mailData: any): Observable<any> {
    return this.http.post(environment.urls.GetPrintVersionCotizacion, mailData,{responseType:'arraybuffer'});
 
    //return this.http.post(environment.urls.GetPrintVersionCotizacion, mailData);
  }

 /* GetPreDataTarifas(mailData: any): Observable<any> {
    return this.http.post(environment.urls.GetPreDataTarifas, mailData);
 
    //return this.http.post(environment.urls.GetPrintVersionCotizacion, mailData);
  }*/

  

  RegistrarCotizacion(mailData: any): Observable<any> {
    return this.http.post(environment.urls.RegistrarCotizacion, mailData);
  }

  NotificarCotizacion(mailData: any): Observable<any> {
    return this.http.post(environment.urls.NotificarCotizacion, mailData);
  }

  GetErrorMessage(tipo: any, idError: any): Observable<any> {

    const requestparams = new HttpParams()
      .set('tipomsg', tipo)
      .set('idmsg', idError);
    return this.http.get(environment.urls.GetErrorMessage, { params: requestparams });
  }

  GetMercadoAgenciaActivos(): Observable<any> {
    return this.http.get(environment.urls.GetMercadoAgenciaActivos);
  }

  GetListTarifasPSZ(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetListTarifasPSZ), filter);
  }


  GetBloqueTarifas(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetBloqueTarifas), filter);
  }

  //Nuevo servicio
  GetPreDataTarifas(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetPreDataTarifas), filter);
  }

  GetComboGateway(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetComboGateway), filter);
  }
  //Fin del nuevo servicio

  GetReservaOnline(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.getReservaOnline), filter);
  }

  GetListTarifasBR(filter: any): Observable<any> {
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetListTarifasBR), filter);
  }

  GetCabinasXTarifas(filter: any, page: number, size: number): Observable<any> {
    const requestparams = new HttpParams()
      .set('PageNumber', page.toString())
      .set('PageSize', size.toString());
    return this.http.post(this.ReplaceLanguaje(environment.urls.GetCabinasXTarifas), filter, { params: requestparams });
  }

  ReplaceLanguaje(url: string): string {
    var lang = this.userPreferencesService.getUserLanguage();

    if (lang != null) {
      return url.replace("languaje", lang);
    }
    else {
      return url.replace("es-AR", lang);
    }
  }
}
