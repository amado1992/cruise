import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from "@angular/core";
import { HttpErrorResponse, JsonpClientBackend } from "@angular/common/http";
import { Router } from "@angular/router";
import { forkJoin, from, Subscription } from "rxjs";
import { AdminUsersService } from "src/app/services/admin-users.service";
import { MessageService } from "src/app/services/message.service";
import { Pasajero } from "src/app/models/Pasajero.model";
import { UserPreferencesService } from "src/app/services/user-preferences.service";
import { ChoiceCabinComponent } from "../choice-cabin/choice-cabin.component";
import { ShowCabinComponent } from "../show-cabin/show-cabin.component";
import { DomSanitizer } from "@angular/platform-browser";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { CallCenterComponent } from "../call-center/call-center.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Agencia, AgenciaService } from "src/app/services/DataServices/agencia.service";

@Component({
  selector: "app-passenger-data-summary",
  templateUrl: "./passenger-data-summary.component.html",
  styleUrls: ["./passenger-data-summary.component.scss"]
})
export class PassengerDataSummaryComponent implements OnInit, OnDestroy {
  public getScreenWidth: any;
  public getScreenHeight: any;
  messageValidate: any;
  copiaArray: any[] = [];
  arrayNotifier: any = [];

  @ViewChild("myTemplate") customTemplate: TemplateRef<any>;
  errorDifferenceEdad: boolean = false;
  lbl_l_ValidacionFNac_Error: any;
  lbl_l_ValidacionFNac_Pregunta: any;
  lbl_l_ValidacionFNac_Comentario: any;

  lbl_button_Cancelar: any;
  lbl_button_Continuar: any;

  closeResult: any = "";

  PaxTotal: any;
  accepttc: any;
  loadingLabels: boolean;
  errorLoadingLabels: boolean;
  nationalityInfo: any = null;
  dataSubscription: Subscription;
  modalSubscription: Subscription;
  screenLangInfo: any = null;
  itinerary: any;
  selectedDate: any;
  reservation: any;
  cotizaronline: any;
  selectedCabin: any;
  mostraragentesviajes: any;
  urlShip: string;
  urlDesg: string;
  cleanTitleRate: any;
  cleanDescriptionRate: any;
  cleanText: any;
  cotResume: any;
  sailDate: string;
  mail: string;
  selectedDateCategoryData: any;
  initSearch: string;
  //validationData = false;//Before
  validationData = true; //After
  selectedCategoryRoom: string = "Interior";
  pasajeros: any[] = [];
  turnoscomida: any[] = [];
  IdCotizacion: string;
  errorObligatorios: string;
  errorFormatoCorreo: string;
  rateTitle: string;
  quotationMode: any;
  cantPasajeros: any;
  xcabinaxpasajero: any;
  priceprogramid: any;
  accepten: any;
  mostrarcallcenter: any;
  optObligFNac: boolean = false;
  optObligNombre: boolean = false;
  tipo_ventana: string = "";
  getPreDataTarifas: any;
  cambioEdadInicial: boolean = false;
  activeAgencia: Agencia; 
  
  constructor(
    private router: Router,
    private adminService: AdminUsersService,
    private modalService: NgbModal,
    private messageService: MessageService,
    private userPreferences: UserPreferencesService,
    private sanitized: DomSanitizer,
    private agenciaService: AgenciaService
  ) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  transformStyle(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }

