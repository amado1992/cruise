import { Component, DoCheck, HostListener, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, Subscription } from 'rxjs';
import { Pasajero } from 'src/app/models/Pasajero.model';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { MessageService } from 'src/app/services/message.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ItineraryinfoComponent } from '../itineraryinfo/itineraryinfo.component';
import { ShowCabinComponent } from '../show-cabin/show-cabin.component';
import { DomSanitizer } from '@angular/platform-browser';
import { A11yModule } from '@angular/cdk/a11y';
import { cr } from '@angular/core/src/render3';
import { CallCenterComponent } from '../call-center/call-center.component';
import { ErrorWindowComponent } from '../error-window/error-window.component';
import { Agencia, AgenciaService } from 'src/app/services/DataServices/agencia.service';
@Component({
  selector: 'app-cotization-selection',
  templateUrl: './cotization-selection.component.html',
  styleUrls: ['./cotization-selection.component.scss']
})
export class CotizationSelectionComponent implements OnInit, DoCheck {
  public getScreenWidth: any;
  public getScreenHeight: any;
  pagarPropinas: boolean
  pagarImpuestos: boolean

  loading_one: boolean = false
  loading_two: boolean = false
  loading_three: boolean = false
  loading_four: boolean = false

  loadingLabels: boolean;
  errorLoadingLabels: boolean;
  acceptTermConditions: boolean = false;
  dataSubscription: Subscription;
  modalSubscription: Subscription;
  screenLangInfo: any = null;
  screenLangInfoPax: any = null;
  nationalityInfo: any = null;
  itinerary: any;
  selectedDate: any;
  reservation: any;
  selectedCategoryRoom: string;
  selectedCabin: any;
  cotizaronline: any;
  pasajeros: any[] = [];
  showagencytravel: any;
  sailDate: string;
  cleanTitleRate: any;
  cleanDescriptionRate: any;
  IdCotizacion: string = "";
  errorObligatorios: string;
  errorFormatoCorreo: string;
  cleanText: any;
  rateTitle: string;
  cantPasajeros: any;
  showtravelagency: any;
  resumenPasajero: any;
  resumenPasajeroff: any;
  resumenPasajerovf: any;
  resumenPasajerovv: any;
  resumenPasajerofv: any;
  seguro: any;
  propina: any;
  cotResume: any;
  xcabinaxpasajero: any;
  cantidadPasajeros: any;
  terminoscondiciones: any;
  enumCotizar: any;
  enews: any;
  enewsSave: boolean;
  finalprice: any;
  messageValidate: any
  finalpricelocal: any;
  mostrarenews: any;
  datosagentesviaje = {
    NombreAgencia: "",
    NombreAgente: "",
    DireccionAgencia: "",
    TelefonoAgencia: "",
  };
  experienciatitle: any;
  experienciaicon: any;
  experienciadescription: any;
  mostraragentesviajes: any;
  mostrarpropinas: any;
  mostrarSeguro: any
  mostrarcallcenter: any;
  agencytravelIsValid: boolean;
  chequeadoTravel: any;
  showTip: any;
  activeAgencia: Agencia;
  
