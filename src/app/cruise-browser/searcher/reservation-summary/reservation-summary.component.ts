import { Component, HostListener, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin, from, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { MessageService } from 'src/app/services/message.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ChoiceCabinComponent } from '../choice-cabin/choice-cabin.component';
import { ShowCabinComponent } from '../show-cabin/show-cabin.component';
import { DomSanitizer } from '@angular/platform-browser';
import { CallCenterComponent } from '../call-center/call-center.component';
import { ErrorWindowComponent } from '../error-window/error-window.component';
import { GoogleAnalyticsService } from 'src/app/services/Analytics/google-analytics.service';
import { Agencia, AgenciaService } from 'src/app/services/DataServices/agencia.service';
@Component({
  selector: 'app-reservation-summary',
  templateUrl: './reservation-summary.component.html',
  styleUrls: ['./reservation-summary.component.scss'] 
})
export class ReservationSummaryComponent implements OnInit {
  public getScreenWidth: any;
  public getScreenHeight: any;
  reservaMode: any

  lbl_Correct_PDFDownload: any = ""
  loadingLabels: boolean;
  errorLoadingLabels: boolean;
  dataSubscription: Subscription;
  modalSubscription: Subscription;
  screenLangInfo: any = null;
  messageValidate:any
  itinerary: any;
  selectedDate: any;
  reservation: any;
  selectedCabin: any;
  urlShip: string;
  urlDesg: string;
  cleanTitleRate: any;
  cleanDescriptionRate: any;
  cleanText: any;
  cotResume: any;
  sailDate: string;
  mail: string;
  ModoReservacion: any;
  seguroincluido: any;
  propinaincluida: any;
  pasajeros: any;
  initSearch: string;
  dateDeposito: any;
  bookingid: any;
  deposito: any;
  automaticabin: any;
  monedaPos: any;
  monedaUnit: any;
  priceprogramid: any;
  agentesdeviajes: any;
  mostrarcallcenter: any;
  selectedCategoryRoom: string = 'Interior';
  activeAgencia: Agencia;
  
  constructor(private router: Router, private adminService: AdminUsersService, 
    private modalService: NgbModal,
    private messageService: MessageService, private userPreferences: UserPreferencesService, 
    private sanitized: DomSanitizer,private _analytics: GoogleAnalyticsService,
    private agenciaService: AgenciaService) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  transformStyle(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  showHTML(value) {
    var cleanIntermediate = value.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanText = cleanIntermediate;
    this.cleanText = this.transform(this.cleanText);
    return this.cleanText;
  }
  showError(errorValue) {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ErrorWindowComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenError = errorValue;
    this.modalSubscription = from(modalRef.result).subscribe();

  }


  showVentana() {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(CallCenterComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenInfoCallCenter = "";
    this.modalSubscription = from(modalRef.result).subscribe();

  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
  }
  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    
    this.activeAgencia = this.agenciaService.getAgenciabyurl(this.userPreferences.getUrlConexion());

    this.reservaMode = this.userPreferences.getElement("BookingMode")
    this.mostrarcallcenter = this.activeAgencia.MostrarCallCenter;
    this.agentesdeviajes = this.userPreferences.getElement("AgentesDeViaje");
    this.priceprogramid = this.userPreferences.getElement('priceProgramId');
    this.automaticabin = this.userPreferences.getElement("AutomaticCabin");
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");    
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.ModoReservacion = this.userPreferences.getElement("ModoReservacion");
    this.propinaincluida = this.userPreferences.getElement("PropinaIncluida");
    this.seguroincluido = this.userPreferences.getElement("SeguroIncluido");
    if (!this.seguroincluido) {
      this.seguroincluido = false;
    }
    if (!this.propinaincluida) {
      this.propinaincluida = false;
    }
    if (this.automaticabin == true) {
      this.seguroincluido = false;
      this.propinaincluida = true;
    }
    this.pasajeros = this.reservation.pasajeros;

    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.InitEmails();
    this.BuildSailDate();
    this.InitData();
  }
  InitEmails() {
    var result = '';
    if (this.reservation && this.reservation.pasajeros && this.reservation.pasajeros.length > 0) {
      this.reservation.pasajeros.forEach(element => {
        if (element.correo && element.correo != null && element.correo.trim() != '') {
          result += element.correo + ',';
        }
      });
    }
    if (result != '') {
      result = result.substring(0, result.length - 1);
    }
    this.mail = result;
  }
  BuildMetaCategoria(metaCategoria: string): any {
    if (metaCategoria == "Interior")
      return "I";
    else if (metaCategoria == "Exterior")
      return "O";
    else if (metaCategoria == "Balcon")
      return "B";
    else if (metaCategoria == "Suite")
      return "S";
    return null;
  }
  BuildSailDate() {
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split("-");
      this.sailDate = split[0] + "-" + split[1] + "-" + split[2];
    }
  }
  BuildPrecios(metaCategoria: string): any {
    var result: any;
    this.selectedDate.precios.forEach(precio => {
      if (precio.metacategoria == 'I') {
        if (metaCategoria == 'Interior') {
          result = precio;
        }
      }
      else if (precio.metacategoria == 'O') {
        if (metaCategoria == 'Exterior') {
          result = precio;
        }
      }
      else if (precio.metacategoria == 'B') {
        if (metaCategoria == 'Balcon') {
          result = precio;
        }
      }
      else if (precio.metacategoria == 'D' || precio.metacategoria == 'S') {
        if (metaCategoria == 'Suite') {
          result = precio;
        }
      }
    });
    return result;
  }
  GetCatTranslate(): any {
    if (this.selectedCategoryRoom == "Interior") {
      return this.screenLangInfo.lbl_Button_Interior;
    }
    else if (this.selectedCategoryRoom == "Exterior") {
      return this.screenLangInfo.lbl_Button_Exterior;
    }
    else if (this.selectedCategoryRoom == "Balcon") {
      return this.screenLangInfo.lbl_Button_Balcon;
    }
    else {
      return this.screenLangInfo.lbl_Button_Suite;
    }
  }
  GetClass(object: any): any {
    if (object && object.color && object.color != null) {
      if (object.color.toString().indexOf("Gray") >= 0) {
        return "";
      }
      else if (object.color.toString().indexOf("Blue") >= 0) {
        return "text-primary";
      }
      else if (object.color.toString().indexOf("Red") >= 0) {
        return "text-danger";
      }
      else {
        return "";
      }
    }
    else {
      return "";
    }
  }
  InitData() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.loadingLabels = true;
    this.errorLoadingLabels = false;
    var shipFilter =
    {
      ShipCode: this.itinerary.shipCode,
      Company: this.itinerary.company,
      Mercado: this.itinerary.mercado,
      FunctionalBranch: this.reservaMode
    };
    var precio = this.BuildPrecios(this.reservation.idCategoriaHabitacion);
    var resumeFilter =
    {
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      Nnoches: this.itinerary.nnoches.toString(),
      SalidaCode: this.selectedDate.idSalidas.toString(),
      PuertoSalidaCode: this.itinerary.departurePortCode,
      Saildate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(this.reservation.idCategoriaHabitacion),
      CategoriaCabina: this.selectedCabin.categoria,
      CantPasajeros: this.reservation.pasajeros ? this.reservation.pasajeros.length.toString() : "2",
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipal.toString(),
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipal.toString(),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      PriceProgramId: this.priceprogramid,
      CotizacionId: this.reservation.idCotizacion,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0'
    };
    var enews = this.userPreferences.getElement("enews");
    var chequeadoTravel = JSON.parse(this.userPreferences.getElement("checkagenteViajes"));
    
    var resumeFilterCotiz =
    {
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      Nnoches: this.itinerary.nnoches.toString(),
      SalidaCode: this.selectedDate.idSalidas.toString(),
      PuertoSalidaCode: this.itinerary.departurePortCode,
      Saildate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(this.reservation.idCategoriaHabitacion),
      CategoriaCabina: this.selectedCabin.categoria,
      CantPasajeros: this.reservation.pasajeros ? this.reservation.pasajeros.length.toString() : "2",
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipal.toString(),
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipal.toString(),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      CotizacionId: this.reservation.idCotizacion,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
        ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid,
      NoCabina: this.selectedCabin.cabinNumber,
      ListaPasajeros: this.reservation.pasajeros,
      TransactionCode: this.selectedCabin.transaction,
      PropinasIncluida: this.propinaincluida,
      SeguroIncluido: this.seguroincluido,
      AgenteViaje: chequeadoTravel ? this.agentesdeviajes : {},
      ENews: enews,
      TarifaPromoId: this.priceprogramid,
      IsNRF: this.selectedCabin.esNRF,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
      FunctionalBranch: this.reservaMode
    };
 
    const sources = [
      this.adminService.GetScreenResumenCotizacionLocale(),
      this.adminService.GetImagenBarco(shipFilter),
      this.adminService.GetImagenDesgolse(),
      this.adminService.GetReservaOnline(resumeFilterCotiz),
      this.adminService.GetErrorMessage('0', 'InfoVolverAEmpezar'),
      this.adminService.GetScreenValidationLocale()
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo, shipUrl, desgUrl, cotResumen, initSearch, messageValidate]: any[]) => {
          this.screenLangInfo = screenInfo;
          this.messageValidate = messageValidate
          this.lbl_Correct_PDFDownload = this.screenLangInfo.lbl_Correct_PDFDownload
          if (this.itinerary.nnoches == '1') {
            var noche = this.screenLangInfo.lbl_noche;
            this.screenLangInfo.lbl_nochesEnEl = noche;

          }
          this.urlShip = shipUrl.value; // Cambio de .Value;
          this.urlDesg = desgUrl.value; // Cambio de .Value;
          this.cotResume = cotResumen.resumenCotizacion;
          this.bookingid = cotResumen.bookingId;
          this.dateDeposito = this.cotResume.depositCredit;
          if (this.itinerary.mostrarMonedaLocal) {
            this.monedaUnit = this.dateDeposito.monedaL;
            this.monedaPos = 1;
          } else {
            this.monedaUnit = this.dateDeposito.monedaP;
            this.monedaPos = 0;
          }
         
          if (initSearch.value) {
            this.initSearch = initSearch.value; // Cambio de .Value;
          }
          this.loadingLabels = false;
          this.cleanTitleRate = '<strong>' + this.screenLangInfo.lbl_tarifa + '</strong><img *ngIf="' + this.reservation.rate.tarifa.icon + '" src=' + this.reservation.rate.tarifa.icon + ' style="max-height: 35px; min-width: 5px;">' + this.reservation.rate.tarifa.titulo;
          var cleanIntermediate = this.cleanTitleRate.toString();
          cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
          this.cleanTitleRate = cleanIntermediate;
          this.cleanTitleRate = this.transform(this.cleanTitleRate);
          this.cleanDescriptionRate = this.reservation.rate.tarifa.descripcion;
          var cleanIntermediate = this.cleanDescriptionRate.toString();
          cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
          this.cleanDescriptionRate = cleanIntermediate;
          this.cleanDescriptionRate = this.transform(this.cleanDescriptionRate);
          //this.cotResume.listaNotasAlPie=['&lt;--Pruebas de diferentes Formatos Ingenius--&gt;<hr /><img alt="" src="http://localhost:5001/Principal/GetImageResource?name=Resources.RCCL.png&amp;size=small" /><img alt="" src="http://localhost:5001/Principal/GetImageResource?name=Resources.RCCL.png&amp;size=small" style="float:left" />Este es la <a href="http://cb-test.ingeniuscuba.com/CruiseBrowserAngular/cruisebrowser/searcher">compa&ntilde;ia </a>usada<br /><br /><span style="color:#FF0000;"><span style="background-color:#000080;">sfsafsfFfFF</span></span><br /> &nbsp;&acute;&acute;* Los precios son par ael crucero &uacute;nicamente. no incluye propinas ni gastos externos al crucero.<br />'];
        },
        (error: HttpErrorResponse) => {
          this.loadingLabels = false;
          this.errorLoadingLabels = true;
                  let methodArray = error.url.split("/")
      let method = methodArray[methodArray.length - 1]

      if (method == "GetReservaOnline"){
        this.userPreferences.setElement("reservaOnline", "reservaOnline");
      }
      
      let errorMessage = '';

          if (error.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = `Error: ${error.error.message}`;
          } else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }

          if (Object.keys(error.error).length != 0 && typeof (error.error) === 'string') {

            this.showError(error.error)

          } else {

            if (error.error.value && typeof (error.error) === 'object') {
              this.showError(error.error.value)
            } else {
              if (error.status == 400) {
                this.showError(this.messageValidate.err_400Controlado)
              }
              if (error.status == 404) {
                this.showError(this.messageValidate.err_404PaginaNoEncontrada)
              }
              if (error.status == 500) {
                this.showError(this.messageValidate.err_500NoControlado)
              }
            }

          }
          console.error(errorMessage);
        });       
       
  }
  PassengersNumber() {
    this.router.navigate(['cruisebrowser', 'passengersnumber']);
  }
  ShowSelectionRates() {
    this.router.navigate(['cruisebrowser', 'selectionrates']);
  }
  ShowSearch() {
    this.router.navigate(['cruisebrowser', 'searcher']);
  }
  ShowPassengerDataReservation() {
    this.router.navigate(['cruisebrowser', 'reserveconfirmation']);
  }
  SendMail() {
    var enews = this.userPreferences.getElement("enews");
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    var precio = this.BuildPrecios(this.reservation.idCategoriaHabitacion);
    var mailData =
    {
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      Nnoches: this.itinerary.nnoches.toString(),
      SalidaCode: this.selectedDate.idSalidas.toString(),
      PuertoSalidaCode: this.itinerary.departurePortCode,
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      Saildate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(this.reservation.idCategoriaHabitacion),
      CategoriaCabina: this.selectedCabin.categoria,
      CantPasajeros: this.pasajeros ? this.pasajeros.length.toString() : "2",
      TipoSubjectTarget: '1',
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipalString,
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipalString,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid,
      NoCabina: this.selectedCabin.cabinNumber,
      ListaPasajeros: this.pasajeros,
      TransactionCode: this.selectedCabin.transaction,
      PropinasIncluida: this.propinaincluida,
      SeguroIncluido: this.seguroincluido,
      IdCotizacion: this.bookingid,
      CorreoResumen: this.mail,
      IsNRF: this.selectedCabin.esNRF,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
      ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      ENews: enews,
      FunctionalBranch: this.reservaMode
    };
   
    const sources = [
      this.adminService.SendEmailClient(mailData)
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([mailResume]: any[]) => {
          if (mailResume && mailResume.Estate) {
            if (mailResume.Estate == 'Correct') {
              this.messageService.generalMessage('success', mailResume.NotificationMsg);
              }
            else if (mailResume.Estate == 'Error') {
              this.messageService.generalMessage('error', mailResume.NotificationMsg);
            }
            else if (mailResume.Estate == 'Warning') {
              this.messageService.generalMessage('warning', mailResume.NotificationMsg);
            }
            else if (mailResume.Estate == 'In Process') {
              this.messageService.generalMessage('info', mailResume.NotificationMsg);
            }
          }
         
        },
        (error: HttpErrorResponse) => {
          let errorMessage = '';

          if (error.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = `Error: ${error.error.message}`;
          } else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }

          if (Object.keys(error.error).length != 0 && typeof (error.error) === 'string') {

            this.showError(error.error)

          } else {

            if (error.error.value && typeof (error.error) === 'object') {
              this.showError(error.error.value)
            } else {
              if (error.status == 400) {
                this.showError(this.messageValidate.err_400Controlado)
              }
              if (error.status == 404) {
                this.showError(this.messageValidate.err_404PaginaNoEncontrada)
              }
              if (error.status == 500) {
                this.showError(this.messageValidate.err_500NoControlado)
              }
            }

          }
          console.error(errorMessage);
        });
  }

  //                 GetPrintVersionCotizacion: resumen + 'GetPrintVersionCotizacion',
  

  GetPDF() {
    var enews = this.userPreferences.getElement("enews");
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    var precio = this.BuildPrecios(this.reservation.idCategoriaHabitacion);
    var mailData =
    {
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      Nnoches: this.itinerary.nnoches.toString(),
      SalidaCode: this.selectedDate.idSalidas.toString(),
      PuertoSalidaCode: this.itinerary.departurePortCode,
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      Saildate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(this.reservation.idCategoriaHabitacion),
      CategoriaCabina: this.selectedCabin.categoria,
      CantPasajeros: this.pasajeros ? this.pasajeros.length.toString() : "2",
      //TipoSubjectTarget: '0',
      TipoSubjectTarget: '1',
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipalString,
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipalString,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid,
      TarifaPromoId:this.priceprogramid,
      NoCabina: this.selectedCabin.cabinNumber,
      ListaPasajeros: this.pasajeros,
      TransactionCode: this.selectedCabin.transaction,
      PropinasIncluida: this.propinaincluida,
      SeguroIncluido: this.seguroincluido,
      //IdCotizacion:this.reservation.idCotizacion,
      IdCotizacion: this.bookingid,
      CorreoResumen: this.mail,
      IsNRF: this.selectedCabin.esNRF,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
      ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      ENews: enews,
      FunctionalBranch: this.reservaMode
    };
    this.messageService.generalMessage('info', this.lbl_Correct_PDFDownload);
  
         
    const sources = [
      this.adminService.GetPrintVersionCotizacion(mailData)
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([mailResume]: any[]) => {
         /* if (mailResume && mailResume.Estate) {
            if (mailResume.Estate == 'Correct') {
               }
            else if (mailResume.Estate == 'Error') {
              this.messageService.generalMessage('error', mailResume.NotificationMsg);
            }
            else if (mailResume.Estate == 'Warning') {
              this.messageService.generalMessage('warning', mailResume.NotificationMsg);
            }
            else if (mailResume.Estate == 'In Process') {
              this.messageService.generalMessage('info', mailResume.NotificationMsg);
            }
          }*/
          //window.open(mailResume);

          var  fileName = "cotization.pdf";
          var a=document.createElement("a");
          document.body.appendChild(a);
          //a.style="display:none";
          var file= new Blob([mailResume],{type:'application/pdf'});
          var fileURL = window.URL.createObjectURL(file);
          a.href=fileURL;
          a.download=fileName;
          a.click();
          // this.router.navigate(['cruisebrowser', 'reservationsummary']);
        },
        (error: HttpErrorResponse) => {
          let errorMessage = '';

          if (error.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = `Error: ${error.error.message}`;
          } else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }

          if (Object.keys(error.error).length != 0 && typeof (error.error) === 'string') {

            this.showError(error.error)

          } else {

            if (error.error.value && typeof (error.error) === 'object') {
              this.showError(error.error.value)
            } else {
              if (error.status == 400) {
                this.showError(this.messageValidate.err_400Controlado)
              }
              if (error.status == 404) {
                this.showError(this.messageValidate.err_404PaginaNoEncontrada)
              }
              if (error.status == 500) {
                this.showError(this.messageValidate.err_500NoControlado)
              }
            }

          }
          console.error(errorMessage);
        });
  }


  ViewCabin() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ShowCabinComponent, { size: 'sm', centered: true });
    (<ShowCabinComponent>modalRef.componentInstance).screenLangInfo = this.screenLangInfo;
    this.modalSubscription = from(modalRef.result).subscribe();
  }

}
