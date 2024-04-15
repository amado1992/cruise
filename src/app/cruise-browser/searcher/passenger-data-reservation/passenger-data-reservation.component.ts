import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin, from, Subscription } from 'rxjs';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { MessageService } from 'src/app/services/message.service';
import { Pasajero } from 'src/app/models/Pasajero.model';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ChoiceCabinComponent } from '../choice-cabin/choice-cabin.component';
import { ShowCabinComponent } from '../show-cabin/show-cabin.component';
import { DomSanitizer } from '@angular/platform-browser';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Reservacion } from 'src/app/models/Reservacion.model';
import { ItineraryinfoComponent } from '../itineraryinfo/itineraryinfo.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { C } from '@angular/core/src/render3';
import { CallCenterComponent } from '../call-center/call-center.component';
import { ErrorWindowComponent } from '../error-window/error-window.component';
import { min } from 'rxjs-compat/operator/min';
import { Agencia, AgenciaService } from 'src/app/services/DataServices/agencia.service';
@Component({
  selector: 'app-passenger-data-reservation',
  templateUrl: './passenger-data-reservation.component.html',
  styleUrls: ['./passenger-data-reservation.component.scss']
})
export class PassengerDataReservationComponent implements OnInit {
  public getScreenWidth: any;
  public getScreenHeight: any;
  copiaArray: any[] = []
  reservaMode: any
  arrayNotifierCopy: any = []
  arrayNotifier: any = []
  /*dataNotifier = {
    index: -1,
    field: "",
    required: false,
    min: false,
    max: false,
    letter: false,
    email: false,
    phone: false,
    date: false
  }*/

  @ViewChild('myTemplate') customTemplate: TemplateRef<any>;
  errorDifferenceEdad: boolean = false
  lbl_l_ValidacionFNac_Error: any
  lbl_l_ValidacionFNac_Pregunta: any
  lbl_l_ValidacionFNac_Comentario: any

  lbl_button_Cancelar: any
  lbl_button_Continuar: any

  closeResult: any = ""
  PaxTotal: any;
  loadingLabels: boolean;
  errorLoadingLabels: boolean;
  nationalityInfo: any = null;
  dataSubscription: Subscription;
  modalSubscription: Subscription;
  screenLangInfo: any = null;
  messageValidate: any
  itinerary: any;
  selectedDate: any;
  cotizaronline: any;
  automaticabin: any;
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
  selectedDateCategoryData: any;
  cambioEdadInicial: boolean = false;
  initSearch: string;
  validationData = false;
  selectedCategoryRoom: string = 'Interior';
  pasajeros: any[] = [];
  turnoscomida: any[] = [];
  IdCotizacion: string;
  errorObligatorios: string;
  errorFormatoCorreo: string;
  rateTitle: string;
  cantPasajeros: any;
  xcabinaxpasajero: any;
  priceprogramid: any;
  PaxNameWithoutNumber: any;
  PaxLastNameWithoutNumber: any;
  PaxFecNacObligatoria: any;
  PaxCorreoObligatorio: any;
  PaxPhoneObligatorio: any;
  PaxEdadFNacNoConcuerda: any;
  mostrarcallcenter: any;
  experienciatitle: any;
  experienciaicon: any;
  experienciadescription: any;
  tipo_ventana: string = "";
  getPreDataTarifas: any;
  activeAgencia: Agencia;
  
