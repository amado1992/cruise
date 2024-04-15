import { Component, Input, OnInit, Output, EventEmitter, ViewChild, TemplateRef, OnChanges, SimpleChanges } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, Subscription } from 'rxjs';
import { Pasajero } from 'src/app/models/Pasajero.model';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { MessageService } from 'src/app/services/message.service';
import { ItineraryinfoComponent } from '../itineraryinfo/itineraryinfo.component';
import { ShowCabinComponent } from '../show-cabin/show-cabin.component';
import { DomSanitizer } from '@angular/platform-browser';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { log } from 'util';
import { PasajeroDataService } from 'src/app/services/DataServices/pasajero-data.service';
import { Agencia, AgenciaService } from 'src/app/services/DataServices/agencia.service';

@Component({
  selector: 'app-enter-passenger-data',
  templateUrl: './enter-passenger-data.component.html',
  styleUrls: ['./enter-passenger-data.component.scss']
})
export class EnterPassengerDataComponent implements OnInit, OnChanges {

  pagarPropinas: boolean
  pagarImpuestos: boolean

  @ViewChild('myTemplate') customTemplate: TemplateRef<any>;
  errorDifferenceEdad: boolean = false
  lbl_l_ValidacionFNac_Error: any
  lbl_l_ValidacionFNac_Pregunta: any
  lbl_l_ValidacionFNac_Comentario: any
  messageValidate: any

  lbl_button_Cancelar: any
  lbl_button_Continuar: any

  closeResult: any = ""
  name: any
  surname: any
  date: any
  email: any
  phone: any

  mostrarpropinas: any;
  mostrarSeguro: any
  @Input() fieldValidate: any
  @Input() screenLangInfo: any;
  @Input() urlShip: string;
  @Input() PaxNumber: string;
  @Input() turnoscomida: string;
  @Input() parent: string;
  @Output() dataLoaded = new EventEmitter<any[]>();
  @Output() TerminaCarga = new EventEmitter<boolean>();
  @Output() CambioEdad = new EventEmitter<boolean>();
  @Output() acceptTC = new EventEmitter<any[]>();
  @Output() acceptEN = new EventEmitter<any[]>();

  selectedDate: any;
  reservation: any;
  itinerary: any;
  selectedCategoryRoom: string;
  selectedCabin: any;
  cleanText: any;
  cotizaronline: any;
  loadingLabels: boolean;
  errorLoadingLabels: boolean;
  dataSubscription: Subscription;
  modalSubscription: Subscription;
  nationalityInfo: any = null;
  pasajeros: any[] = [];
  sailDate: string;
  cleanTitleRate: any;
  cleanDescriptionRate: any;
  IdCotizacion: string;
  errorObligatorios: string;
  errorFormatoCorreo: string;

  rateTitle: string;
  PaxTotal: any;
  company: any;
  ModoReservacion: any;
  turnos: any;
  priceprogramid: any;
  terminoscondiciones: any;
  acceptTermConditions: any;
  screenLangCotizacion: any;
  PaxEdadFNacNoConcuerda: any;
  enews: any;
  mostrarenews: any;
  datosagentesviaje = {
    NombreAgencia: "",
    NombreAgente: "",
    DireccionAgencia: "",
    TelefonoAgencia: "",
  };
  chequeadoTravel: any;
  mostraragentesviajes: any;
  agencytravelIsValid: boolean = false;
  getPreDataTarifas: any;
  minDate: Date;
  maxDate: Date;
  cambioedadAnterior: boolean = false;
  activeAgencia: Agencia;
  
  constructor(private router: Router, private adminService: AdminUsersService, private messageService: MessageService, public pasajerodata: PasajeroDataService,
    private userPreferences: UserPreferencesService, private modalService: NgbModal, private sanitized: DomSanitizer, private fb: FormBuilder,private agenciaService: AgenciaService) { }


  ngOnChanges(changes: SimpleChanges) {
  }

