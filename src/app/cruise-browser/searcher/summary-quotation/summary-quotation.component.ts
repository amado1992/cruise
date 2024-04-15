import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, Subscription } from 'rxjs';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { MessageService } from 'src/app/services/message.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ChoiceCabinComponent } from '../choice-cabin/choice-cabin.component';
import { ShowCabinComponent } from '../show-cabin/show-cabin.component';
import { DomSanitizer } from '@angular/platform-browser';
import { CallCenterComponent } from '../call-center/call-center.component';
import { ErrorWindowComponent } from '../error-window/error-window.component';
import { GoogleAnalyticsService } from 'src/app/services/Analytics/google-analytics.service';
import { AgenciaService } from 'src/app/services/DataServices/agencia.service';

@Component({
  selector: 'app-summary-quotation',
  templateUrl: './summary-quotation.component.html',
  styleUrls: ['./summary-quotation.component.scss']
})
export class SummaryQuotationComponent implements OnInit, OnDestroy {
  public getScreenWidth: any;
  public getScreenHeight: any;
  messageValidate: any
  quotationMode: any
  soloCotizacionOnline: any 

  lbl_Correct_PDFDownload: any
  loadingLabels: boolean;
  errorLoadingLabels: boolean;
  dataSubscription: Subscription;
  modalSubscription: Subscription;
  screenLangInfo: any = null;
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
  initSearch: string;
  pasajeros: any;
  propinaincluida: any;
  seguroincluido: any;
  ModoReservacion: any;
  priceprogramid: any;
  noImage: any;
  agentesdeviajes: any;
  selectedCategoryRoom: string = 'Interior';
  mostrarcallcenter: any;
  rateComplete: any
  activeAgencia: any;
  constructor(private router: Router, private adminService: AdminUsersService, private modalService: NgbModal,
    private messageService: MessageService, private userPreferences: UserPreferencesService,
     private sanitized: DomSanitizer,private _analytics: GoogleAnalyticsService,
     private agenciaService: AgenciaService) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  transformStyle(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }

  showError(errorValue) {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ErrorWindowComponent, { size: 'lg', centered: true });
    //modalRef.componentInstance.screenInfoCallCenter = this.screenInfoCallCenter;
    modalRef.componentInstance.screenError = errorValue;
    this.modalSubscription = from(modalRef.result).subscribe();

  }
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

  }

  showVentana() {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(CallCenterComponent, { size: 'lg', centered: true });
    //modalRef.componentInstance.screenInfoCallCenter = this.screenInfoCallCenter;
    modalRef.componentInstance.screenInfoCallCenter = "";
    this.modalSubscription = from(modalRef.result).subscribe();

  }
  showHTML(value) {
    var cleanIntermediate = value.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanText = cleanIntermediate;
    this.cleanText = this.transform(this.cleanText);
    return this.cleanText;
  }
  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.activeAgencia = this.agenciaService.getAgenciabyurl(this.userPreferences.getUrlConexion());
    // this.rateComplete = this.userPreferences.getElement("rateComplete");
    this.noImage = false;
    this.mostrarcallcenter = this.activeAgencia.MostrarCallCenter;
    this.agentesdeviajes = this.userPreferences.getElement("AgentesDeViaje");
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");
    this.priceprogramid = this.userPreferences.getElement('priceProgramId');
    this.ModoReservacion = this.userPreferences.getElement("ModoReservacion");
    this.propinaincluida = this.userPreferences.getElement("PropinaIncluida");
    this.seguroincluido = this.userPreferences.getElement("SeguroIncluido");

    this.quotationMode = this.userPreferences.getElement("QuotationMode");
    this.soloCotizacionOnline =JSON.parse(localStorage.getItem('SoloCotizacionOnline').toLowerCase());

    if (!this.seguroincluido) {
      this.seguroincluido = false;
    }
    if (!this.propinaincluida) {
      this.propinaincluida = false;
    }
    this.pasajeros = this.reservation.pasajeros;
    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    var testImagen = this.selectedCabin.deckImg.url;

    if (testImagen.includes("Default_Cabina")) {
      this.noImage = true;
    }
    this.InitEmails();
    this.BuildSailDate();
    this.InitData();