  constructor(private router: Router, private adminService: AdminUsersService, private modalService: NgbModal,
    private messageService: MessageService, private userPreferences: UserPreferencesService, private sanitized: DomSanitizer,private agenciaService: AgenciaService) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }

  showVentana() {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(CallCenterComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenInfoCallCenter = "";
    this.modalSubscription = from(modalRef.result).subscribe();

  }

  showError(errorValue) {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ErrorWindowComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenError = errorValue;
    this.modalSubscription = from(modalRef.result).subscribe();

  }

  transformStyle(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;


  }
  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.tipo_ventana = this.tipo_ventana = "PaxDataReservaOnline";    
    this.activeAgencia = this.agenciaService.getAgenciabyurl(this.userPreferences.getUrlConexion());

    this.reservaMode = this.userPreferences.getElement("BookingMode")
    this.itinerary = this.userPreferences.getElement("Itinerary");
    var cabina = this.userPreferences.getElement('Experiencia');

    if ((this.itinerary.company == 'MSC') && (cabina != null)) {
      this.experienciatitle = cabina.titulo;
      this.experienciadescription = cabina.descripion;
      this.experienciaicon = cabina.urlIcon;
    }
    this.mostrarcallcenter = this.activeAgencia.MostrarCallCenter;
    this.cotizaronline = this.userPreferences.getElement("CotizarOnline");
    this.PaxTotal = this.userPreferences.getElement("PaxTotal");
    this.automaticabin = this.userPreferences.getElement("AutomaticCabin");
    this.selectedDate = this.userPreferences.getElement("SelectedDate");

    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.cantPasajeros = this.userPreferences.getElement("PaxTotal");
    this.priceprogramid = this.userPreferences.getElement('priceProgramId');
    this.getPreDataTarifas = this.userPreferences.getElement("preDataTarifas");

    this.pasajeros = this.reservation.pasajeros.slice()
    this.SelectCategoryData();
    this.BuildSailDate();
    this.InitData();

  }

  initServiceError() {
    var metacategoria = "";
    if (this.selectedCabin.metacategoria == "S") {
      metacategoria = "Suite";
    }
    if (this.selectedCabin.metacategoria == "B") {
      metacategoria = "Balcon";
    }
    if (this.selectedCabin.metacategoria == "E") {
      metacategoria = "Exterior";
    }
    if (this.selectedCabin.metacategoria == "I") {
      metacategoria = "Interior";
    }
    const sourcescabins = [
      this.adminService.setHoldCabina(this.BuildFilterCabinas(metacategoria)),
      this.adminService.GetErrorMessage('0', 'ErrDatosObligIncompletos'),
      this.adminService.GetErrorMessage('0', 'PaxNameWithoutNumber'),
      this.adminService.GetErrorMessage('0', 'PaxLastNameWithoutNumber'),
      this.adminService.GetErrorMessage('0', 'PaxFecNacObligatoria'),
      this.adminService.GetErrorMessage('0', 'PaxCorreoObligatorio'),
      this.adminService.GetErrorMessage('0', 'PaxPhoneObligatorio'),
      this.adminService.GetErrorMessage('0', 'PaxEdadFNacNoConcuerda'),
      this.adminService.GetScreenValidationLocale()

    ];
    this.dataSubscription = forkJoin(sourcescabins)
      .subscribe(
        ([respuesta, erroresdatos, e1, e2, e3, e4, e5, e6, messageValidate]: any[]) => {
          this.messageValidate = messageValidate
          this.errorObligatorios = erroresdatos.value; // Cambio de .value; // Cambio de .Value
          this.PaxNameWithoutNumber = e1;
          this.PaxLastNameWithoutNumber = e2;
          this.PaxFecNacObligatoria = e3;
          this.PaxCorreoObligatorio = e4;
          this.PaxPhoneObligatorio = e5;
          this.PaxEdadFNacNoConcuerda = e6;
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
        });
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
  SelectCategoryData() {
    var date = this.selectedDate;
    if (this.selectedCategoryRoom == 'Interior') {
      this.selectedDateCategoryData = date.cabinasMasBaratas[0].precioCabinaPax;
    }
    else if (this.selectedCategoryRoom == 'Exterior') {
      this.selectedDateCategoryData = date.cabinasMasBaratas[1].precioCabinaPax;
    }
    else if (this.selectedCategoryRoom == 'Balcon') {
      this.selectedDateCategoryData = date.cabinasMasBaratas[2].precioCabinaPax;
    }
    else {
      this.selectedDateCategoryData = date.cabinasMasBaratas[3].precioCabinaPax;
    }
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
    const sources = [
      this.adminService.GetScreenPaxDataLocale(),
      this.adminService.GetImagenBarco(shipFilter),
      this.adminService.GetImagenDesgolse(),
      this.adminService.GetErrorMessage('0', 'InfoVolverAEmpezar'),
      this.adminService.GetScreenValidationLocale()
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo, shipUrl, desgUrl, initSearch, messageValidate]: any[]) => {

          this.messageValidate = messageValidate
          this.screenLangInfo = screenInfo;
          if (this.itinerary.nnoches == '1') {
            var noche = this.screenLangInfo.lbl_noche;
            this.screenLangInfo.lbl_nochesEnEl = noche;

          }

          this.lbl_button_Cancelar = screenInfo.lbl_button_Cancelar
          this.lbl_button_Continuar = screenInfo.lbl_button_Continuar

          this.lbl_l_ValidacionFNac_Error = screenInfo.lbl_l_ValidacionFNac_Error
          this.lbl_l_ValidacionFNac_Pregunta = screenInfo.lbl_ValidacionFNac_Pregunta
          this.lbl_l_ValidacionFNac_Comentario = screenInfo.lbl_l_ValidacionFNac_Comentario

          this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
          this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]", this.cantPasajeros.toString());
          this.urlShip = shipUrl.value; // Cambio de .value; // Cambio de .Value
          this.urlDesg = desgUrl.value; // Cambio de .value; // Cambio de .Value
          if (initSearch.value) {
            this.initSearch = initSearch.value; // Cambio de .value; // Cambio de .Value
          }
          this.cleanTitleRate = '<strong>' + this.screenLangInfo.lbl_tarifa + ':</strong> ' + this.reservation.rate.tarifa.titulo;
          var cleanIntermediate = this.cleanTitleRate.toString();
          cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
          this.cleanTitleRate = cleanIntermediate;
          this.cleanTitleRate = this.transform(this.cleanTitleRate + "&nbsp;");
          this.cleanDescriptionRate = '<img *ngIf="this.reservation.rate.tarifa.icon" src="' + this.reservation.rate.tarifa.icon + '"style="max-height: 35px; min-width: 5px;">' + this.reservation.rate.tarifa.descripcion;
          var cleanIntermediate = this.cleanDescriptionRate.toString();
          cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
          this.cleanDescriptionRate = cleanIntermediate;
          this.cleanDescriptionRate = this.transform(this.cleanDescriptionRate);

          this.initServiceError()
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
  ShowItinerary(value: boolean) {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ItineraryinfoComponent, { size: 'lg', centered: true });
    (<ItineraryinfoComponent>modalRef.componentInstance).tabItinerary = value;
    this.modalSubscription = from(modalRef.result).subscribe();
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
      Saildate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(metaCategoria),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      CantPasajeros: this.PaxTotal.toString(),
      //ListaPasajeros: arreglosinloyalty,
      ListaPasajeros: this.reservation.pasajeros,
      CategoriaCabina: this.selectedCabin.categoria,
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid,
      NoCabina: this.selectedCabin.cabinNumber,
      FunctionalBranch: this.reservaMode
    };
    return currentFilter;
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

  CambioEdad(child) {
    this.cambioEdadInicial = child;
  }

  PassengersNumber() {
    this.router.navigate(['cruisebrowser', 'passengersnumber']);
  }
  ShowSearch() {
    this.router.navigate(['cruisebrowser', 'searcher']);
  }

  InitPassenger() {
    if (!this.reservation) {
      this.reservation = {};
    }
    if (this.reservation.pasajeros) {
      this.pasajeros = this.userPreferences.getElement("Reservation").pasajeros;
      for (let index = 0; index < this.pasajeros.length; index++) {
        this.pasajeros[index].titulo = this.pasajeros[index].titulo && this.pasajeros[index].titulo != null && this.pasajeros[index].titulo != '' ? this.pasajeros[index].titulo : this.screenLangInfo.comboTitulo[0].descripcion;
        this.pasajeros[index].tipoDocumento = this.pasajeros[index].tipoDocumento && this.pasajeros[index].tipoDocumento != null && this.pasajeros[index].tipoDocumento != '' ? this.pasajeros[index].tipoDocumento : this.screenLangInfo.comboDocumento[0].descripcion;
        this.pasajeros[index].TurnoComida = this.pasajeros[index].TurnoComida ? this.pasajeros[index].TurnoComida : this.turnoscomida.length > 0 ? this.turnoscomida[0].diningId : "";
        this.pasajeros[index].nacionalidad = this.pasajeros[index].nacionalidad && this.pasajeros[index].nacionalidad != null && this.pasajeros[index].nacionalidad != '' ? this.pasajeros[index].nacionalidad : this.activeAgencia.AgenciaNombrePais && this.activeAgencia.AgenciaNombrePais != null && this.activeAgencia.AgenciaNombrePais != '' ? this.activeAgencia.AgenciaNombrePais : this.nationalityInfo[0].descripcion;
      }
    }
    else {
      for (let index = 0; index < this.PaxTotal.toString(); index++) {
        var current_passenger: any = {};
        current_passenger.edad = "";
        this.pasajeros.push(current_passenger);
      }
      for (let index = 0; index < this.pasajeros.length; index++) {
        this.pasajeros[index] =
        {
          titulo: this.screenLangInfo.comboTitulo[0].descripcion,
          nombre: '',
          apellido: '',
          fechaNacimiento: '',
          tipoDocumento: this.screenLangInfo.comboDocumento[0].descripcion,
          numeroDocumento: '',
          nacionalidad: this.activeAgencia.AgenciaNombrePais && this.activeAgencia.AgenciaNombrePais != null && this.activeAgencia.AgenciaNombrePais != '' ? this.activeAgencia.AgenciaNombrePais : this.nationalityInfo[0].descripcion,
          correo: '',
          edad: '',
          telefono: '',
          loyaltyNumber: this.reservation.pasajeros[index].LoyaltyNumber != undefined ? this.reservation.pasajeros[index].LoyaltyNumber : this.reservation.pasajeros[index].loyaltyNumber,
          codigoPromocional: this.reservation.pasajeros[index].codigoPromocional,
          TurnoComida: this.turnoscomida.length > 0 ? this.turnoscomida[0].diningId : ""
        };
      }
    }

  }
  ChangePassData(e: any, campo: string, index: number) {
    if (campo == "Nombres")
      this.pasajeros[index].nombre = e.target.value; // Cambio de .value; // Cambio de .Value
    else if (campo == "Apellidos")
      this.pasajeros[index].apellido = e.target.value; // Cambio de .value; // Cambio de .Value
    else if (campo == "FechaNac") {
      this.pasajeros[index].fechaNacimiento = e.target.value; // Cambio de .value; // Cambio de .Value
      let currentTime = new Date().getTime();
      let birthDateTime = new Date(this.pasajeros[index].fechaNacimiento).getTime();
      let difference = (currentTime - birthDateTime)
      var ageInYears = Math.round(difference / (1000 * 60 * 60 * 24 * 365));
      if (ageInYears! = this.pasajeros[index].edad) { alert("edad"); }
      this.pasajeros[index].edad = String(ageInYears);
    } else if (campo == "NumDoc")
      this.pasajeros[index].numeroDocumento = e.target.value; // Cambio de .value; // Cambio de .Value
    else if (campo == "Correo")
      this.pasajeros[index].correo = e.target.value; // Cambio de .value; // Cambio de .Value
    else if (campo == "Telefono")
      this.pasajeros[index].telefono = e.target.value; // Cambio de .value; // Cambio de .Value


    /* this.CheckRequiredDataFinal();
     this.reservation.pasajeros = this.pasajeros;
     this.userPreferences.setElement("Reservation", this.reservation);*/
  }
  UpdateReservation() {
    if (!this.reservation) {
      this.reservation = {};
    }
    this.reservation.pasajeros = this.pasajeros;
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
  dataLoaded(child) {
    this.pasajeros = child;

    this.reservation.pasajeros = this.pasajeros;
    this.userPreferences.setElement("Reservation", this.reservation);
    this.CheckRequiredDataFinal();
  }

  TerminaCarga(child) {
    this.loadingLabels = false;
  }

  showHTML(valor) {

    var cleanIntermediate = valor.toString();

    cleanIntermediate = cleanIntermediate.toString().replace("\r\n", "<br/>");

    let cleanText = cleanIntermediate;
    cleanText = this.transform(cleanText);
    return cleanText;
  }

  difference(date1, date2) {
    const date1utc = date1.getFullYear();
    const date2utc = date2.getFullYear()
    return Math.abs(date1utc - date2utc)
  }

  ShowReserveConfirmationOld() {

    let date = new Date();
    let permitePaxNumber = this.userPreferences.getElement("permitePaxNumber")

    let countAge = 0

    for (let i = 0; i < this.pasajeros.length; i++) {

      if (this.pasajeros[i].fechaNacimiento) {
        let date2 = new Date(this.pasajeros[i].fechaNacimiento)

        let time_difference = this.difference(date, date2)

        if (time_difference < this.pasajeros[i].edad) {
          let differenceAge = Math.abs(this.pasajeros[i].edad - time_difference)
          if (differenceAge > 1) {
            countAge++

          }
        }
        if (time_difference > this.pasajeros[i].edad) {
          countAge++

        }

      }
    }

    if (countAge > 0) {
      this.errorDifferenceEdad = true

      this.modalService.open(this.customTemplate, { centered: true }).result.then((result) => {
        this.closeResult = result
        if (this.closeResult == "Ok") {
          if (this.CheckRequiredDataFinal()) {
            if (this.CheckMailOld()) {
              this.SendMail();
              this.router.navigate(['cruisebrowser', 'cotizationselection']);
            }
            else {
              this.messageService.generalMessage('error', this.errorFormatoCorreo ? this.errorFormatoCorreo : 'El correo no tiene un formato válido.');
            }
          }
          else {
            this.messageService.generalMessage('error', this.errorObligatorios ? this.errorObligatorios : 'Campos obligatorios no especificados.');
          }
        }
      }, (reason) => {

      });

    } else {
      this.closeResult = "Ok"
      if (this.CheckRequiredDataFinal()) {
        if (this.CheckMailOld()) {
          this.SendMail();
          this.router.navigate(['cruisebrowser', 'cotizationselection']);
        }
        else {
          this.messageService.generalMessage('error', this.errorFormatoCorreo ? this.errorFormatoCorreo : 'El correo no tiene un formato válido.');
        }
      }
      else {
        this.messageService.generalMessage('error', this.errorObligatorios ? this.errorObligatorios : 'Campos obligatorios no especificados.');
        //this.messageService.generalMessage('error', "DATA INVALID")
      }
    }


    /* if (this.CheckRequiredDataFinal()) {
       if (this.CheckMail()) {
         this.SendMail();
       }
       else {
         this.messageService.generalMessage('error', this.errorFormatoCorreo ? this.errorFormatoCorreo : 'El correo no tiene un formato válido.');
       }
     }
     else {
        this.messageService.generalMessage('error', this.errorObligatorios ? this.errorObligatorios : 'Campos obligatorios no especificados.');
     }*/

  }


  ShowReserveConfirmation() {

    var countAge
    var countAgeCopy

    if (this.CheckRequiredDataFinal()) {

      //countAge = this.updatePassenger()
      if (this.cambioEdadInicial) {
        this.errorDifferenceEdad = true

        this.modalService.open(this.customTemplate, { centered: true }).result.then((result) => {
          this.closeResult = result
          if (this.closeResult == "Ok") {
            this.pasajeros = this.copiaArray.slice()
            this.UpdateReservation();
            this.router.navigate(['cruisebrowser', 'cotizationselection']);
          }
        }, (reason) => {

        });

      } else {
        this.closeResult = "Ok"
        this.UpdateReservation();
        this.router.navigate(['cruisebrowser', 'cotizationselection']);
      }
      // }
    }

  }

  updatePassenger() {
    var date = new Date();
    var countAge = 0
    var array = this.userPreferences.getElement("Reservation");
    this.copiaArray = array.pasajeros

    for (let i = 0; i < this.copiaArray.length; i++) {

      if (this.copiaArray[i].fechaNacimiento) {
        var date2 = new Date(this.copiaArray[i].fechaNacimiento)

        var time_difference = this.difference(date, date2)

        if (time_difference < this.copiaArray[i].edad) {
          var differenceAge = Math.abs(this.copiaArray[i].edad - time_difference)
          if (differenceAge > 1) {
            countAge++

            this.copiaArray[i].edad = time_difference.toString()//Add
          }
        }
        if (time_difference > this.copiaArray[i].edad) {
          countAge++

          this.copiaArray[i].edad = time_difference.toString()//Add
        }
      }
    }

    return countAge

  }

  updatePassengerCopy() {
    var date = new Date();
    var countAge = 0
    var array = this.userPreferences.getElement("Reservation");
    this.copiaArray = array.pasajeros

    for (let i = 0; i < this.copiaArray.length; i++) {

      if (this.copiaArray[i].fechaNacimiento) {

        var date2 = new Date(this.copiaArray[i].fechaNacimiento)

        var time_difference = this.difference(date, date2)

        if (time_difference < this.copiaArray[i].edad) {
          var differenceAge = Math.abs(parseInt(this.copiaArray[i].edad) - time_difference)
          if (differenceAge > 1) {
            countAge++

            this.copiaArray[i].edad = time_difference.toString()//Add
          }
        }
        if (time_difference > parseInt(this.copiaArray[i].edad)) {
          countAge++

          this.copiaArray[i].edad = time_difference.toString()//Add
        }
      }
    }

  }

  validate() {

    var countAgeCopy = 0
    for (let i = 0; i < this.copiaArray.length; i++) {
      if (parseInt(this.copiaArray[i].edad) > 21) {
        countAgeCopy++
      }
    }

    if (countAgeCopy == 0) {

      if (Object.keys(this.messageValidate).length != 0) {
        this.messageService.generalMessage('error', this.messageValidate.err_maxEdadPasajeros)
      }
    }

    return countAgeCopy
  }


  CheckRequiredDataFinalOld(): any {



    var re = /\S+@\S+\.\S+/;
    var phonere = /^[\+]?[1234567890\ ]*$/;
    var result: boolean = true;
    for (let i = 0; i < this.pasajeros.length; i++) {
      var pasajero: Pasajero = this.pasajeros[i];
      let currentTime = new Date().getTime();
      var phonevalidado = phonere.test(pasajero.telefono);

      let birthDateTime = new Date(pasajero.fechaNacimiento).getTime();
      let difference = (currentTime - birthDateTime)
      var ageInYears = Math.round(difference / (1000 * 60 * 60 * 24 * 365));

      var emailvalidado = re.test(pasajero.correo);

      /*if(pasajero.telefono && !phonevalidado){

        this.messageService.generalMessage('error', "El telefono del pasajero "+String(i + 1)+" no es correcto");

        result = false;
        break;
      } */

      if ((/\d/.test(pasajero.nombre)) || pasajero.nombre == null || pasajero.nombre == "" || pasajero.nombre.trim() == "" || pasajero.nombre.length < 2) {
        result = false;
        var nombre = String(this.PaxNameWithoutNumber.value);
        nombre = nombre.replace("[PaxNumber]", String(i + 1));
        this.messageService.generalMessage('error', nombre);

      }
      else if ((/\d/.test(pasajero.apellido)) || pasajero.apellido == null || pasajero.apellido == "" || pasajero.apellido.trim() == "" || pasajero.apellido.length < 2) {
        result = false;
        var nombre = String(this.PaxLastNameWithoutNumber.value);
        nombre = nombre.replace("[PaxNumber]", String(i + 1));
        this.messageService.generalMessage('error', nombre);
      }
      else if (isNaN(ageInYears) || ageInYears <= 0 || pasajero.fechaNacimiento == null || pasajero.fechaNacimiento == "" || pasajero.fechaNacimiento == "-undefined-undefined" || pasajero.fechaNacimiento == "undefined-undefined-undefined" || pasajero.fechaNacimiento.trim() == "" || pasajero.fechaNacimiento.length < 2) {

        var nombre = String(this.PaxFecNacObligatoria.value);
        nombre = nombre.replace("[PaxNumber]", String(i + 1));
        this.messageService.generalMessage('error', nombre);

        result = false;


      }

      else if (pasajero.correo == null || pasajero.correo == "" || pasajero.correo.trim() == "" || !(emailvalidado)) {
        if (i == 0) {
          var nombre = String(this.PaxCorreoObligatorio.value);
          nombre = nombre.replace("[PaxNumber]", String(i + 1));
          this.messageService.generalMessage('error', nombre);

          result = false;
        }
      }
      else if (!phonevalidado || pasajero.telefono == null || pasajero.telefono == "" || pasajero.telefono.trim() == "") {
        if (i == 0 && (this.itinerary.company == "RCCL" || this.itinerary.company == "AZA" || this.itinerary.company == "CEL")) {
          var nombre = String(this.PaxPhoneObligatorio.value);
          nombre = nombre.replace("[PaxNumber]", String(i + 1));
          this.messageService.generalMessage('error', nombre);
          result = false;
        }
      }

    }
    if (this.pasajeros.length < Number(this.cantPasajeros)) {
      result = false;
    }
    this.validationData = result;
    return result;
  }
  VerifyMandatoryField(noPax: any, field: string): boolean {
    var lista = this.getPreDataTarifas.camposObligatioriosReserva;
    const exist = (element: string) => { return element.toLocaleLowerCase().trim() == field.toLocaleLowerCase().trim() };
    if (lista.length >= 0 && noPax == 0) {

        if (lista[0] != null && lista[0] != "undefined" ||
          lista[0].camposObligatiorios != null ||
          lista[0].camposObligatiorios != ""
        ) {
          if (lista[noPax].camposObligatiorios != null && lista[noPax].camposObligatiorios != "") {
            return lista[noPax].camposObligatiorios.some(exist);
          }
        }
    }
    else if (lista.length > 1) {
      if (lista[1] != null && lista[1] != "undefined" ||
        lista[1].camposObligatiorios != null ||
        lista[1].camposObligatiorios != ""
      ) {
        if (lista[1].camposObligatiorios != null && lista[1].camposObligatiorios != "") {
          return lista[1].camposObligatiorios.some(exist);
        }
      }
    }
    else {
      return false;
    }
    return false;
  }


  CheckRequiredDataFinal(): any {

    this.arrayNotifier = []
    localStorage.removeItem('InvalidNotifier')

    var re = /\S+@\S+\.\S+/;
    var phonere = /^[\+]?[1234567890\ ]*$/;
    var result: boolean = true;
    var countAge = 0

    for (let i = 0; i < this.pasajeros.length; i++) {
      var pasajero: Pasajero = this.pasajeros[i];
      var currentTime = new Date().getTime();
      var phonevalidado = phonere.test(pasajero.telefono);

      var birthDateTime = new Date(pasajero.fechaNacimiento).getTime();
      var difference = (currentTime - birthDateTime)
      var ageInYears = Math.round(difference / (1000 * 60 * 60 * 24 * 365));

      var emailvalidado = re.test(pasajero.correo);

      if (parseInt(pasajero.edad) > 21) {
        countAge++
      }

      var field = ""
      var dataNotifier = {
        index: -1,
        field: field,
        required: false,
        min: false,
        max: false,
        letter: false,
        email: false,
        phone: false,
        date: false
      }

      //NAME
      //Validate field empty name
      if (this.VerifyMandatoryField(i, "nombre")) {
        if (pasajero.nombre == null || pasajero.nombre == "" || pasajero.nombre.trim() == "") {
          result = false;
          var messageName = ""

          if (Object.keys(this.messageValidate).length != 0) {
            dataNotifier.index = i
            dataNotifier.field = "name"
            dataNotifier.required = true

            // Parse the serialized data back into an aray of objects
            this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier.push(dataNotifier)
            // Re-serialize the array back into a string and store it in localStorage
            localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
          }
        } else {
          //End validate field empty name

          //Minimum number of characters name
          if (pasajero.nombre.length < 2) {
            result = false;
            var minName = ""

            if (Object.keys(this.messageValidate).length != 0) {

              dataNotifier.index = i
              dataNotifier.field = "name"
              dataNotifier.min = true
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier)
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
            }
          }

          //End minimum number of characters name

          //Include digit name
          if (/\d/.test(pasajero.nombre)) {
            result = false;

            if (Object.keys(this.messageValidate).length != 0) {

              dataNotifier.index = i
              dataNotifier.field = "name"
              dataNotifier.letter = true
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier)
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
            }

          }
          //End include digit name
        }
      }
      //SURNAME
      //Validate field empty surname
      if (this.VerifyMandatoryField(i, "apellido")) {
        if (pasajero.apellido == null || pasajero.apellido == "" || pasajero.apellido.trim() == "") {
          result = false;

          if (Object.keys(this.messageValidate).length != 0) {
            dataNotifier.index = i
            dataNotifier.field = "surname"
            dataNotifier.required = true
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier.push(dataNotifier)
            // Re-serialize the array back into a string and store it in localStorage
            localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
          }
        } else {
          //End validate field empty surname

          //Minimum number of characters surname
          if (pasajero.apellido.length < 2) {
            result = false;

            if (Object.keys(this.messageValidate).length != 0) {

              dataNotifier.index = i
              dataNotifier.field = "surname"
              dataNotifier.min = true
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier)
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
            }
          }
          //End minimum number of characters surname

          //Include digit surname
          if (/\d/.test(pasajero.apellido)) {
            result = false;

            if (Object.keys(this.messageValidate).length != 0) {

              dataNotifier.index = i
              dataNotifier.field = "surname"
              dataNotifier.letter = true
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier)
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
            }
          }
        }
      }
      //End include digit surname
      if (this.VerifyMandatoryField(i, "fnac")) {

        //DATE
        //Validate field empty date
        if (pasajero.fechaNacimiento == null || pasajero.fechaNacimiento == "" || pasajero.fechaNacimiento == "-undefined-undefined" || pasajero.fechaNacimiento == "undefined-undefined-undefined" || pasajero.fechaNacimiento.trim() == "") {
          result = false;

          if (Object.keys(this.messageValidate).length != 0) {

            dataNotifier.index = i
            dataNotifier.field = "date"
            dataNotifier.required = true
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier.push(dataNotifier)
            // Re-serialize the array back into a string and store it in localStorage
            localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
          }
        } else {
          //End validate field empty date

          //Format of date invalid
          if (isNaN(ageInYears) || ageInYears <= 0) {
            result = false;
            if (Object.keys(this.messageValidate).length != 0) {
              dataNotifier.index = i
              dataNotifier.field = "date"
              dataNotifier.date = true
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier)
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
            }
          }
          //Format of date invalid

          //Minimum number of characters date
          if (pasajero.fechaNacimiento.length < 2) {
            result = false;
            if (Object.keys(this.messageValidate).length != 0) {

              dataNotifier.index = i
              dataNotifier.field = "date"
              dataNotifier.min = true
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier)
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
            }
          }
          //End minimum number of characters date
        }
      }

      if (this.VerifyMandatoryField(i, "correo")) {
        //EMAIL
        //Validate field empty email
        if (pasajero.correo == null || pasajero.correo == "" || pasajero.correo.trim() == "") {
          result = false;

          if (Object.keys(this.messageValidate).length != 0) {

            dataNotifier.index = i
            dataNotifier.field = "email"
            dataNotifier.required = true
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier.push(dataNotifier)
            // Re-serialize the array back into a string and store it in localStorage
            localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
          }
        }
        //End validate field empty email

        //Invalid email
        //if (i == 0) {
        if (pasajero.correo != "") {
          if (!emailvalidado || !this.CheckMail(pasajero)) {
            result = false;

            if (Object.keys(this.messageValidate).length != 0) {

              dataNotifier.index = i
              dataNotifier.field = "email"
              dataNotifier.email = true
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier)
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
            }
          }
        }
      }

      //End invalid email

      //PHONE
      //Validate field empty phone
      if (this.VerifyMandatoryField(i, "telefono")) {
        if (pasajero.telefono == null || pasajero.telefono == "" || pasajero.telefono.trim() == "") {
          result = false;

          if (Object.keys(this.messageValidate).length != 0) {

            dataNotifier.index = i
            dataNotifier.field = "phone"
            dataNotifier.required = true
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier.push(dataNotifier)
            // Re-serialize the array back into a string and store it in localStorage
            localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
          }
        }

        //End validate field empty phone

        //Phone valid
        //if (i == 0 && this.itinerary.company == "RCCL") {
        if (pasajero.telefono != "" && (this.itinerary.company == "RCCL" || this.itinerary.company == "AZA" || this.itinerary.company == "CEL")) {
          if (!phonevalidado) {
            result = false;

            if (Object.keys(this.messageValidate).length != 0) {

              dataNotifier.index = i
              dataNotifier.field = "phone"
              dataNotifier.phone = true
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier)
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));
            }
          }
        }
        //End phone valid

      }
    }

    if (countAge == 0 && this.pasajeros.length > 0) {
      result = false;
      if (Object.keys(this.messageValidate).length != 0) {
        this.messageService.generalMessage('error', this.messageValidate.err_maxEdadPasajeros)
      }

    }

    if (this.pasajeros.length < Number(this.cantPasajeros)) {
      result = false;
      console.error("Cantidad de pasajeros length es menor que variable cantPasajeros")
    }

    var resultValid = true
    this.updatePassengerCopy()
    var valid = this.validate()
    if (valid > 0) {
      resultValid = true
    } else {
      resultValid = false
    }
    if (result && resultValid) {
      result = true
    } else {
      result = false
    }

    this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier'))

    this.validationData = result;

    return result;
  }


  CheckRequiredDataFinalV2(): any {

    this.arrayNotifier = []
    localStorage.removeItem('InvalidNotifier')

    var fieldSurname = this.screenLangInfo != undefined || this.screenLangInfo != null ? this.screenLangInfo.lbl_Default_Apellido : ""
    var fieldName = this.screenLangInfo != undefined || this.screenLangInfo != null ? this.screenLangInfo.lbl_Default_Nombre : ""
    var fieldDate = this.screenLangInfo != undefined || this.screenLangInfo != null ? this.screenLangInfo.lbl_Fechanacimiento : ""
    var fieldEmail = this.screenLangInfo != undefined || this.screenLangInfo != null ? this.screenLangInfo.lbl_Correo : ""
    var fieldPhone = this.screenLangInfo != undefined || this.screenLangInfo != null ? this.screenLangInfo.lbl_Telefono : ""

    var re = /\S+@\S+\.\S+/;
    var phonere = /^[\+]?[1234567890\ ]*$/;
    var result: boolean = true;
    var countAge = 0

    for (let i = 0; i < this.pasajeros.length; i++) {
      var pasajero: Pasajero = this.pasajeros[i];
      let currentTime = new Date().getTime();
      var phonevalidado = phonere.test(pasajero.telefono);

      let birthDateTime = new Date(pasajero.fechaNacimiento).getTime();
      let difference = (currentTime - birthDateTime)
      var ageInYears = Math.round(difference / (1000 * 60 * 60 * 24 * 365));

      var emailvalidado = re.test(pasajero.correo);

      if (parseInt(pasajero.edad) > 21) {
        countAge++
      }

      var field = ""
      var dataNotifier = {
        index: -1,
        field: field,
        required: false,
        min: false,
        max: false,
        letter: false,
        email: false,
        phone: false,
        date: false
      }

      //NAME
      //Validate field empty name
      if (pasajero.nombre == null || pasajero.nombre == "" || pasajero.nombre.trim() == "") {
        result = false;
        var messageName = ""

        if (Object.keys(this.messageValidate).length != 0) {

          /*messageName = this.messageValidate.err_campoObligatorio
          messageName = messageName.replace("[Pasajero]", String(i + 1))
          messageName = messageName.replace("[Nombre]", fieldName)*/


          dataNotifier.index = i
          dataNotifier.field = "name" + i
          dataNotifier.required = true

          // Parse the serialized data back into an aray of objects
          this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
          // Parse the serialized data back into an aray of objects
          this.arrayNotifier.push(dataNotifier)
          // Re-serialize the array back into a string and store it in localStorage
          localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));

        }
        //break
      } else {
        //End validate field empty name

        //Minimum number of characters name
        if (pasajero.nombre.length < 2) {
          result = false;
          var minName = ""

          if (Object.keys(this.messageValidate).length != 0) {

            /*minName = this.messageValidate.err_minCaracteresApellido
            minName = minName.replace("[Pasajero]", String(i + 1))
            minName = minName.replace("[Nombre]", fieldName)
            minName = minName.replace("[CantidadCaracteres]", "2")*/

            dataNotifier.index = i
            dataNotifier.field = "name"
            dataNotifier.min = true
            this.arrayNotifier.push(dataNotifier)

            //this.messageService.hideAll()
            //this.messageService.generalMessage('error', minName);
          }
          //break
        }

        //End minimum number of characters name

        //Include digit name
        if (/\d/.test(pasajero.nombre)) {
          result = false;
          var digitName = ""

          if (Object.keys(this.messageValidate).length != 0) {

            /*digitName = this.messageValidate.err_campoNoPermiteDigito
            digitName = digitName.replace("[Pasajero]", String(i + 1))
            digitName = digitName.replace("[Nombre]", fieldName)*/

            dataNotifier.index = i
            dataNotifier.field = "name"
            dataNotifier.letter = true
            this.arrayNotifier.push(dataNotifier)

            //this.messageService.hideAll()
            //this.messageService.generalMessage('error', digitName);
          }
          //break
        }
        //End include digit name
      }

      //SURNAME
      //Validate field empty surname
      if (pasajero.apellido == null || pasajero.apellido == "" || pasajero.apellido.trim() == "") {
        result = false;
        var surname = ""

        if (Object.keys(this.messageValidate).length != 0) {

          /* surname = this.messageValidate.err_campoObligatorio
           surname = surname.replace("[Pasajero]", String(i + 1))
           surname = surname.replace("[Nombre]", fieldSurname)*/

          dataNotifier.index = i
          dataNotifier.field = "surname" + i
          dataNotifier.required = true
          // Parse the serialized data back into an aray of objects
          this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier')) || [];
          // Parse the serialized data back into an aray of objects
          this.arrayNotifier.push(dataNotifier)
          // Re-serialize the array back into a string and store it in localStorage
          localStorage.setItem('InvalidNotifier', JSON.stringify(this.arrayNotifier));

          //this.messageService.hideAll()
          //this.messageService.generalMessage('error', surname);
        }
        //break
      } else {
        //End validate field empty surname

        //Minimum number of characters surname
        if (pasajero.apellido.length < 2) {
          result = false;
          var minSurname = ""

          if (Object.keys(this.messageValidate).length != 0) {

            minSurname = this.messageValidate.err_minCaracteresApellido
            minSurname = minSurname.replace("[Pasajero]", String(i + 1))
            minSurname = minSurname.replace("[Nombre]", fieldSurname)
            minSurname = minSurname.replace("[CantidadCaracteres]", "2")

            dataNotifier.index = i
            dataNotifier.field = "surname"
            dataNotifier.min = true
            this.arrayNotifier.push(dataNotifier)

            //this.messageService.hideAll()
            //this.messageService.generalMessage('error', minSurname);
          }
          //break
        }
        //End minimum number of characters surname

        //Include digit surname
        if (/\d/.test(pasajero.apellido)) {
          result = false;
          var digitSurname = ""

          if (Object.keys(this.messageValidate).length != 0) {

            /* digitSurname = this.messageValidate.err_campoNoPermiteDigito
             digitSurname = digitSurname.replace("[Pasajero]", String(i + 1))
             digitSurname = digitSurname.replace("[Nombre]", fieldSurname)*/

            dataNotifier.index = i
            dataNotifier.field = "surname"
            dataNotifier.letter = true
            this.arrayNotifier.push(dataNotifier)

            //this.messageService.hideAll()
            //this.messageService.generalMessage('error', digitSurname);
          }
          //break
        }
      }
      //End include digit surname


    

    }

    if (countAge == 0) {
      result = false;
      if (Object.keys(this.messageValidate).length != 0) {
        this.messageService.generalMessage('error', this.messageValidate.err_maxEdadPasajeros)
      }

    }

    if (this.pasajeros.length < Number(this.cantPasajeros)) {
      result = false;
      console.error("Cantidad de pasajeros length es menor que variable cantPasajeros")
    }

    //this.arrayNotifierCopy = this.arrayNotifier.slice()
    this.arrayNotifier = JSON.parse(localStorage.getItem('InvalidNotifier'))
    this.validationData = result;

    return result;
  }

  CheckRequiredData(): any {
    var re = /\S+@\S+\.\S+/;
    var result: boolean = true;
    for (let i = 0; i < this.pasajeros.length; i++) {
      var pasajero: Pasajero = this.pasajeros[i];
      let currentTime = new Date().getTime();

      let birthDateTime = new Date(pasajero.fechaNacimiento).getTime();
      let difference = (currentTime - birthDateTime)
      var ageInYears = Math.round(difference / (1000 * 60 * 60 * 24 * 365));

      var emailvalidado = re.test(pasajero.correo);
      if ((/^[123456789]*$/.test(pasajero.nombre)) || pasajero.nombre == null || pasajero.nombre == "" || pasajero.nombre.trim() == "" || pasajero.nombre.length < 2) {
        result = false;
      }
      else if ((/^[123456789]*$/.test(pasajero.apellido)) || pasajero.apellido == null || pasajero.apellido == "" || pasajero.apellido.trim() == "" || pasajero.apellido.length < 2) {
        result = false;

      }
      else if (pasajero.fechaNacimiento == null || pasajero.fechaNacimiento == "" || pasajero.fechaNacimiento.trim() == "" || pasajero.fechaNacimiento.length < 2) {
        result = false;


      }

      else if (pasajero.correo == null || pasajero.correo == "" || pasajero.correo.trim() == "" || !(emailvalidado)) {
        if (i == 0) {
          result = false;
        }
      }
      else if (pasajero.telefono == null || pasajero.telefono == "" || pasajero.telefono.trim() == "") {
        if (i == 0 && (this.itinerary.company == "RCCL" || this.itinerary.company == "AZA" || this.itinerary.company == "CEL")) {
          result = false;
        }
      }
      if (result == false) {
        break;
      }
    }
    if (this.pasajeros.length < Number(this.cantPasajeros)) {
      result = false;
    }
    this.validationData = result;
    return result;
  }
  CheckMailOld(): any {
    var result: boolean = true;
    this.pasajeros.forEach(pasajero => {
      if (pasajero.correo != null && pasajero.correo != "" && pasajero.correo.trim() != "") {
        var split: string[] = pasajero.correo.split("@");
        if (split && split.length != 2) {
          result = false;
        }
        else {
          if (split[0] == null || split[0] == "" || split[0].trim() == "") {
            result = false;
          }
          else if (split[1] == null || split[1] == "" || split[1].trim() == "") {
            result = false;
          }
          else {
            var indiceP = split[0].indexOf(".");
            if (indiceP == 0 || indiceP == split[0].length - 1) {
              result = false;
            }
            indiceP = split[1].indexOf(".");
            if (indiceP == -1 || indiceP == 0 || indiceP == split[1].length - 1) {
              result = false;
            }
          }
        }
      }
    });
    return result;
  }

  CheckMail(pasajero: any): any {
    var result: boolean = true;

    if (pasajero.correo != null && pasajero.correo != "" && pasajero.correo.trim() != "") {
      var split: string[] = pasajero.correo.split("@");
      if (split && split.length != 2) {
        result = false;
      }
      else {
        if (split[0] == null || split[0] == "" || split[0].trim() == "") {
          result = false;
        }
        else if (split[1] == null || split[1] == "" || split[1].trim() == "") {
          result = false;
        }
        else {
          var indiceP = split[0].indexOf(".");
          if (indiceP == 0 || indiceP == split[0].length - 1) {
            result = false;
          }
          indiceP = split[1].indexOf(".");
          if (indiceP == -1 || indiceP == 0 || indiceP == split[1].length - 1) {
            result = false;
          }
        }
      }
    }
    return result;
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
      PriceProgramId: this.priceprogramid,
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipalString,
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipalString,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
        ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      IsNRF: this.selectedCabin.esNRF,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
      ENews: enews
    };

    var edadmayor = false;
    for (let i = 0; i < this.pasajeros.length; i++) {
      var pasajero: Pasajero = this.pasajeros[i];

      var d = pasajero.fechaNacimiento;
      var fechaArreglo = d.split("-");

      //var fechaNac = [fechaArreglo[2], fechaArreglo[1], fechaArreglo[0]].join('-');
      var fechaNac = d;
      let currentTime = new Date().getTime();

      let birthDateTime = new Date(pasajero.fechaNacimiento).getTime();
      let difference = (currentTime - birthDateTime)
      var ageInYears = Math.round(difference / (1000 * 60 * 60 * 24 * 365));

      //Comentando warning
      /* if(ageInYears!=pasajero.edad){
         this.messageService.generalMessage('warning', this.PaxEdadFNacNoConcuerda.value);
       }*/

      pasajero.edad = String(ageInYears);

      if (ageInYears > 21) { edadmayor = true; }
      pasajero.fechaNacimiento = fechaNac;
      this.pasajeros[i].edad = String(ageInYears);
      this.pasajeros[i].fechaNacimiento = fechaNac;
    }
    if (edadmayor) {
      this.UpdateReservation();

      this.router.navigate(['cruisebrowser', 'cotizationselection']);
    } /*else {

      this.messageService.generalMessage('error', 'Uno de los pasajeros debe ser mayor de 12 años.');// Quitando error
    }*/
  }
  ShowSelectionRates() {
    this.router.navigate(['cruisebrowser', 'selectionrates']);
  }
}