  ngOnInit() {
    this.activeAgencia = this.agenciaService.getAgenciabyurl(this.userPreferences.getUrlConexion());
    this.pagarImpuestos = this.userPreferences.getElement("SeguroIncluido");
    this.pagarPropinas = this.userPreferences.getElement("PropinaIncluida");

    this.userPreferences.setElement("backReservationSummary", false);
    let showTip = this.userPreferences.getElement("preDataTarifas");
    this.mostrarpropinas = showTip.mostrarPedirPropinas
    this.mostrarSeguro = showTip.mostrarPedirSeguros


    this.acceptTermConditions = this.userPreferences.getElement("acceptTermConditions");
    this.terminoscondiciones = this.activeAgencia.TerminosCondiciones;
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    this.itinerary = this.userPreferences.getElement("Itinerary");

    this.reservation = this.userPreferences.getElement("Reservation");
    this.ModoReservacion = this.userPreferences.getElement('ModoReservacion');
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");
    this.priceprogramid = this.userPreferences.getElement('priceProgramId');
    this.PaxTotal = Number(this.PaxNumber);
    this.getPreDataTarifas = this.userPreferences.getElement("preDataTarifas");
    this.cotizaronline = this.userPreferences.getElement("CotizarOnline");

    this.mostrarenews = JSON.parse(this.activeAgencia.MostrarENnews.toLowerCase());
    this.enews = JSON.parse(this.userPreferences.getElement("enews"));
    var agentesdeviajeValue = this.userPreferences.getElement("AgentesDeViaje");
    this.mostraragentesviajes = JSON.parse(this.activeAgencia.MostrarAgenteViajes.toLowerCase());
    this.chequeadoTravel = JSON.parse(this.userPreferences.getElement("checkagenteViajes"));
    if (!this.isEmptyObject(agentesdeviajeValue)) {
      this.datosagentesviaje = agentesdeviajeValue;
    } else {
      this.userPreferences.setElement("AgentesDeViaje", this.datosagentesviaje);
    }
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 105, 1, 1);
    this.maxDate = new Date();