//this._analytics.trackEvent({eventName:"Quotation", eventCategory:this.reservation.mode, eventAction:"GET", eventLabel :"", eventValue :"OK"});     
  }
  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
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
    if (enews == null) {
      enews = false;
    }
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
      IdCotizacion: this.reservation.idCotizacion,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid,
      TarifaPromoId: this.priceprogramid,
      NoCabina: this.selectedCabin.cabinNumber,
      ListaPasajeros: this.pasajeros,
      TransactionCode: this.selectedCabin.transaction,
      PropinasIncluida: this.propinaincluida,
      SeguroIncluido: this.seguroincluido,
      AgenteViaje: this.agentesdeviajes,
      ENews: enews,
      FunctionalBranch: this.quotationMode,
      IsNRF: this.selectedCabin.esNRF,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
      ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
    };
    const sources = [
      this.adminService.GetScreenResumenCotizacionLocale(),
      this.adminService.GetImagenBarco(shipFilter),
      this.adminService.GetImagenDesgolse(),
      this.adminService.GetResumenCotizacion(resumeFilterCotiz),
      this.adminService.GetErrorMessage('0', 'InfoVolverAEmpezar'),
      this.adminService.GetScreenValidationLocale()
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo, shipUrl, desgUrl, cotResume, initSearch, messageValidate]: any[]) => {
          this.screenLangInfo = screenInfo;
          this.messageValidate = messageValidate
          this.lbl_Correct_PDFDownload = this.screenLangInfo.lbl_Correct_PDFDownload
          if (this.itinerary.nnoches == '1') {
            var noche = this.screenLangInfo.lbl_noche;
            this.screenLangInfo.lbl_nochesEnEl = noche;

          }
          this.urlShip = shipUrl.value; // Cambio de .Value;
          this.urlDesg = desgUrl.value; // Cambio de .Value;
          this.cotResume = cotResume;
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
          this.reservation.idCotizacion = cotResume.idCotizacion;
          this.userPreferences.setElement("Reservation", this.reservation);
          this.reservation = this.userPreferences.getElement("Reservation");

          //this.cotResume.listaNotasAlPie=['&lt;--Pruebas de diferentes Formatos Ingenius--&gt;<hr /><img alt="" src="http://localhost:5001/Principal/GetImageResource?name=Resources.RCCL.png&amp;size=small" /><img alt="" src="http://localhost:5001/Principal/GetImageResource?name=Resources.RCCL.png&amp;size=small" style="float:left" />Este es la <a href="http://cb-test.ingeniuscuba.com/CruiseBrowserAngular/cruisebrowser/searcher">compa&ntilde;ia </a>usada<br /><br /><span style="color:#FF0000;"><span style="background-color:#000080;">sfsafsfFfFF</span></span><br /> &nbsp;&acute;&acute;* Los precios son par ael crucero &uacute;nicamente. no incluye propinas ni gastos externos al crucero.<br />'];
        },
        (error: HttpErrorResponse) => {
          this.loadingLabels = false;
          this.errorLoadingLabels = true;
         
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
  CabinChoice() {
    this.userPreferences.setElement("BookingMode", "Reserva");

    var precio = this.cotResume.totalReserva.precio
    var obj = this.userPreferences.getElement("selectedCabin");
    obj.precioCabina = precio
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ChoiceCabinComponent, { size: 'lg', centered: true });
    this.modalSubscription = from(modalRef.result).subscribe();
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
  ShowSearch() {
    this.router.navigate(['cruisebrowser', 'searcher']);
  }
  SendMail() {

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
      TipoSubjectTarget: '0',
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipalString,
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipalString,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid,
      TarifaPromoId: this.priceprogramid,
      NoCabina: this.selectedCabin.cabinNumber,
      ListaPasajeros: this.pasajeros,
      TransactionCode: this.selectedCabin.transaction,
      PropinasIncluida: this.propinaincluida,
      SeguroIncluido: this.seguroincluido,
      IdCotizacion: this.reservation.idCotizacion,
      CorreoResumen: this.mail,
      FunctionalBranch: this.quotationMode,
      IsNRF: this.selectedCabin.esNRF,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
      ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
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
              // this.messageService.generalMessage('success', this.initSearch ? this.initSearch : 'Puede realizar nuevas búsquedas de itinerarios.');
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
          // this.router.navigate(['cruisebrowser', 'reservationsummary']);
        },
        (error: HttpErrorResponse) => {
          this.userPreferences.setElement("SendEMail", true);
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
  SendMailOld() {
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
      CantPasajeros: this.reservation.pasajeros ? this.reservation.pasajeros.length.toString() : "2",
      CorreoResumen: this.mail,
      ListaPasajeros: this.reservation.pasajeros,
      TipoSubjectTarget: '0',
      PriceProgramId: this.priceprogramid,
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipalString,
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipalString,
      CotizacionId: this.reservation.idCotizacion,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
      FunctionalBranch: this.quotationMode,
    };
    const sources = [
      this.adminService.NotificarCotizacion(mailData)
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([mailResume]: any[]) => {
          if (mailResume && mailResume.Estate) {
            if (mailResume.Estate == 'Correct') {
              this.messageService.generalMessage('success', mailResume.NotificationMsg);
              // this.messageService.generalMessage('success', this.initSearch ? this.initSearch : 'Puede realizar nuevas búsquedas de itinerarios.');
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
  ViewCabin() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ShowCabinComponent, { size: 'sm', centered: true });
    (<ShowCabinComponent>modalRef.componentInstance).screenLangInfo = this.screenLangInfo;
    this.modalSubscription = from(modalRef.result).subscribe();
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

  GetPDF() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    var precio = this.BuildPrecios(this.reservation.idCategoriaHabitacion);
    var enews = this.userPreferences.getElement("enews");
    if (enews == null) {
      enews = false;
    }
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
      TipoSubjectTarget: '0',
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipalString,
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipalString,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid,
      TarifaPromoId: this.priceprogramid,
      NoCabina: this.selectedCabin.cabinNumber,
      ListaPasajeros: this.pasajeros,
      TransactionCode: this.selectedCabin.transaction,
      PropinasIncluida: this.propinaincluida,
      SeguroIncluido: this.seguroincluido,
      //IdCotizacion:this.reservation.idCotizacion,
      IdCotizacion: this.reservation.idCotizacion,
      CorreoResumen: this.mail,
      FunctionalBranch: this.quotationMode,
      IsNRF: this.selectedCabin.esNRF,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
      ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      ENews: enews
    };
    this.messageService.generalMessage('info', this.lbl_Correct_PDFDownload);



    const sources = [
      this.adminService.GetPrintVersionCotizacion(mailData)
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([mailResume]: any[]) => {       

          var fileName = "cotization.pdf";
          var a = document.createElement("a");
          document.body.appendChild(a);
          //a.style="display:none";
          var file = new Blob([mailResume], { type: 'application/pdf' });
          var fileURL = window.URL.createObjectURL(file);
          a.href = fileURL;
          a.download = fileName;
          a.click();
          // this.router.navigate(['cruisebrowser', 'reservationsummary']);
        },
        (error: HttpErrorResponse) => {
          this.userPreferences.setElement("PrintPdf", true);
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
  
  ValidateDiasValidosReserva() {
    var fechadesde = new Date().getTime();
    var fechahasta = new Date(this.selectedDate.fechaSalida).getTime();    
    var diff_ =(fechahasta - fechadesde)/(1000 * 60 * 60 * 24);
    return diff_ > Number(this.reservation.CotizacionConfig.diasSoloCotizacion);    
  }
}


// GetPrintVersionCotizacion: resumen + 'GetPrintVersionCotizacion',