  showVentana() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(CallCenterComponent, {
      size: "lg",
      centered: true
    });
    //modalRef.componentInstance.screenInfoCallCenter = this.screenInfoCallCenter;
    modalRef.componentInstance.screenInfoCallCenter = "";
    this.modalSubscription = from(modalRef.result).subscribe();
  }

  @HostListener("window:resize", ["$event"])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
  }

  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;    
    this.activeAgencia = this.agenciaService.getAgenciabyurl(this.userPreferences.getUrlConexion());
    this.mostrarcallcenter = this.userPreferences.getElement(
      "MostrarCallCenter"
    );
    this.accepttc = false;
    this.PaxTotal = this.userPreferences.getElement("PaxTotal");
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.cantPasajeros = this.userPreferences.getElement("PaxTotal");
    this.cotizaronline = this.userPreferences.getElement("CotizarOnline");
    this.priceprogramid = this.userPreferences.getElement("priceProgramId");
    this.quotationMode = this.userPreferences.getElement("QuotationMode");
    this.tipo_ventana = "PaxDataCotizacion" + this.reservation.CotizacionConfig.Modo;
    this.getPreDataTarifas = this.userPreferences.getElement("preDataTarifas");
    this.SelectCategoryData();
    this.BuildSailDate();
    this.InitData();
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
    if (this.itinerary.company == "NCL" && this.cotizaronline == "true") {
      this.optObligFNac = true;
      this.optObligNombre = true;
    }
  }
  BuildMetaCategoria(metaCategoria: string): any {
    if (metaCategoria == "Interior") return "I";
    else if (metaCategoria == "Exterior") return "O";
    else if (metaCategoria == "Balcon") return "B";
    else if (metaCategoria == "Suite") return "S";
    return null;
  }

  showHTML(valor) {
    var cleanIntermediate = valor.toString();

    cleanIntermediate = cleanIntermediate.toString().replace("\r\n", "<br/>");

    let cleanText = cleanIntermediate;
    cleanText = this.transform(cleanText);
    return cleanText;
  }

  SelectCategoryData() {
    var date = this.selectedDate;
    if (this.selectedCategoryRoom == "Interior") {
      this.selectedDateCategoryData = date.cabinasMasBaratas[0].precioCabinaPax;
    } else if (this.selectedCategoryRoom == "Exterior") {
      this.selectedDateCategoryData = date.cabinasMasBaratas[1].precioCabinaPax;
    } else if (this.selectedCategoryRoom == "Balcon") {
      this.selectedDateCategoryData = date.cabinasMasBaratas[2].precioCabinaPax;
    } else {
      this.selectedDateCategoryData = date.cabinasMasBaratas[3].precioCabinaPax;
    }
  }
  BuildSailDate() {
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida
        .substring(0, 10)
        .split("-");
      this.sailDate = split[2] + "-" + split[1] + "-" + split[0];
    }
  }
  BuildPrecios(metaCategoria: string): any {
    var result: any;
    this.selectedDate.precios.forEach(precio => {
      if (precio.metacategoria == "I") {
        if (metaCategoria == "Interior") {
          result = precio;
        }
      } else if (precio.metacategoria == "O") {
        if (metaCategoria == "Exterior") {
          result = precio;
        }
      } else if (precio.metacategoria == "B") {
        if (metaCategoria == "Balcon") {
          result = precio;
        }
      } else if (precio.metacategoria == "D" || precio.metacategoria == "S") {
        if (metaCategoria == "Suite") {
          result = precio;
        }
      }
    });
    return result;
  }
  ngOnDestroy() { }
  InitData() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.loadingLabels = true;
    this.errorLoadingLabels = false;
    var shipFilter = {
      ShipCode: this.itinerary.shipCode,
      Company: this.itinerary.company,
      FunctionalBranch: this.quotationMode
    };
    var precio = this.BuildPrecios(this.reservation.idCategoriaHabitacion);
    var resumeFilter = {
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      Nnoches: this.itinerary.nnoches.toString(),
      SalidaCode: this.selectedDate.idSalidas.toString(),
      PuertoSalidaCode: this.itinerary.departurePortCode,
      Saildate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(
        this.reservation.idCategoriaHabitacion
      ),
      CategoriaCabina: this.selectedCabin.categoria,
      CantPasajeros: this.reservation.pasajeros
        ? this.reservation.pasajeros.length.toString()
        : "2",
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipal.toString(),
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipal.toString(),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      PriceProgramId: this.priceprogramid,
      CotizacionId: this.reservation.idCotizacion,
      AeropuertoId:
        this.selectedCabin.aeropuertoId &&
          this.selectedCabin.aeropuertoId.trim() != ""
          ? this.selectedCabin.aeropuertoId
          : "0"
    };
    const sources = [
      this.adminService.GetScreenPaxDataLocale(),
      this.adminService.GetImagenBarco(shipFilter),
      this.adminService.GetImagenDesgolse(),
      this.adminService.GetErrorMessage("0", "InfoVolverAEmpezar"),
      this.adminService.GetScreenValidationLocale()
    ];
    this.dataSubscription = forkJoin(sources).subscribe(
      ([screenInfo, shipUrl, desgUrl, initSearch, messageValidate]: any[]) => {
        this.screenLangInfo = screenInfo;
        this.messageValidate = messageValidate;
        if (this.itinerary.nnoches == "1") {
          var noche = this.screenLangInfo.lbl_nochesEnEl;
          this.screenLangInfo.lbl_nochesEnEl = noche.replace("noches", "noche");
        }

        this.lbl_button_Cancelar = screenInfo.lbl_button_Cancelar;
        this.lbl_button_Continuar = screenInfo.lbl_button_Continuar;

        this.lbl_l_ValidacionFNac_Error = screenInfo.lbl_l_ValidacionFNac_Error;
        this.lbl_l_ValidacionFNac_Pregunta =
          screenInfo.lbl_ValidacionFNac_Pregunta;
        this.lbl_l_ValidacionFNac_Comentario =
          screenInfo.lbl_l_ValidacionFNac_Comentario;

        this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
        this.xcabinaxpasajero = this.xcabinaxpasajero.replace(
          "[noPax]",
          this.cantPasajeros.toString()
        );
        this.urlShip = shipUrl.value; // Cambio de .Value;
        this.urlDesg = desgUrl.value; // Cambio de .Value;
        //this.cotResume = cotResume;
        if (initSearch.value) {
          this.initSearch = initSearch.value; // Cambio de .Value;
        }
        this.loadingLabels = false;
        this.cleanTitleRate =
          "<strong>" +
          this.screenLangInfo.lbl_tarifa +
          ":</strong>" +
          this.reservation.rate.tarifa.titulo;
        var cleanIntermediate = this.cleanTitleRate.toString();
        cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
        this.cleanTitleRate = cleanIntermediate;
        this.cleanTitleRate = this.transform(this.cleanTitleRate + "&nbsp;");
        this.cleanDescriptionRate =
          '<img *ngIf="reservation.rate.tarifa!=undefined" src="' +
          this.reservation.rate.tarifa.icon +
          '" style="max-height: 35px; min-width: 5px;">&nbsp;' +
          this.reservation.rate.tarifa.descripcion;
        var cleanIntermediate = this.cleanDescriptionRate.toString();
        cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
        this.cleanDescriptionRate = cleanIntermediate;
        this.cleanDescriptionRate = this.transform(this.cleanDescriptionRate);
      },
      (error: HttpErrorResponse) => {
        this.loadingLabels = false;
        this.errorLoadingLabels = true;
      }
    );
  }
  BuildFilterCabinas(metaCategoria: string): any {
    var precio = this.BuildPrecios(metaCategoria);
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");
    var arreglosinloyalty = [];
    for (var key in this.reservation.pasajeros) {
      arreglosinloyalty.push({
        edad: String(this.reservation.pasajeros[key].edad),
        loyaltyNumber: this.reservation.pasajeros[key].LoyaltyNumber,
        codigoPromocional: this.reservation.pasajeros[key].codigoPromocional
      });
    }

    var d = this.sailDate;
    var fechaArreglo = d.split("-");
    var fechaSalida = [fechaArreglo[2], fechaArreglo[1], fechaArreglo[0]].join(
      "-"
    );

    var currentFilter = {
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      Nnoches: this.itinerary.nnoches.toString(),
      SalidaCode: this.selectedDate.idSalidas.toString(),
      PuertoSalidaCode: this.itinerary.departurePortCode,
      //Saildate: fechaSalida,
      Saildate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(metaCategoria),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      //PriceProgramId: this.BuildFilterBR(metaCategoria, precio.priceProgramId),
      CantPasajeros: this.PaxTotal.toString(),
      //ListaPasajeros:arreglosinloyalty,
      CategoriaCabina: this.selectedCabin.categoria,
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid,
      NoCabina: this.selectedCabin.cabinNumber
    };

    return currentFilter;
  }
  GetCatTranslate(): any {
    if (this.selectedCategoryRoom == "Interior") {
      return this.screenLangInfo.lbl_Button_Interior;
    } else if (this.selectedCategoryRoom == "Exterior") {
      return this.screenLangInfo.lbl_Button_Exterior;
    } else if (this.selectedCategoryRoom == "Balcon") {
      return this.screenLangInfo.lbl_Button_Balcon;
    } else {
      return this.screenLangInfo.lbl_Button_Suite;
    }
  }
  PassengersNumber() {
    this.router.navigate(["cruisebrowser", "passengersnumber"]);
  }
  ShowSearch() {
    this.router.navigate(["cruisebrowser", "searcher"]);
  }
  ShowSelectionRates() {
    this.router.navigate(["cruisebrowser", "selectionrates"]);
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
        this.pasajeros[index].TurnoComida = this.pasajeros[index].TurnoComida && this.pasajeros[index].TurnoComida != null && this.pasajeros[index].TurnoComida != '' ? this.pasajeros[index].TurnoComida : this.turnoscomida.length > 0 ? this.turnoscomida[0].diningId : "";
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
    if (campo == "Nombres") this.pasajeros[index].nombre = e.target.value;
    else if (campo == "Apellidos")
      this.pasajeros[index].apellido = e.target.value;
    else if (campo == "FechaNac")
      this.pasajeros[index].fechaNacimiento = e.target.value;
    else if (campo == "NumDoc")
      this.pasajeros[index].numeroDocumento = e.target.value;
    else if (campo == "Correo") this.pasajeros[index].correo = e.target.value;
    else if (campo == "Telefono")
      this.pasajeros[index].telefono = e.target.value;
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
      this.pasajeros[index].titulo = this.screenLangInfo.comboTitulo[
        selectIndex
      ].id;
    else if (campo == "TipoDoc")
      this.pasajeros[index].tipoDocumento = this.screenLangInfo.comboDocumento[
        selectIndex
      ].id;
    else if (campo == "Nacionalidad")
      this.pasajeros[index].nacionalidad = this.nationalityInfo[
        selectIndex
      ].descripcion;
  }
  dataLoaded(child) {
    this.pasajeros = child;
    //Add
    this.reservation.pasajeros = this.pasajeros;
    this.userPreferences.setElement("Reservation", this.reservation);
    //Add end
    this.CheckRequiredData();
  }
  CambioEdad(child) {
    this.cambioEdadInicial = child;
  }
  acceptTC(child) {
    this.accepttc = child;
  }

  acceptEN(child) {
    this.accepten = child;
  }

  difference(date1, date2) {
    const date1utc = date1.getFullYear();
    const date2utc = date2.getFullYear();
    return Math.abs(date1utc - date2utc);
  }

  ShowReserveConfirmation() {
    if (this.CheckRequiredData()) {
      const edadInicial = (!!this.getPreDataTarifas.mostrarFNac)
      const modo = this.reservation.mode != "Offline"
      if (this.cambioEdadInicial && edadInicial && modo ){
        this.errorDifferenceEdad = true;
        this.modalService
          .open(this.customTemplate, { centered: true })
          .result.then(
            result => {
              this.closeResult = result;
              if (this.closeResult == "Ok") {
                this.pasajeros = this.copiaArray.slice();
                this.SendMail();
                this.router.navigate(["cruisebrowser", "summaryquotation"]);
              }
            },
            reason => { }
          );
      } else {
        this.closeResult = "Ok";
        this.SendMail();
        this.router.navigate(["cruisebrowser", "summaryquotation"]);
      }
    }
  }

  updatePassenger() {
    var date = new Date();
    var countAge = 0;
    var array = this.userPreferences.getElement("Reservation");
    this.copiaArray = array.pasajeros;

    for (let i = 0; i < this.copiaArray.length; i++) {
      if (this.copiaArray[i].fechaNacimiento) {
        var date2 = new Date(this.copiaArray[i].fechaNacimiento);

        var time_difference = this.difference(date, date2);

        if (time_difference < this.copiaArray[i].edad) {
          var differenceAge = Math.abs(
            parseInt(this.copiaArray[i].edad) - time_difference
          );
          if (differenceAge > 1) {
            countAge++;

            this.copiaArray[i].edad = time_difference.toString(); //Add
          }
        }
        if (time_difference > parseInt(this.copiaArray[i].edad)) {
          countAge++;

          this.copiaArray[i].edad = time_difference.toString(); //Add
        }
      }
    }

    return countAge;
  }

  updatePassengerCopy() {
    var date = new Date();
    var countAge = 0;
    var array = this.userPreferences.getElement("Reservation");
    this.copiaArray = array.pasajeros;

    for (let i = 0; i < this.copiaArray.length; i++) {
      if (this.copiaArray[i].fechaNacimiento) {
        var date2 = new Date(this.copiaArray[i].fechaNacimiento);

        var time_difference = this.difference(date, date2);

        if (time_difference < parseInt(this.copiaArray[i].edad)) {
          var differenceAge = Math.abs(
            parseInt(this.copiaArray[i].edad) - time_difference
          );
          if (differenceAge > 1) {
            countAge++;

            this.copiaArray[i].edad = time_difference.toString(); //Add
          }
        }
        if (time_difference > parseInt(this.copiaArray[i].edad)) {
          countAge++;

          this.copiaArray[i].edad = time_difference.toString(); //Add
        }
      }
    }
  }

  validate() {
    var countAgeCopy = 0;
    var countOk = 0;
    for (let i = 0; i < this.copiaArray.length; i++) {
      if (this.copiaArray[i].fechaNacimiento && this.copiaArray[i].edad) {
        countOk++;

        if (parseInt(this.copiaArray[i].edad) > 21) {
          countAgeCopy++;
        }
      }
    }

    if (countAgeCopy == 0 && countOk > 0) {
      if (Object.keys(this.messageValidate).length != 0) {
        this.messageService.generalMessage(
          "error",
          this.messageValidate.err_maxEdadPasajeros
        );
      }
    }

    if (countOk == 0) {
      countAgeCopy = 1;
    }

    return countAgeCopy;
  }

  SendMail() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.UpdateReservation();
  }
  VerifyMandatoryField(noPax: any, field: string): boolean {
    var lista = this.getPreDataTarifas.camposObligatioriosCotizacion;
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


  CheckRequiredData(): any {
    this.arrayNotifier = [];
    localStorage.removeItem("InvalidNotifierQuotation");

    var re = /\S+@\S+\.\S+/;
    var phonere = /^[\+]?[1234567890\ ]*$/;
    var result: boolean = true;
    var countAge = 0;

    for (let i = 0; i < this.pasajeros.length; i++) {
      var field = "";
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
      };
      if (parseInt(this.pasajeros[i].edad) > 21) {
        countAge++;
      }

      var pasajero: Pasajero = this.pasajeros[i];
      var currentTime = new Date().getTime();
      var phonevalidado = phonere.test(pasajero.telefono);

      var birthDateTime = new Date(pasajero.fechaNacimiento).getTime();
      var difference = currentTime - birthDateTime;
      var ageInYears = Math.round(difference / (1000 * 60 * 60 * 24 * 365));

      var emailvalidado = re.test(pasajero.correo);
      //NAME
      //Validate field empty name
      //if (i == 0 || this.optObligNombre) {
      if (this.VerifyMandatoryField(i, "nombre")) {
        if (
          pasajero.nombre == null ||
          pasajero.nombre == "" ||
          pasajero.nombre.trim() == ""
        ) {
          result = false;

          if (Object.keys(this.messageValidate).length != 0) {
            dataNotifier.index = i;
            dataNotifier.field = "name";
            dataNotifier.required = true;

            // Parse the serialized data back into an aray of objects
            this.arrayNotifier =
              JSON.parse(localStorage.getItem("InvalidNotifierQuotation")) ||
              [];
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier.push(dataNotifier);
            // Re-serialize the array back into a string and store it in localStorage
            localStorage.setItem(
              "InvalidNotifierQuotation",
              JSON.stringify(this.arrayNotifier)
            );
          }
        }
      }
      //SURNAME
      //Validate field empty surname
      if (this.VerifyMandatoryField(i, "apellido")) {
        if (pasajero.apellido == null || pasajero.apellido == "" || pasajero.apellido.trim() == "") {
          result = false;
          if (Object.keys(this.messageValidate).length != 0) {
            dataNotifier.index = i;
            dataNotifier.field = "surname";
            dataNotifier.required = true;
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier =
              JSON.parse(localStorage.getItem("InvalidNotifierQuotation")) ||
              [];
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier.push(dataNotifier);
            // Re-serialize the array back into a string and store it in localStorage
            localStorage.setItem(
              "InvalidNotifierQuotation",
              JSON.stringify(this.arrayNotifier)
            );
          }
        }
      }
      //EMAIL
      //Validate field empty email
      if (this.VerifyMandatoryField(i, "correo")) {
        //if ((i == 0) &&
        if (pasajero.correo == null ||
          pasajero.correo == "" ||
          pasajero.correo.trim() == ""
        ) {
          result = false;

          if (Object.keys(this.messageValidate).length != 0) {
            dataNotifier.index = i;
            dataNotifier.field = "email";
            dataNotifier.required = true;
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier =
              JSON.parse(localStorage.getItem("InvalidNotifierQuotation")) ||
              [];
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier.push(dataNotifier);
            // Re-serialize the array back into a string and store it in localStorage
            localStorage.setItem(
              "InvalidNotifierQuotation",
              JSON.stringify(this.arrayNotifier)
            );
          }
        }

        //EMAIL
        //Validate email

        if (this.VerifyMandatoryField(i, "correo")) {
          //Invalid email

          if (!emailvalidado || !this.CheckMail(pasajero)) {
            result = false;

            if (Object.keys(this.messageValidate).length != 0) {
              dataNotifier.index = i;
              dataNotifier.field = "email";
              dataNotifier.email = true;
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier =
                JSON.parse(localStorage.getItem("InvalidNotifierQuotation")) ||
                [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier);
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem(
                "InvalidNotifierQuotation",
                JSON.stringify(this.arrayNotifier)
              );
            }
          }
        }
      }

      //End invalid email
      //DATE
      // //Validate date
      if (this.VerifyMandatoryField(i, "Fnac")) {
        if (
          pasajero.fechaNacimiento == null ||
          pasajero.fechaNacimiento == "" ||
          pasajero.fechaNacimiento == "undefined" ||
          pasajero.fechaNacimiento == "undefined-undefined-undefined" ||
          pasajero.fechaNacimiento.trim() == "" ||
          pasajero.fechaNacimiento.length < 2
        ) {
          result = false;
          if (Object.keys(this.messageValidate).length != 0) {
            dataNotifier.index = i;
            dataNotifier.field = "date";
            dataNotifier.required = true;
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier =
              JSON.parse(localStorage.getItem("InvalidNotifierQuotation")) ||
              [];
            // Parse the serialized data back into an aray of objects
            this.arrayNotifier.push(dataNotifier);
            // Re-serialize the array back into a string and store it in localStorage
            localStorage.setItem(
              "InvalidNotifierQuotation",
              JSON.stringify(this.arrayNotifier)
            );
          }
        }
      } else {
        if (pasajero.fechaNacimiento != "") {
          //Format of date invalid
          if (isNaN(ageInYears) || ageInYears <= 0) {
            result = false;

            if (Object.keys(this.messageValidate).length != 0) {
              dataNotifier.index = i;
              dataNotifier.field = "date";
              dataNotifier.date = true;
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier =
                JSON.parse(localStorage.getItem("InvalidNotifierQuotation")) ||
                [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier);
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem(
                "InvalidNotifierQuotation",
                JSON.stringify(this.arrayNotifier)
              );
            }
          }
          //Minimum number of characters date
          if (pasajero.fechaNacimiento.length < 2) {
            result = false;

            if (Object.keys(this.messageValidate).length != 0) {
              dataNotifier.index = i;
              dataNotifier.field = "date";
              dataNotifier.min = true;
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier =
                JSON.parse(localStorage.getItem("InvalidNotifierQuotation")) ||
                [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier);
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem(
                "InvalidNotifierQuotation",
                JSON.stringify(this.arrayNotifier)
              );
            }
          }
          //End minimum number of characters date
        }


        //PHONE
        //Validate phone
        if (this.VerifyMandatoryField(i, "Telefono")) {
          //Phone valid
          if (!phonevalidado) {
            result = false;

            if (Object.keys(this.messageValidate).length != 0) {
              dataNotifier.index = i;
              dataNotifier.field = "phone";
              dataNotifier.phone = true;
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier =
                JSON.parse(localStorage.getItem("InvalidNotifierQuotation")) ||
                [];
              // Parse the serialized data back into an aray of objects
              this.arrayNotifier.push(dataNotifier);
              // Re-serialize the array back into a string and store it in localStorage
              localStorage.setItem(
                "InvalidNotifierQuotation",
                JSON.stringify(this.arrayNotifier)
              );
            }
          }
        }
        //End phone valid
      }
    }

    if (countAge == 0 && this.pasajeros.length > 0) {
      result = false;
      if (Object.keys(this.messageValidate).length != 0) {
        this.messageService.generalMessage(
          "error",
          this.messageValidate.err_maxEdadPasajeros
        );
      }
    }
    if (this.pasajeros.length < Number(this.cantPasajeros) - 1) {
      result = false;
      console.error(
        "Cantidad de pasajeros length es menor que variable cantPasajeros"
      );
    }

    var resultValid = true;
    this.updatePassengerCopy();
    var valid = this.validate();
    if (valid > 0) {
      resultValid = true;
    } else {
      resultValid = false;
    }
    if (result && resultValid) {
      result = true;
    } else {
      result = false;
    }

    this.arrayNotifier = JSON.parse(
      localStorage.getItem("InvalidNotifierQuotation")
    );
    return result;
  }

  CheckMailOld(): any {
    var result: boolean = true;
    this.pasajeros.forEach(pasajero => {
      if (
        pasajero.correo != null &&
        pasajero.correo != "" &&
        pasajero.correo.trim() != ""
      ) {
        var split: string[] = pasajero.correo.split("@");
        if (split && split.length != 2) {
          result = false;
        } else {
          if (split[0] == null || split[0] == "" || split[0].trim() == "") {
            result = false;
          } else if (
            split[1] == null ||
            split[1] == "" ||
            split[1].trim() == ""
          ) {
            result = false;
          } else {
            var indiceP = split[0].indexOf(".");
            if (indiceP == 0 || indiceP == split[0].length - 1) {
              result = false;
            }
            indiceP = split[1].indexOf(".");
            if (
              indiceP == -1 ||
              indiceP == 0 ||
              indiceP == split[1].length - 1
            ) {
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

    if (
      pasajero.correo != null &&
      pasajero.correo != "" &&
      pasajero.correo.trim() != ""
    ) {
      var split: string[] = pasajero.correo.split("@");
      if (split && split.length != 2) {
        result = false;
      } else {
        if (split[0] == null || split[0] == "" || split[0].trim() == "") {
          result = false;
        } else if (
          split[1] == null ||
          split[1] == "" ||
          split[1].trim() == ""
        ) {
          result = false;
        } else {
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

  SendMailOld() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    var precio = this.BuildPrecios(this.reservation.idCategoriaHabitacion);

    var mailData = {
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
      Metacategoria: this.BuildMetaCategoria(
        this.reservation.idCategoriaHabitacion
      ),
      CategoriaCabina: this.selectedCabin.categoria,
      CantPasajeros: this.pasajeros ? this.pasajeros.length.toString() : "2",
      CorreoResumen: "",
      ListaPasajeros: this.pasajeros,
      TipoSubjectTarget: "1",
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipalString,
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipalString,
      AeropuertoId:
        this.selectedCabin.aeropuertoId &&
          this.selectedCabin.aeropuertoId.trim() != ""
          ? this.selectedCabin.aeropuertoId
          : "0",
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.selectedCabin.priceProgramId,
      NoCabina: this.selectedCabin.cabinNumber,
      IsNRF: this.selectedCabin.esNRF,
      TooltipsNRF: "",
      ConVueloIncluido:
        this.selectedCabin.aeropuertoId &&
          this.selectedCabin.aeropuertoId.trim() != ""
          ? true
          : false
    };

    this.UpdateReservation();
  }
}