  constructor(private router: Router, private adminService: AdminUsersService, private messageService: MessageService,
    private userPreferences: UserPreferencesService, private modalService: NgbModal, private sanitized: DomSanitizer,private agenciaService: AgenciaService) { }
  showHTML(valor) {
    var cleanIntermediate = valor.toString();
    cleanIntermediate = cleanIntermediate.toString().replace("\r\n", "<br/>");
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

    this.userPreferences.setElement("backReservationSummary", false);

    this.itinerary = this.userPreferences.getElement("Itinerary");

    var cabina = this.userPreferences.getElement('Experiencia');

    if ((this.itinerary.company == 'MSC') && (cabina != null)) {
      this.experienciatitle = cabina.titulo;
      this.experienciadescription = cabina.descripion;
      this.experienciaicon = cabina.urlIcon;
    }
    this.mostrarcallcenter = this.activeAgencia.MostrarCallCenter;

    this.pagarImpuestos = this.userPreferences.getElement("SeguroIncluido");
    this.pagarPropinas = this.userPreferences.getElement("PropinaIncluida");

    this.propina = this.pagarPropinas
    this.seguro = this.pagarImpuestos

    /*this.propina = false;
    this.seguro = false;*/

    this.enewsSave = this.userPreferences.getElement("enews");
    this.mostrarenews = JSON.parse(this.activeAgencia.MostrarENnews.toLowerCase());
   
    this.terminoscondiciones = this.activeAgencia.TerminosCondiciones;
    this.acceptTermConditions = this.userPreferences.getElement("acceptTermConditions");
   
    //SECTION AGENTE DE VIAJES
    this.datosagentesviaje = this.userPreferences.getElement("AgentesDeViaje");
    this.mostraragentesviajes = JSON.parse(this.activeAgencia.MostrarAgenteViajes.toLowerCase());
    this.chequeadoTravel = JSON.parse(this.userPreferences.getElement("checkagenteViajes"));
    this.ValidateFormAgenciaViajes();

    this.showTip = this.userPreferences.getElement("preDataTarifas");
    this.mostrarpropinas = this.ConfirmSeguros(this.showTip.mostrarPedirPropinas, !this.itinerary.propinasIncluidas)
    this.mostrarSeguro = this.ConfirmSeguros(false, this.showTip.mostrarPedirSeguros)
    this.reservation = this.userPreferences.getElement("Reservation");
    this.pasajeros = this.reservation.pasajeros;
    this.cantidadPasajeros = this.userPreferences.getElement("PaxTotal");
    this.cotizaronline = this.userPreferences.getElement("CotizarOnline");

    this.enumCotizar = this.userPreferences.getElement("BookingMode")
    this.cleanTitleRate = this.reservation.rate.tarifa.titulo;
    var cleanIntermediate = this.cleanTitleRate.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanTitleRate = cleanIntermediate;
    this.cleanTitleRate = this.transform(this.cleanTitleRate + "&nbsp;");
    this.cleanDescriptionRate = '<img *ngIf="this.reservation.rate.icon" src="' + this.reservation.rate.tarifa.icon + '"style="max-height: 35px; min-width: 5px;">' + this.reservation.rate.tarifa.descripcion;
    var cleanIntermediate = this.cleanDescriptionRate.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanDescriptionRate = cleanIntermediate;
    this.cleanDescriptionRate = this.transform(this.cleanDescriptionRate);
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    this.selectedCabin.priceProgramId = this.selectedCabin.promo;
    this.userPreferences.setElement("selectedCabin", this.selectedCabin);  
    this.rateTitle = (this.reservation.rate.tarifa) ? this.reservation.rate.tarifa.titulo : this.screenLangInfo.lbl_TipoTarifa;
    this.BuildSailDate();
    this.InitData();
  }