    this.BuildSailDate();
    this.InitData();
  }

  MostrarElemtent(): boolean {
    return this.parent != "PaxDataReservaOnline";
  }

  VerifyMandatoryField(noPax: any, field: string): string {
    var lista = this.getPreDataTarifas.camposObligatioriosCotizacion;
    if (this.parent == "PaxDataReservaOnline") {
      lista = this.getPreDataTarifas.camposObligatioriosReserva;
    }
    const exist = (element: string) => { return element.toLocaleLowerCase().trim() == field.toLocaleLowerCase().trim() };
    if (lista.length >= 0 && noPax == 0) {
      if (lista[0] != null && lista[0] != "undefined" ||
        lista[0].camposObligatiorios != null ||
        lista[0].camposObligatiorios != ""
      ) {
        if (lista[noPax].camposObligatiorios != null && lista[noPax].camposObligatiorios != "") {
          return lista[noPax].camposObligatiorios.some(exist) ? " (*) " : "";
        }
      }
    }
    else if (lista.length > 1) {
      if (lista[1] != null && lista[1] != "undefined" ||
        lista[1].camposObligatiorios != null ||
        lista[1].camposObligatiorios != ""
      ) {
        if (lista[1].camposObligatiorios != null && lista[1].camposObligatiorios != "") {
          return lista[1].camposObligatiorios.some(exist) ? " (*) " : "";;
        }
      }
    }
    else {
      return "";
    }
    return "";
  }

  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  BuildSailDate() {
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split("-");
      this.sailDate = split[0] + "-" + split[1] + "-" + split[2];
    }
  }
  showHTML(valor) {
    var cleanIntermediate = valor.toString();
    cleanIntermediate = cleanIntermediate.replace("\r\n", "<br/>");

    this.cleanText = cleanIntermediate;
    this.cleanText = this.transform(this.cleanText);
    return this.cleanText;
  }
  InitData() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    var metacategoria = '';
    this.loadingLabels = true;
    this.errorLoadingLabels = false;
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

    const sources = [
      this.adminService.GetScreenPaxDataLocale(),
      this.adminService.GetListCountry(),
      this.adminService.GetErrorMessage('0', 'ErrDatosObligIncompletos'),
      this.adminService.GetErrorMessage('0', 'ErrFormatoEmailIncorrecto'),
      this.adminService.getTurnosComidasOnline(this.BuildFilterCabinas(metacategoria)),
      this.adminService.GetScreenCotizationSelectionLocale(),
      this.adminService.GetErrorMessage('0', 'PaxEdadFNacNoConcuerda'),
      this.adminService.GetScreenValidationLocale()
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo, natInfo, errosDatos, errorformato, turnos, cotizacionselection, e1, messageValidate]: any[]) => {
          this.screenLangInfo = screenInfo;
          this.nationalityInfo = natInfo;
          this.turnos = turnos;
          this.PaxEdadFNacNoConcuerda = e1;
          this.screenLangCotizacion = cotizacionselection;
          this.messageValidate = messageValidate

          if (this.terminoscondiciones) {
            var enlace = this.screenLangCotizacion.lbl_TerminosyCondiciones;
            var enlace_complete = "<a target='_blank' href='" + this.terminoscondiciones + "'>" + this.screenLangCotizacion.lbl_TerminosDB + "</a>";
            enlace = enlace.replace("[terminosbd]", enlace_complete);
            this.screenLangCotizacion.lbl_TerminosyCondiciones = this.showHTML(enlace);
            //this.screenLangInfo. =
          } else {
            var enlace = this.screenLangCotizacion.lbl_TerminosyCondiciones;
            var hostComplete = window.location.protocol + "//" + window.location.host + window.location.pathname;
            var n = hostComplete.lastIndexOf("\/");
            hostComplete = hostComplete.substring(0, n);
            var n1 = hostComplete.lastIndexOf("\/");
            hostComplete = hostComplete.substring(0, n1) + "/assets/error.html";
            var caminoerror = hostComplete;
            var enlace_complete = "<a target='_blank' href='" + caminoerror + "'>" + this.screenLangInfo.lbl_TerminosDB + "</a>";

            enlace = enlace.replace("[terminosbd]", enlace_complete);
            this.screenLangCotizacion.lbl_TerminosyCondiciones = this.showHTML(enlace);
          }

          if (errosDatos.value) {
            this.errorObligatorios = errosDatos.value;
          }
          if (errorformato.value) {
            this.errorFormatoCorreo = errorformato.value;
          }
          this.InitPassenger();
          this.loadingLabels = false;
          this.TerminaCarga.emit(true);
        },
        (error: HttpErrorResponse) => {
          this.loadingLabels = false;
          this.errorLoadingLabels = true;
        });
  }

  ChangeENews(Event) {
    this.enews = Event.currentTarget.checked;
    this.userPreferences.setElement("enews", Event.currentTarget.checked);
    this.acceptEN.emit(this.enews);

  }

  ChangeTermAndConditions(Event) {
    this.acceptTermConditions = Event.currentTarget.checked;
    this.userPreferences.setElement("acceptTermConditions", this.acceptTermConditions);
    this.EmitValidData();
  }

  BuildFilterCabinas(metaCategoria: string): any {
    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    var reserva = this.userPreferences.getElement("Reservation");

    var arreglosinloyalty = []
    for (var key in this.reservation.pasajeros) {
      arreglosinloyalty.push({
        "edad": String(this.reservation.pasajeros[key].edad),
        "loyaltyNumber": reserva.pasajeros[key].LoyaltyNumber != undefined ? reserva.pasajeros[key].LoyaltyNumber : reserva.pasajeros[key].loyaltyNumber,
        "codigoPromocional": reserva.pasajeros[key].codigoPromocional
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
      Metacategoria: this.selectedCabin.metacategoria,
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      CantPasajeros: this.PaxTotal.toString(),
      ListaPasajeros: this.reservation.pasajeros,
      CategoriaCabina: this.selectedCabin.categoria,
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid,
      NoCabina: this.selectedCabin.cabinNumber,
    };
    return currentFilter;
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
        this.pasajeros[index].TurnoComida = this.pasajeros[index].TurnoComida ? this.pasajeros[index].TurnoComida : this.turnos.length > 0 ? this.turnos[0].diningId : "";
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
          TurnoComida: this.turnos.length > 0 ? this.turnos[0].diningId : ""
        };
      }
    }

  }

  ChangePassData(e: any, campo: string, index: number) {

    if (campo == "Nombres") {
      this.pasajeros[index].nombre = e.target.value;
    }
    if (campo == "Apellidos") {
      this.pasajeros[index].apellido = e.target.value;
    }
    if (campo == "FechaNac") {
      this.pasajeros[index].fechaNacimiento = e.target.value;
      var edadAnterior = this.pasajeros[index].edad;
      this.pasajeros[index].edad =  String(this.CalculateAge(e.target.value));
      this.cambioedadAnterior = edadAnterior != parseInt(this.pasajeros[index].edad);     
    }
    if (campo == "NumDoc") {
      this.pasajeros[index].numeroDocumento = e.target.value;
    }
    if (campo == "Correo") {
      this.pasajeros[index].correo = e.target.value;
    }
    if (campo == "Telefono") {
      this.pasajeros[index].telefono = e.target.value;
    }
    this.CambioEdad.emit(this.cambioedadAnterior);
    this.dataLoaded.emit(this.pasajeros);  
  }

  CalculateAge(fnac): number {
    if (fnac) {
        const convertAge = new Date(fnac);
        const timeDiff = Math.abs(Date.now() - convertAge.getTime());
        return Math.floor((timeDiff / (1000 * 3600 * 24))/365);
    } else {
      return null;
    }
  }

  ChangeSelectComidaValue(e: any) {
    for (let i = 0; i < this.pasajeros.length; i++) {
      this.pasajeros[i].TurnoComida = e.target.value;
    }
    this.dataLoaded.emit(this.pasajeros);
  }

  ChangeSelectValue(e: any, campo: string, index: number) {
    var selectIndex = e.target.options.selectedIndex;
    if (campo == "Titulo")
      this.pasajeros[index].titulo = this.screenLangInfo.comboTitulo[selectIndex].id;
    else if (campo == "TipoDoc")
      this.pasajeros[index].tipoDocumento = this.screenLangInfo.comboDocumento[selectIndex].descripcion;
    else if (campo == "Nacionalidad")
      this.pasajeros[index].nacionalidad = this.nationalityInfo[selectIndex].descripcion;
    this.dataLoaded.emit(this.pasajeros);
  }

  ChangeSeguro(Event) {
    let seguro = false
    if (Event.currentTarget.checked == true) {
      seguro = true;
    } else {
      seguro = false;
    }
    this.userPreferences.setElement("SeguroIncluido", seguro);
  }

  ChangePropina(Event) {
    let propina = false
    if (Event.currentTarget.checked == true) {
      propina = true;
    } else {
      propina = false;
    }
    this.userPreferences.setElement("PropinaIncluida", propina);
  }
  DateMinMax(i) {
    if ( i == null || i == "" || i == "undefined") {  return false; }
    return new Date(i).getTime() < this.minDate.getTime() || new Date(i).getTime() > this.maxDate.getTime()
  }

  requiredField(i, field) {
    var result = false
    if (this.fieldValidate != null) {
      var obj = this.fieldValidate.find(value => value.index == i && value.field == field)


      if (obj == undefined) {
        result = false
      } else {
        if (obj.required) {
          result = true
        }
      }
    }
    return result
  }

  validEmail(i, field) {
    var result = false
    if (this.fieldValidate != null) {
      var obj = this.fieldValidate.find(value => value.index == i && value.field == field)

      if (obj == undefined) {
        result = false
      } else {
        if (obj.email) {
          result = true
        }
      }
    }
    return result
  }

  validDate(i, field) {
    var result = false
    if (this.fieldValidate != null) {
      var obj = this.fieldValidate.find(value => value.index == i && value.field == field)

      if (obj == undefined) {
        result = false
      } else {
        if (obj.date) {
          result = true
        }
      }
    }    
    return result
  }

  validPhone(i, field) {
    var result = false
    if (this.fieldValidate != null) {
      var obj = this.fieldValidate.find(value => value.index == i && value.field == field)
      if (obj == undefined) {
        result = false
      } else {
        if (obj.phone) {
          result = true
        }
      }
    }
    return result
  }
  validMin(i, field) {
    var result = false
    if (this.fieldValidate != null) {
      var obj = this.fieldValidate.find(value => value.index == i && value.field == field)
      if (obj == undefined) {
        result = false
      } else {
        if (obj.min) {
          result = true
        }
      }
    }

    return result
  }

  validLetter(i, field) {
    var result = false
    if (this.fieldValidate != null) {
      var obj = this.fieldValidate.find(value => value.index == i && value.field == field)


      if (obj == undefined) {
        result = false
      } else {
        if (obj.letter) {
          result = true
        }
      }
    }

    return result
  }

  emailReplace(i) {
    var message = ""
    if (Object.keys(this.messageValidate).length != 0) {
      message = this.messageValidate.err_formatoCorreoInvalido.replace("[Pasajero]", String(i + 1))
    }

    return message
  }

  phoneReplace(i) {
    var message = ""
    if (Object.keys(this.messageValidate).length != 0) {
      message = this.messageValidate.err_numeroTelefonoInvalido.replace("[Pasajero]", String(i + 1))
    }

    return message
  }

  dateReplace(i) {
    var message = ""
    if (Object.keys(this.messageValidate).length != 0) {
      message = this.messageValidate.err_fechaNacInvalida.replace("[Pasajero]", String(i + 1))
    }

    return message
  }
  //Agente de Viajes
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
    this.EmitValidData();
  }
  //Agente de Viajes
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
      isValid = !!(typeof this.datosagentesviaje.TelefonoAgencia != 'undefined' && this.datosagentesviaje.TelefonoAgencia) || this.ValidarVaciosyTC();
      if (isValid) {
        isValid = (new RegExp('^[\+]?[1234567890 ]*$')).test(this.datosagentesviaje.TelefonoAgencia);
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
  ValidarVaciosyTC() {
    var isValid1 = !!(typeof this.datosagentesviaje.NombreAgencia != 'undefined' && this.datosagentesviaje.NombreAgencia);
    var isValid2 = !!(typeof this.datosagentesviaje.DireccionAgencia != 'undefined' && this.datosagentesviaje.DireccionAgencia);
    var isValid3 = !!(typeof this.datosagentesviaje.TelefonoAgencia != 'undefined' && this.datosagentesviaje.TelefonoAgencia);
    var isValid5 = !!(typeof this.datosagentesviaje.NombreAgente != 'undefined' && this.datosagentesviaje.NombreAgente);
    return !(!(isValid1 && isValid2 && isValid3 && isValid5) && this.acceptTermConditions);
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
  ShowAgencyTravelData(Event) {
    this.chequeadoTravel = Event.currentTarget.checked;
    this.userPreferences.setElement("checkagenteViajes", this.chequeadoTravel);
    this.ValidateFormAgenciaViajes();
    this.EmitValidData();
  }

  EmitValidData() {
    var condicion: any = this.acceptTermConditions;
    if (this.mostraragentesviajes && this.chequeadoTravel) {
      this.ValidateFormAgenciaViajes()
      condicion = condicion && this.agencytravelIsValid
    }
    this.dataLoaded.emit(this.pasajeros);
    this.acceptTC.emit(condicion);
  }
}



