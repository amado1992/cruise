import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, from, Subscription } from 'rxjs';
import { Pasajero } from 'src/app/models/Pasajero.model';
import { Reservacion } from 'src/app/models/Reservacion.model';
import { ItineraryinfoComponent } from '../itineraryinfo/itineraryinfo.component';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CallCenterComponent } from '../call-center/call-center.component';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ErrorWindowComponent } from '../error-window/error-window.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from 'src/app/services/message.service';
import { truncate } from 'fs';
import { AgenciaService } from 'src/app/services/DataServices/agencia.service';

@Component({
  selector: 'app-passengers-number',
  templateUrl: './passengers-number.component.html',
  styleUrls: ['./passengers-number.component.scss']
})
export class PassengersNumberComponent implements OnInit, OnDestroy {
  mostrarVueloIncluido: any = false//Nuevo atributo
  lbl_cmb_AeropuertoTitle: any = ""
  selectedAereopuerto: any = ""
  lbl_TarifaAgotada: any = ""
  vueloIncluido: any = ""
  messageValidate: any
  preDataTarifas: any

  public getScreenWidth: any;
  public getScreenHeight: any;
  model: NgbDateStruct;

  cantidadPasajeros: any;
  edadesPasajeros: number[] = [];
  datePassenger: any[] = []
  loyaltyPasajeros: string[] = [];
  aereopuerto: string[] = [];
  aereopuertoLength: number = 0
  mostrarFide: boolean[] = [];
  numeroPasajeros: number[] = [];
  codigoPromocional: any = null;
  movilidadEspecial: boolean = false;
  Vuelo: boolean = false;
  clubFidelizacion: any;
  modalSubscription: Subscription;
  loadingLabels: boolean;
  errorLoadingLabels: boolean;
  requerido: boolean = false;
  MostrarVuelo: any;
  mostrarCodigoPromocional: boolean;
  hayCodPromocional: boolean;
  mostrarFidelizacion: boolean;
  dataSubscription: Subscription;
  screenLangInfo: any = null;
  screenLangInfoTwo: any = null;
  ListaPasajeros: any;
  mostrarCodigoPromocionalAdd: boolean;
  itinerary: any;
  company: any;
  sailDate: any;
  cantMaxPassengers: any;
  selectedDate: any;
  reservation: any;
  selectedCabin: any;
  screenInfoCallCenter: any;
  selectedDateCategoryData: any = null;
  selectedCategoryRoom: string = "Interior";
  errorEdadIncorrecta: string = "(X)";
  mostrarcallcenter: any;
  mostraropcionvuelo: any;
  mostrarVueloObligatorio: boolean = false;
  minDate: Date;
  maxDate: Date;
  activeAgencia: any;
  constructor(private router: Router, private adminService: AdminUsersService,
    private userPreferences: UserPreferencesService,
     private modalService: NgbModal, private sanitized: DomSanitizer,
     private messageService: MessageService,
     private agenciaService: AgenciaService) { }
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