  ngDoCheck() {
    if (this.loading_one && this.loading_two && this.loading_three && this.loading_four) {

      this.RevisarSeguroPropina(this.seguro, this.propina);
    }
  }

  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  ConfirmSeguros(value1, value2) {
    return value1 && value2
  }
  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }
  ShowItinerary(value: boolean) {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ItineraryinfoComponent, { size: 'lg', centered: true });
    (<ItineraryinfoComponent>modalRef.componentInstance).tabItinerary = value;
    this.modalSubscription = from(modalRef.result).subscribe();
  }
  ShowSelectionRates() {
    this.router.navigate(['cruisebrowser', 'selectionrates']);
  }
  ShowSumaryQuotation() {
    if (this.CheckRequiredData()) {
      if (this.CheckMail()) {
        this.SendMail();
      }
      else {
        this.messageService.generalMessage('error', this.errorFormatoCorreo ? this.errorFormatoCorreo : 'El correo no tiene un formato válido.');
      }
    }
    else {
      this.messageService.generalMessage('error', this.errorObligatorios ? this.errorObligatorios : 'Campos obligatorios no especificados.');
    }
  }
  PassengersNumber() {
    this.router.navigate(['cruisebrowser', 'passengersnumber']);
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

    this.loading_one = false
    this.loading_two = false
    this.loading_three = false
    this.loading_four = false

    this.IdCotizacion = this.reservation.idCotizacion;

    this.errorLoadingLabels = false;
    var precio = this.BuildPrecios(this.reservation.idCategoriaHabitacion);
    var resumeFilterff =
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
      NoCabina: this.selectedCabin.cabinNumber,
      SeguroIncluido: false,
      ListaPasajeros: this.pasajeros,
      PropinasIncluida: false,
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.selectedCabin.priceProgramId,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoId : '0',
      ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
      FunctionalBranch: this.enumCotizar,
      TarifaPromoId: this.selectedCabin.priceProgramId,
      IsNRF: this.selectedCabin.esNRF,
      IdCotizacion: this.IdCotizacion      
    };
    var resumeFiltervf =
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
      NoCabina: this.selectedCabin.cabinNumber,
      SeguroIncluido: true,
      ListaPasajeros: this.pasajeros,
      PropinasIncluida: false,
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.selectedCabin.priceProgramId,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
       ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      FunctionalBranch: this.enumCotizar,
      TarifaPromoId: this.selectedCabin.priceProgramId,
      IsNRF: this.selectedCabin.esNRF,
      IdCotizacion: this.IdCotizacion,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false
    };
    var resumeFiltervv =
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
      NoCabina: this.selectedCabin.cabinNumber,
      SeguroIncluido: true,
      ListaPasajeros: this.pasajeros,
      PropinasIncluida: true,
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.selectedCabin.priceProgramId,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
        ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      FunctionalBranch: this.enumCotizar,
      TarifaPromoId: this.selectedCabin.priceProgramId,
      IsNRF: this.selectedCabin.esNRF,
      IdCotizacion: this.IdCotizacion,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false
    };
    var resumeFilterfv =
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
      NoCabina: this.selectedCabin.cabinNumber,
      SeguroIncluido: false,
      ListaPasajeros: this.pasajeros,
      PropinasIncluida: true,
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.selectedCabin.priceProgramId,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
        ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      FunctionalBranch: this.enumCotizar,
      TarifaPromoId: this.selectedCabin.priceProgramId,
      IsNRF: this.selectedCabin.esNRF,
      IdCotizacion: this.IdCotizacion,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false
    };
    const sources = [
      this.adminService.GetScreenCotizationSelectionLocale(),
      this.adminService.GetScreenPaxSelectionLocale(),
      this.adminService.GetScreenValidationLocale()
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo, screenInfoPax/*, cotResumenff, cotResumenvf, cotResumenvv, cotResumenfv*/, messageValidate]: any[]) => {
          this.screenLangInfo = screenInfo;
          this.messageValidate = messageValidate
          if (this.itinerary.nnoches == '1') {
            var noche = this.screenLangInfo.lbl_noche;
            this.screenLangInfo.lbl_nochesEnEl = noche;

          }

          if ((this.screenLangInfo.lbl_PorCabinaXPasajeros != null || this.screenLangInfo.lbl_PorCabinaXPasajeros != undefined) &&
            (this.screenLangInfo != null || this.screenLangInfo != undefined)) {
            this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
          }

          if (this.terminoscondiciones) {
            var enlace = this.screenLangInfo.lbl_TerminosyCondiciones;
            var enlace_complete = "<a target='_blank' href='" + this.terminoscondiciones + "'>" + this.screenLangInfo.lbl_TerminosDB + "</a>";
            enlace = enlace.replace("[terminosbd]", enlace_complete);
            this.screenLangInfo.lbl_TerminosyCondiciones = this.showHTML(enlace);
          } else {
            var enlace = this.screenLangInfo.lbl_TerminosyCondiciones;

            var hostComplete = window.location.protocol + "//" + window.location.host + window.location.pathname;
            var n = hostComplete.lastIndexOf("\/");
            hostComplete = hostComplete.substring(0, n);
            var n1 = hostComplete.lastIndexOf("\/");
            hostComplete = hostComplete.substring(0, n1) + "/assets/error.html";

            var caminoerror = hostComplete;
            var enlace_complete = "<a target='_blank' href='" + caminoerror + "'>" + this.screenLangInfo.lbl_TerminosDB + "</a>";

            enlace = enlace.toString().replace("[terminosbd]", enlace_complete);
            enlace = enlace.toString().replace("\r\n", "<br/>");
            let enlaceSan = this.getHtml(enlace)

            this.screenLangInfo.lbl_TerminosyCondiciones = enlaceSan
          }

          this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]", this.cantidadPasajeros.toString());
          this.screenLangInfoPax = screenInfoPax;
          this.cotResume = this.resumenPasajero;
          if (this.cotResume != undefined) {
            this.finalpricelocal = this.cotResume.totalReserva.precio.valorLocalString;
            this.finalprice = this.cotResume.totalReserva.precio.valorPrincipalString;
          }
          this.loadingLabels = false;
        },
        (error: HttpErrorResponse) => {
          // Repetido para cuando da error
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

    this.adminService.GetResumenCotizacion(resumeFilterff).subscribe(
      (cotResumenff) => {
        this.loading_one = true
        if (this.itinerary.nnoches == '1') {
          var noche = this.screenLangInfo.lbl_noche;
          this.screenLangInfo.lbl_nochesEnEl = noche;

        }

        if (this.screenLangInfo != null) {
          this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
        }

        if (this.xcabinaxpasajero != undefined) {
          this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]", this.cantidadPasajeros.toString());
        }

        this.resumenPasajero = cotResumenff;
        this.resumenPasajeroff = cotResumenff;

        this.cotResume = this.resumenPasajero;
        this.finalpricelocal = this.cotResume.totalReserva.precio.valorLocalString;
        this.finalprice = this.cotResume.totalReserva.precio.valorPrincipalString;
        this.loadingLabels = false;


        this.IdCotizacion = cotResumenff.idCotizacion;
        resumeFiltervf.IdCotizacion = this.IdCotizacion;
        resumeFiltervv.IdCotizacion = this.IdCotizacion;
        resumeFilterfv.IdCotizacion = this.IdCotizacion;
        this.reservation.idCotizacion =  this.IdCotizacion;
        this.userPreferences.setElement("Reservation", this.reservation);
        this.reservation = this.userPreferences.getElement("Reservation");

        this.adminService.GetResumenCotizacion(resumeFiltervf)
          .subscribe(
            (cotResumenvf) => {
              this.loading_two = true
              if (this.itinerary.nnoches == '1') {
                var noche = this.screenLangInfo.lbl_noche;
                this.screenLangInfo.lbl_nochesEnEl = noche;

              }
              if ((this.screenLangInfo.lbl_PorCabinaXPasajeros != null || this.screenLangInfo.lbl_PorCabinaXPasajeros != undefined) &&
                (this.screenLangInfo != null || this.screenLangInfo != undefined)) {
                this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
              }



              this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]", this.cantidadPasajeros.toString());

              this.resumenPasajerovf = cotResumenvf;

              this.cotResume = this.resumenPasajero;
              if (this.cotResume != undefined || this.cotResume != null) {
                this.finalpricelocal = this.cotResume.totalReserva.precio.valorLocalString;
                this.finalprice = this.cotResume.totalReserva.precio.valorPrincipalString;
              }
              this.loadingLabels = false;
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
              this.loading_two = true
            });
        
        this.adminService.GetResumenCotizacion(resumeFiltervv)
          .subscribe(
            (cotResumenvv) => {
              this.loading_three = true
              if (this.itinerary.nnoches == '1') {
                var noche = this.screenLangInfo.lbl_noche;
                this.screenLangInfo.lbl_nochesEnEl = noche;
              }
              if ((this.screenLangInfo.lbl_PorCabinaXPasajeros != null || this.screenLangInfo.lbl_PorCabinaXPasajeros != undefined) &&
                (this.screenLangInfo != null || this.screenLangInfo != undefined)) {
                this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
              }

              this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]", this.cantidadPasajeros.toString());
              this.resumenPasajerovv = cotResumenvv;
              this.cotResume = cotResumenvv;
              if (this.cotResume != undefined || this.cotResume != null) {

                this.finalpricelocal = this.cotResume.totalReserva.precio.valorLocalString;
                this.finalprice = this.cotResume.totalReserva.precio.valorPrincipalString;
                var existeseguro = false;
                var existepropina = false;
                                if (this.cotResume.bloquesPasajeros.length > 0) {
                  if (this.cotResume.bloquesPasajeros[0].precios.length > 0) {
                    for (let i = 0; i < this.cotResume.bloquesPasajeros[0].precios.length; i++) { 
                      if (this.cotResume.bloquesPasajeros[0].precios[i].tipo == "11" && this.cotResume.bloquesPasajeros[0].precios[i].precio.valorPrincipal != 0) {
                        existeseguro = true;
                      }
                      if (this.cotResume.bloquesPasajeros[0].precios[i].tipo == "5" && this.cotResume.bloquesPasajeros[0].precios[i].precio.valorPrincipal != 0) {
                        existepropina = true;
                      }
                    }
                  }
                }
                this.mostrarpropinas = this.ConfirmSeguros( this.mostrarpropinas, existepropina)
                this.mostrarSeguro = this.ConfirmSeguros(existeseguro, this.showTip.mostrarPedirSeguros)
                if (!this.mostrarSeguro) {
                  this.userPreferences.setElement("SeguroIncluido", this.mostrarSeguro);
                }
                if (!this.mostrarpropinas) {
                  this.userPreferences.setElement("PropinaIncluida", this.mostrarpropinas);
                }
              }
              this.loadingLabels = false;
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
              this.loading_three = true
            });


        this.adminService.GetResumenCotizacion(resumeFilterfv).subscribe(
          (cotResumenfv) => {

            this.loading_four = true
            if (this.itinerary.nnoches == '1') {
              var noche = this.screenLangInfo.lbl_noche;
              this.screenLangInfo.lbl_nochesEnEl = noche;

            }
            
            if ((this.screenLangInfo.lbl_PorCabinaXPasajeros != null || this.screenLangInfo.lbl_PorCabinaXPasajeros != undefined) &&
              (this.screenLangInfo != null || this.screenLangInfo != undefined)) {
              this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
            }


            this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]", this.cantidadPasajeros.toString());

            this.resumenPasajerofv = cotResumenfv;

            this.cotResume = this.resumenPasajero;
            if (this.cotResume != undefined || this.cotResume != null) {
              this.finalpricelocal = this.cotResume.totalReserva.precio.valorLocalString;
              this.finalprice = this.cotResume.totalReserva.precio.valorPrincipalString;
            }
            this.loadingLabels = false;
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
            this.loading_four = true
          });
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
        this.loading_one = true
      });



  }
  InitPassenger() {
    if (!this.reservation) {
      this.reservation = {};
    }
    if (this.reservation.pasajeros) {
      this.pasajeros = this.reservation.pasajeros;
    }
    else {
      for (let index = 0; index < 2; index++) {
        var current_passenger: any = {};
        current_passenger.edad = "";
        this.pasajeros.push(current_passenger);
      }

      for (let index = 0; index < this.pasajeros.length; index++) {
        var edad = String(this.pasajeros[index].edad);
        if (!this.pasajeros[index].titulo) {
          this.pasajeros[index] =
          {
            titulo: this.screenLangInfo.comboTitulo[0].id,
            nombre: "",
            apellido: "",
            fechaNacimiento: null,
            tipoDocumento: this.screenLangInfo.comboDocumento[0].id,
            numeroDocumento: "",
            nacionalidad: this.nationalityInfo[0].descripcion,
            correo: "",
            edad: String(edad)
          };
        }
      }
    }

  }
  ChangePassData(e: any, campo: string, index: number) {
    if (campo == "Nombres")
      this.pasajeros[index].nombre = e.target.value;
    else if (campo == "Apellidos")
      this.pasajeros[index].apellido = e.target.value;
    else if (campo == "FechaNac")
      this.pasajeros[index].fechaNacimiento = e.target.value;
    else if (campo == "NumDoc")
      this.pasajeros[index].numeroDocumento = e.target.value;
    else if (campo == "Correo")
      this.pasajeros[index].correo = e.target.value;
  }

  ChangeSeguro(Event) {
    if (Event.currentTarget.checked == true) {
      this.seguro = true;
    } else {
      this.seguro = false;
    }
    this.userPreferences.setElement("SeguroIncluido", this.seguro);
    this.RevisarSeguroPropina(this.seguro, this.propina);
  }
  ChangePropina(Event) {
    if (Event.currentTarget.checked == true) {
      this.propina = true;
    } else {
      this.propina = false;
    }
    this.userPreferences.setElement("PropinaIncluida", this.propina);
    this.RevisarSeguroPropina(this.seguro, this.propina);
  }

  RevisarSeguroPropina(seguroE, propinaE) {
    if (seguroE == true && propinaE == true) {
      this.resumenPasajero = this.resumenPasajerovv;
      this.cotResume = this.resumenPasajero;
      this.finalpricelocal = this.cotResume.totalReserva.precio.valorLocalString;
      this.finalprice = this.cotResume.totalReserva.precio.valorPrincipalString;
    }
    if (seguroE == true && propinaE == false) {
      this.resumenPasajero = this.resumenPasajerovf;
      this.cotResume = this.resumenPasajero;
      this.finalpricelocal = this.cotResume.totalReserva.precio.valorLocalString;
      this.finalprice = this.cotResume.totalReserva.precio.valorPrincipalString;
    }
    if (seguroE == false && propinaE == true) {
      this.resumenPasajero = this.resumenPasajerofv;
      this.cotResume = this.resumenPasajero;
    }
    if (seguroE == false && propinaE == false) {
      this.resumenPasajero = this.resumenPasajeroff;
      this.cotResume = this.resumenPasajero;
    }

    this.finalpricelocal = this.cotResume.totalReserva.precio.valorLocalString;
    this.finalprice = this.cotResume.totalReserva.precio.valorPrincipalString;
  }
  UpdateReservation() {
    if (!this.reservation) {
      this.reservation = {};
    }
    this.reservation.idCotizacion = this.IdCotizacion;
    this.userPreferences.setElement("Reservation", this.reservation);
  }
  ChangeSelectValue(e: any, campo: string, index: number) {
    var selectIndex = e.target.options.selectedIndex;
    if (campo == "Titulo")
      this.pasajeros[index].titulo = this.screenLangInfo.comboTitulo[selectIndex].id;
    else if (campo == "TipoDoc")
      this.pasajeros[index].tipoDocumento = this.screenLangInfo.comboDocumento[selectIndex].id;
    else if (campo == "Nacionalidad")
      this.pasajeros[index].nacionalidad = this.nationalityInfo[selectIndex].descripcion;
  }
  CheckRequiredData(): any {

    var phonere = /^[\+]?[1234567890]*$/;
    var result = true;
    if (this.showagencytravel == true) {
      if (!this.datosagentesviaje.DireccionAgencia || !this.datosagentesviaje.NombreAgencia || !this.datosagentesviaje.NombreAgente || !this.datosagentesviaje.TelefonoAgencia) {
        this.messageService.generalMessage('error', "Faltan datos del agente de viajes");

        result = false;
      }

    }

    if (this.showagencytravel == true) {
      var agentetelef = this.datosagentesviaje.TelefonoAgencia;
      if (!phonere.test(agentetelef)) {
        this.messageService.generalMessage('error', "El telefono del agente no es correcto");

        result = false;
      }

    }
    return result;
  }
  CheckMail(): any {


    return true;
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
  BuildFilterCabinas(metaCategoria: string): any {
    var precio = this.BuildPrecios(metaCategoria);
    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    var arreglosinloyalty = []
    for (var key in this.reservation.pasajeros) {
      arreglosinloyalty.push({
        "edad": String(this.reservation.pasajeros[key].edad),
        "loyaltyNumber": "",
        "codigoPromocional": ""
      })
    }
    var d = this.sailDate;
    var fechaArreglo = d.split("-");
    var fechaSalida = [fechaArreglo[2], fechaArreglo[1], fechaArreglo[0]].join('-');
    var currentFilter =
    {
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      Nnoches: this.itinerary.nnoches.toString(),
      SalidaCode: this.selectedDate.idSalidas.toString(),
      PuertoSalidaCode: this.itinerary.departurePortCode,
      //Saildate: fechaSalida,
      SailDate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(metaCategoria),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      CantPasajeros: this.cantPasajeros.toString(),
      ListaPasajeros: arreglosinloyalty,
      CategoriaCabina: this.selectedCabin.categoria,
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.selectedCabin.priceProgramId,
    };
    return currentFilter;
  }
  transformStyle(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  SendMail() {
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
      CorreoResumen: '',
      ListaPasajeros: this.pasajeros,
      TipoSubjectTarget: '1',
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipalString,
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipalString,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
        ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.selectedCabin.priceProgramId,
      NoCabina: this.selectedCabin.cabinNumber,
      TooltipsNRF: '',
      IsNRF: this.selectedCabin.esNRF,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
      ENews: enews
    };

    this.UpdateReservation();
    this.userPreferences.setElement("backReservationSummary", true);
    this.userPreferences.setElement("AgentesDeViaje", this.datosagentesviaje);
    this.router.navigate(['cruisebrowser', 'reservationsummary']);
  }
  BuildSailDate() {
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split("-");
      this.sailDate = split[0] + "-" + split[1] + "-" + split[2];
    }
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
  getHtml(html) {
    return this.sanitized.bypassSecurityTrustHtml(html);
  }
  ChangeTermAndConditions(Event) {
    this.acceptTermConditions = Event.currentTarget.checked;
    this.userPreferences.setElement("acceptTermConditions", this.acceptTermConditions);
  }

  ChangeENews(Event) {
    this.enewsSave = Event.currentTarget.checked;
    this.userPreferences.setElement("enews", Event.currentTarget.checked);
  }
  //SECTION AGENTE DE VIAJES
  ChangeAgencyData(Event, campo) {
    if (campo == "nombreagencia") {
      this.datosagentesviaje.NombreAgencia = Event.target.value;
    }
    if (campo == "direccionagencia") {
      this.datosagentesviaje.DireccionAgencia = Event.target.value;
    }
    if (campo == "nombreagente") {
      this.datosagentesviaje.NombreAgente = Event.target.value;
    }
    if (campo == "telefonoagencia") {
      this.datosagentesviaje.TelefonoAgencia = Event.target.value;
    }
    this.userPreferences.setElement("AgentesDeViaje", this.datosagentesviaje);
    this.ValidateFormAgenciaViajes();
  }

  ValidateAgenciaViajesData(campo) { 
    var isValid: Boolean = false;
    if (campo == "nombreagencia") {
      isValid = (!!(typeof this.datosagentesviaje.NombreAgencia != 'undefined' && this.datosagentesviaje.NombreAgencia)) || this.ValidarVaciosyTC();
    }
    if (campo == "direccionagencia") {
      isValid = !!(typeof this.datosagentesviaje.DireccionAgencia != 'undefined' && this.datosagentesviaje.DireccionAgencia) || this.ValidarVaciosyTC();
    }
    if (campo == "formato_direccionagencia") {
      if (!!(typeof this.datosagentesviaje.DireccionAgencia != 'undefined' && this.datosagentesviaje.DireccionAgencia)) {
        isValid = (new RegExp('^[A-Za-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')).test(this.datosagentesviaje.DireccionAgencia);
      }
      else {
        isValid = this.ValidarVaciosyTC();
      }
    }
    if (campo == "nombreagente") {
      isValid = !!(typeof this.datosagentesviaje.NombreAgente != 'undefined' && this.datosagentesviaje.NombreAgente) || this.ValidarVaciosyTC();
    }
    if (campo == "formato_telefonoagencia") {
      if (!!(typeof this.datosagentesviaje.TelefonoAgencia != 'undefined' && this.datosagentesviaje.TelefonoAgencia)) {
        isValid = (new RegExp('^[\+]?[1234567890 ]*$')).test(this.datosagentesviaje.TelefonoAgencia);
      }
      else{
        isValid = this.ValidarVaciosyTC()
      } 
    }
    if (campo == "telefonoagencia") {
      isValid = !!(typeof this.datosagentesviaje.TelefonoAgencia != 'undefined' && this.datosagentesviaje.TelefonoAgencia) || this.ValidarVaciosyTC();
    }
    return !isValid;
  }

  ValidateFormAgenciaViajes() {
    var isValid1 = !!(typeof this.datosagentesviaje.NombreAgencia != 'undefined' && this.datosagentesviaje.NombreAgencia);
    var isValid2 = !!(typeof this.datosagentesviaje.DireccionAgencia != 'undefined' && this.datosagentesviaje.DireccionAgencia);
    var isValid3 = !!(typeof this.datosagentesviaje.TelefonoAgencia != 'undefined' && this.datosagentesviaje.TelefonoAgencia);
    var isValid4 = (new RegExp('^[\+]?[1234567890 ]*$')).test(this.datosagentesviaje.TelefonoAgencia);
    var isValid6 = (new RegExp('^[A-Za-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')).test(this.datosagentesviaje.DireccionAgencia);
    var isValid5 = !!(typeof this.datosagentesviaje.NombreAgente != 'undefined' && this.datosagentesviaje.NombreAgente);
    this.agencytravelIsValid = isValid1 && isValid2 && isValid3 && isValid4 && isValid5 && isValid6;
  }

  isEmptyObject(obj) {
    var NombreAgencia;
    for (NombreAgencia in obj) {
      if (obj.hasOwnProperty(NombreAgencia)) {
        if (obj.NombreAgencia != "") {
          return false;
        }
      }
    }
    return true;
  }
  ValidarVaciosyTC() {
    var isValid1 = !!(typeof this.datosagentesviaje.NombreAgencia != 'undefined' && this.datosagentesviaje.NombreAgencia);
    var isValid2 = !!(typeof this.datosagentesviaje.DireccionAgencia != 'undefined' && this.datosagentesviaje.DireccionAgencia);
    var isValid3 = !!(typeof this.datosagentesviaje.TelefonoAgencia != 'undefined' && this.datosagentesviaje.TelefonoAgencia);
    var isValid5 = !!(typeof this.datosagentesviaje.NombreAgente != 'undefined' && this.datosagentesviaje.NombreAgente);
    return !(!(isValid1 && isValid2 && isValid3 && isValid5) && this.acceptTermConditions);
  }
  ShowAgencyTravelData(Event) {
    this.chequeadoTravel = Event.currentTarget.checked;
    this.userPreferences.setElement("checkagenteViajes", this.chequeadoTravel);
    this.ValidateFormAgenciaViajes();
  }

  EmitValidData() {
    return this.acceptTermConditions && (this.mostraragentesviajes && this.chequeadoTravel ? this.agencytravelIsValid : true);
  }
  // FIN AGENTE DE VIAJES
}