    this.MostrarVuelo = false;
    this.mostraropcionvuelo =this.activeAgencia.MostrarOpcionVuelo;
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");

    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 105, 1, 1);
    this.maxDate = new Date();

    //New add
    let value = this.userPreferences.getElement("PaxTotal");
    if (value) {
      this.cantidadPasajeros = value;
    } else {
      this.userPreferences.setElement("PaxTotal", 2);
      this.cantidadPasajeros = 2;
    }
    //End new add

    this.mostrarcallcenter = this.activeAgencia.MostrarCallCenter;

    //this.mostrarVueloIncluido = this.userPreferences.getElement("mostrarVueloIncluido")//Nueva linea


    this.codigoPromocional = "";
    this.clubFidelizacion = "";
    for (let i = 0; i < 10; i++) {

      this.mostrarFide.push(true);
    }
    this.mostrarCodigoPromocional = false;
    this.mostrarFidelizacion = true;
    var companiasConCodigoPromocional = ['AZA', 'RCC', 'CEL', 'RCCL'];
    this.company = this.userPreferences.getCompany();
    if (companiasConCodigoPromocional.find(a => a.includes(this.company))) {
      this.hayCodPromocional = true;
    }
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.SelectCategoryData();

    if (this.reservation.pasajeros != undefined && this.reservation.pasajeros.length > 0) {
      for (let index = 0; index < this.reservation.pasajeros.length; index++) {
        var pasajero = this.reservation.pasajeros[index]
        this.edadesPasajeros.push(pasajero.edad);
        this.datePassenger.push(pasajero.fechaNacimiento);
        this.numeroPasajeros.push(index);
      }
    } else {

      for (let index = 0; index < Number(this.cantidadPasajeros); index++) {
        this.edadesPasajeros.push(30);
        this.numeroPasajeros.push(index);
      }
    }

    this.BuildSailDate();
    this.ListaPasajeros = this.BuildPassengers();
    this.InitData();
  }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  showHTML(valor) {

    var cleanIntermediate = valor.toString();

    cleanIntermediate = cleanIntermediate.toString().replace("\r\n", "<br/>");

    let cleanText = cleanIntermediate;
    cleanText = this.transform(cleanText);
    return cleanText;
  }
  showVentana() {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(CallCenterComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenInfoCallCenter = "";
    this.modalSubscription = from(modalRef.result).subscribe();

  }
  handleMinus() {
    if (Number(this.cantidadPasajeros) > 1) {
      var diff = Number(this.cantidadPasajeros) - 1;
      this.userPreferences.setElement("PaxTotal", Number(this.cantidadPasajeros) - 1);
      this.edadesPasajeros.splice(Number(this.cantidadPasajeros) - 1, diff);
      this.loyaltyPasajeros.splice(Number(this.cantidadPasajeros) - 1, diff);
      this.numeroPasajeros.splice(Number(this.cantidadPasajeros) - 1, diff);
      this.cantidadPasajeros--;
    }
  }
  handlePlus() {
    //if (Number(this.cantidadPasajeros) < this.itinerary.cantidadMinPax) {
    if (Number(this.cantidadPasajeros) < this.cantMaxPassengers) {

      this.userPreferences.setElement("PaxTotal", Number(this.cantidadPasajeros) + 1);
      this.edadesPasajeros.push(30);
      //this.loyaltyPasajeros.push("0");
      this.loyaltyPasajeros.push("");
      this.numeroPasajeros.push(Number(this.cantidadPasajeros) + 1);
      this.cantidadPasajeros++;
    }
  }
  handleMinusAge(i) {
    if (Number(this.edadesPasajeros[i]) > 1) {
      this.edadesPasajeros[i] = this.edadesPasajeros[i] - 1;
      this.VerifyAge(i);
    }
  }
  handlePlusAge(i) {
    this.edadesPasajeros[i] = this.edadesPasajeros[i] + 1;
    this.VerifyAge(i);
  }
  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
  ShowSearch() {
    this.router.navigate(['cruisebrowser', 'searcher']);
  }

  ShowSelectionRates() {
    this.UpdateReservation()
    var countAge = 0

    for (let i = 0; i < this.reservation.pasajeros.length; i++) {
      if (this.reservation.pasajeros[i].edad > 21) {
        countAge++
      }
    }
    if (countAge == 0) {
      if (Object.keys(this.messageValidate).length != 0) {
        this.messageService.generalMessage('error', this.messageValidate.err_maxEdadPasajeros)
      }

    }

    if (countAge != 0) {
      this.userPreferences.setElement("ConVueloIncluido", this.Vuelo);
      this.userPreferences.setElement("AeropuertoId", this.selectedAereopuerto);

      if (this.Vuelo) {
        if (this.aereopuertoLength > 0) {
          if (this.selectedAereopuerto != 0 || this.selectedAereopuerto != null || this.selectedAereopuerto != undefined) {

            this.UpdateReservation();
            this.router.navigate(['cruisebrowser', 'selectionrates']);
          }
        } else {
          this.Vuelo = false
          this.userPreferences.setElement("ConVueloIncluido", this.Vuelo);
          this.UpdateReservation();
          this.router.navigate(['cruisebrowser', 'selectionrates']);
        }
      } else {
        this.UpdateReservation();
        this.router.navigate(['cruisebrowser', 'selectionrates']);
      }
    }
  }

  ChangeNumPass(event) {
    if (event.target.valueAsNumber) {
      var current_count = event.target.valueAsNumber;
      if (current_count > this.cantidadPasajeros) {
        var diff = current_count - Number(this.cantidadPasajeros);
        this.userPreferences.setElement("PaxTotal", Number(this.cantidadPasajeros) + 1);
        for (let index = 0; index < diff; index++) {
          this.edadesPasajeros.push(30);
          // this.loyaltyPasajeros.push("0");
          this.loyaltyPasajeros.push("");
          this.numeroPasajeros.push(Number(this.cantidadPasajeros) + index);
        }
      }
      else {
        var diff = this.cantidadPasajeros - current_count;
        this.userPreferences.setElement("PaxTotal", Number(this.cantidadPasajeros) - 1);
        this.edadesPasajeros.splice(current_count, diff);
        this.loyaltyPasajeros.splice(current_count, diff);
        this.numeroPasajeros.splice(current_count, diff);
      }
      this.cantidadPasajeros = this.edadesPasajeros.length;
    }
  }
  PreguntaCodigoPromocional(value) {
    if (value) {
      this.mostrarCodigoPromocional = true;
      this.mostrarCodigoPromocionalAdd = true;
    } else {
      this.mostrarCodigoPromocionalAdd = false;
    }
  }
  PreguntaFidelizacion(value, i) {
    if (value) {
      this.mostrarFidelizacion = false;
      this.mostrarFide[i] = false;
    } else {
      this.mostrarFidelizacion = true;
      this.mostrarFide[i] = true;
    }
  }
  ChangeCodigoPromocional(event) {
    this.codigoPromocional = event;
  }
  ChangeclubFidelizacion(event, i) {
    this.clubFidelizacion = event;
    this.loyaltyPasajeros[i] = String(event);
  }
  closeFidelizacion(i) {
    this.clubFidelizacion = "";
    this.loyaltyPasajeros[i] = "";
    this.mostrarFidelizacion = true;
    this.mostrarFide[i] = true;
  }
  closePromocional() {
    this.codigoPromocional = "";
    this.mostrarCodigoPromocional = false;
    this.mostrarCodigoPromocionalAdd = false;
  }
  showError(errorValue) {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ErrorWindowComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenError = errorValue;
    this.modalSubscription = from(modalRef.result).subscribe();

  }
  ChangeAgePass(event, i) {
    if (event.target.valueAsNumber) {
      var current_count = event.target.valueAsNumber;
      this.edadesPasajeros[i] = current_count;
      this.VerifyAge(i);
    }
  }

  ChangeDatePass(event, i) {
    if (event.target.valueAsNumber) {
      var current_count = event.target.value;
      this.datePassenger[i] = current_count;
      var edad = this.CalculateAge(event.target.value)
      if (edad != null) this.edadesPasajeros[i] = edad;
    }
  }
  ChangeMovilidad(value: boolean) {
    this.movilidadEspecial = value;
  }

  ChangeVuelo(value: boolean) {
    this.Vuelo = value;
  }
  BuildSailDate() {
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split('-');
      this.sailDate = split[0] + '-' + split[1] + '-' + split[2];
    }
  }

  BuildMetaCategoria(metaCategoria: string): any {
    if (metaCategoria == 'Interior')
      return 'I';
    else if (metaCategoria == 'Exterior')
      return 'O';
    else if (metaCategoria == 'Balcon')
      return 'B';
    else if (metaCategoria == 'Suite')
      return 'S';
    return null;
  }

  InitData() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.loadingLabels = true;
    this.errorLoadingLabels = false;
    var currentFilter =
    {
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      Nnoches: this.itinerary.nnoches.toString(),
      PuertoSalidaCode: this.itinerary.departurePortCode,
      Saildate: this.sailDate,
      SalidaCode: this.selectedDate.idSalidas.toString(),
      Metacategoria: this.BuildMetaCategoria(this.selectedCategoryRoom),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      ListaPasajeros: this.ListaPasajeros,
      PackageId: this.selectedDate.packageId.toString(),
      TarifaPromoId: '',
      PriceProgramId: '',
      ConVueloIncluido: this.selectedDate.tieneVuelos,
      CantPasajeros: '2',

    };
    const sources = [
      this.adminService.GetScreenPaxSelectionLocale(),
      this.adminService.GetPreDataTarifas(currentFilter),
      this.adminService.GetComboGateway(currentFilter),
      this.adminService.GetScreenTarifaSelectionLocale(),
      this.adminService.GetScreenTarifaSelectionLocale(),
      this.adminService.GetScreenValidationLocale(),
      this.adminService.GetScreenPaxDataLocale()
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo, DataTarifas, comboGateway, tarifaSelectionLocale, otherValidation, messageValidate, screenLangInfoTwo]: any[]) => {
          this.messageValidate = messageValidate
          this.screenLangInfo = screenInfo;
          this.MostrarVuelo = DataTarifas.mostrarVueloIncluido;
          this.cantMaxPassengers = DataTarifas.maxNumberPax;
          this.aereopuerto = DataTarifas.gateways;

          this.screenLangInfoTwo = screenLangInfoTwo;

          this.userPreferences.setElement("preDataTarifas", DataTarifas);
          this.aereopuerto = comboGateway

          this.preDataTarifas = DataTarifas

          this.lbl_cmb_AeropuertoTitle = this.screenLangInfo.lbl_cmb_AeropuertoTitle

          this.lbl_TarifaAgotada = tarifaSelectionLocale.lbl_TarifaAgotada
          //Nueva linea
          if (this.aereopuerto != null) {
            this.aereopuertoLength = this.aereopuerto.length
            if (this.aereopuerto != null) {              
              this.mostrarVueloIncluido = DataTarifas.mostrarVueloIncluido && !this.selectedDate.tieneVuelos && this.aereopuerto.length > 0;
              this.mostrarVueloObligatorio = DataTarifas.mostrarVueloIncluido && this.selectedDate.tieneVuelos && this.aereopuerto.length > 0;
            }
          }
          if (this.itinerary.nnoches == '1') {
            var noche = this.screenLangInfo.lbl_noche;
            this.screenLangInfo.lbl_nochesEnEl = noche;

          }
          this.loadingLabels = false;
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
  UpdateReservation() {
    if (!this.reservation) {
      this.reservation = {};
    }
    this.reservation.clubFidelizacion = this.clubFidelizacion;
    this.reservation.movilidadEspecial = this.movilidadEspecial;
    this.reservation.pasajeros = this.BuildPassengers();
    this.userPreferences.setElement("Reservation", this.reservation);
  }
  BuildPassengers(): any[] {
    var result: any[] = [];
    var i = 0;
    this.edadesPasajeros.forEach((edad, index) => {
      var current_passenger: any = {};
      current_passenger.edad = String(edad);
      var salvarClub = "";
      if (this.loyaltyPasajeros[i]) {
        salvarClub = this.loyaltyPasajeros[i];
      }
      var salvarCodigoPromo = "";
      if (this.codigoPromocional) {
        salvarCodigoPromo = this.codigoPromocional;
      }

      i = i + 1;
      current_passenger.LoyaltyNumber = salvarClub;
      current_passenger.codigoPromocional = salvarCodigoPromo;
      current_passenger.nombre = "";
      current_passenger.apellido = "";
      current_passenger.telefono = "";
      current_passenger.correo = "";
      current_passenger.TurnoComida = "";
      current_passenger.titulo = "Sr";
      current_passenger.tipoDocumento = "";
      current_passenger.fechaNacimiento = this.datePassenger[index] ? this.datePassenger[index] : "";
      current_passenger.nacionalidad = "";
      current_passenger.numeroDocumento = "";
      result.push(current_passenger);
    });
    return result;
  }
  ShowItinerary(value: boolean) {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ItineraryinfoComponent, { size: 'lg', centered: true });
    (<ItineraryinfoComponent>modalRef.componentInstance).tabItinerary = value;
    this.modalSubscription = from(modalRef.result).subscribe();
  }
  DateMinMax(i) {
    if ( i == null || i == "" || i == "undefined") {  return false; }
    console.log("i", i)
    return new Date(i).getTime() < this.minDate.getTime() || new Date(i).getTime() > this.maxDate.getTime() 
  }

  EmitValidData(): boolean {
    var result = true;
    if (this.mostrarVueloIncluido || this.mostrarVueloObligatorio) {
            result =  result && this.selectedAereopuerto != null && this.selectedAereopuerto != "undefined"  && this.selectedAereopuerto != "";
    }
    if (this.preDataTarifas.mostrarFNac) {
      var arrayio = Array.from({length: this.datePassenger.length}, i => i = false);
      for (let index = 0; index < this.datePassenger.length; index++) {
        arrayio[index] = (this.datePassenger[index] != null && this.datePassenger[index] != "undefined" && this.datePassenger[index] != "" &&  !this.VerifyAge(index) &&  !this.DateMinMax(this.datePassenger[index]));
      }
      result = result &&  !arrayio.includes(false) && this.datePassenger.length > 0 && this.datePassenger.length == this.cantidadPasajeros;
    }    
    return result;
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

  ChangeSelectedAirPort(event) {
    this.reservation.VueloSeleccionado = this.aereopuerto[event.target["selectedIndex"]];
    this.reservation.ConVueloIncluido = true;
    this.userPreferences.setElement("Reservation", this.reservation);
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
  VerifyAge(index){
    if(this.datePassenger[index] != null && this.datePassenger[index] != "undefined" && this.datePassenger[index] != ""){
      var edadcalc = this.CalculateAge(this.datePassenger[index]);
     return edadcalc != this.edadesPasajeros[index];
    }
  } 
}
