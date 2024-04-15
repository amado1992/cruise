import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { from, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ChoiceCabinComponent } from '../choice-cabin/choice-cabin.component';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { CallCenterComponent } from '../call-center/call-center.component';
import { ItineraryinfoComponent } from '../itineraryinfo/itineraryinfo.component';
import { ErrorWindowComponent } from '../error-window/error-window.component';
import { AgenciaService } from 'src/app/services/DataServices/agencia.service';

@Component({
  selector: 'app-stateroom-choice',
  templateUrl: './stateroom-choice.component.html',
  styleUrls: ['./stateroom-choice.component.scss']
})
export class StateroomChoiceComponent implements OnInit, OnDestroy {

  public getScreenWidth: any;
  public getScreenHeight: any;
  reservaMode:any
  messageValidate:any

  modalSubscription: Subscription;
  loadingLabels: boolean;
  experienciatitle:any;
  experienciaicon:any;
  experienciadescription:any;
  selectedcabin; any;
  errorLoadingLabels: boolean;
  dataSubscription: Subscription;
  screenLangInfo: any = null;
  screenLangInfoCabinas: any = null;
  itinerary: any;
  selectedDate: any;
  reservation: any;
  cleanDescriptionRate: any;
  selectedCategoryRoom: string;
  selectedDateCategoryData: any = null;
  params: ParamMap;
  queryParamSubscription: Subscription;
  IdItinerary: any;
  IdDate: any;
  categoryRoom: any;
  cantidadPasajeros: any;
  sailDate: any;
  cleanTitleRate: any;
  company: any;
  reservationMode: any;
  rateList: any[];
  rateTitle: string;
  existBR: boolean = false;
  filterBR: any;
  rates: any;
  ratesBR: any;
  selectedCabin: any;
  xcabinaxpasajero: any;
  priceprogramid: any;
  mostrarcallcenter: any;
  activeAgencia: any;
  constructor(private router: Router, private adminService: AdminUsersService, private modalService: NgbModal,
    private userPreferences: UserPreferencesService,
     private activatedRoute: ActivatedRoute, private sanitized: DomSanitizer,
      private cdRef : ChangeDetectorRef,
     private agenciaService: AgenciaService) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }

  ngAfterViewChecked() {
    if (this.loadingLabels || !this.loadingLabels) { // check if it change, tell CD update view
      
      this.cdRef.detectChanges();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
  }

  ngOnInit() {
    
    this.activeAgencia = this.agenciaService.getAgenciabyurl(this.userPreferences.getUrlConexion());
    this.userPreferences.setElement("backReservationSummary", false);

    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    
    this.cantidadPasajeros = this.userPreferences.getElement("PaxTotal");
    this.itinerary = this.userPreferences.getElement("Itinerary");
    var cabina = this.userPreferences.getElement('Experiencia');
    this.reservaMode = this.userPreferences.getElement("BookingMode")

    if((this.itinerary.company == 'MSC')&&(cabina!=null)){
    this.experienciatitle = cabina.titulo;
    this.experienciadescription = cabina.descripion;
    this.experienciaicon = cabina.urlIcon;
    }
    this.priceprogramid = this.userPreferences.getElement('priceProgramId');
    this.existBR = this.userPreferences.getElement("existBR");
    this.rates = this.userPreferences.getElement("rates");
    this.mostrarcallcenter = this.activeAgencia.MostrarCallCenter;
    this.ratesBR = this.userPreferences.getElement("ratesBR");
    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    this.queryParamSubscription = this.activatedRoute.queryParamMap.subscribe(params => {
    this.params = params;
    });
    if (this.params.keys.length > 0) {
      this.ProcessQueryParams();
      if (this.IdItinerary && this.IdItinerary.trim() != '' && this.IdDate && this.IdDate.trim() != '' &&
        this.categoryRoom && this.categoryRoom.trim() != '' && this.sailDate && this.sailDate.trim() != '' &&
        this.company && this.company.trim() != '') {
        this.LoadItinerary();
      }
    }
    else {
      this.selectedDate = this.userPreferences.getElement("SelectedDate");
      this.cantidadPasajeros = this.userPreferences.getElement("PaxTotal");
      
      this.reservation = this.userPreferences.getElement("Reservation");
      this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
      this.SelectCategoryData();
      this.BuildSailDate();
      if (this.cantidadPasajeros == undefined) {
        this.cantidadPasajeros = "2";
        this.reservation.pasajeros = [];
      }
      this.InitData();      
    }        
  }
  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    if (this.queryParamSubscription) {
      this.queryParamSubscription.unsubscribe();
    }
  }
  showVentana() {


    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(CallCenterComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenInfoCallCenter = "";
    this.modalSubscription = from(modalRef.result).subscribe();

  }

  InitData() {

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.loadingLabels = true;
    this.errorLoadingLabels = false;
    var arreglosinloyalty = []
    for (var key in this.reservation.pasajeros) {
      arreglosinloyalty.push({
        "edad": String(this.reservation.pasajeros[key].edad),
        "loyaltyNumber": "",
        "codigoPromocional": ""
      })
    }
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
      ListaPasajeros: arreglosinloyalty,
      CantPasajeros: this.cantidadPasajeros ? this.cantidadPasajeros.toString() : "2",
      SalidaCode: this.selectedDate.idSalidas.toString(),
      Metacategoria: this.BuildMetaCategoria(this.selectedCategoryRoom),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
    };
    const sources = [
      this.adminService.GetScreenTarifaSelectionLocale(),
      this.adminService.GetScreenCabinaNumberSelection(),
      this.adminService.GetScreenValidationLocale()
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo, screenLangInfoCabinas, messageValidate]: any[]) => {
          this.messageValidate = messageValidate
          this.loadingLabels = false;
          this.screenLangInfo = screenInfo;
          if (this.itinerary.nnoches == '1') {
            var noche = this.screenLangInfo.lbl_noche;
            this.screenLangInfo.lbl_nochesEnEl = noche;

          }
          this.screenLangInfoCabinas = screenLangInfoCabinas;
          this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
          this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]", this.cantidadPasajeros.toString());
          
          this.CompareRates(this.rates, this.ratesBR);
          this.ChangeCategory(this.selectedCabin);
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

  showHTML(valor) {
    
    var cleanIntermediate = valor.toString();

    cleanIntermediate = cleanIntermediate.toString().replace("\r\n", "<br/>");

    let cleanText = cleanIntermediate;
        cleanText = this.transform(cleanText);
    return cleanText;
  }
  ShowItinerary(value: boolean) {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ItineraryinfoComponent, { size: 'lg', centered: true });
    (<ItineraryinfoComponent>modalRef.componentInstance).tabItinerary = value;
    this.modalSubscription = from(modalRef.result).subscribe();
  }
  ShowSearch() {
    this.router.navigate(['cruisebrowser', 'searcher']);
  }
  ShowSelectionRates() {
    this.router.navigate(['cruisebrowser', 'selectionrates']);
  }
  PassengersNumber() {
    this.router.navigate(['cruisebrowser', 'passengersnumber']);
  }
  CabinChoice() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ChoiceCabinComponent, { size: 'lg', centered: true });
    this.modalSubscription = from(modalRef.result).subscribe();
  }
  ShowPassengerQuote() {
    this.router.navigate(['cruisebrowser', 'passengerdata']);
  }
  SelectCategoryData() {
    var modo = this.userPreferences.getElement('Reservation');
    if (modo.mode == 'Offline') {
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
    } else {
      var date = this.selectedDate;
      if (this.selectedCategoryRoom == 'Interior') {
        this.selectedDateCategoryData = date.cabinasMasBaratas[0].precioCabina;
      }
      else if (this.selectedCategoryRoom == 'Exterior') {
        this.selectedDateCategoryData = date.cabinasMasBaratas[1].precioCabina;
      }
      else if (this.selectedCategoryRoom == 'Balcon') {
        this.selectedDateCategoryData = date.cabinasMasBaratas[2].precioCabina;
      }
      else {
        this.selectedDateCategoryData = date.cabinasMasBaratas[3].precioCabina;
      }
    }
  }
  ChangeCategory(selectCabin: any) {    
    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.cleanTitleRate = "<strong>" + this.screenLangInfo.lbl_tarifa + ":</strong> " + this.reservation.rate.tarifa.titulo;
    var cleanIntermediate = this.cleanTitleRate.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanTitleRate = cleanIntermediate;
    this.cleanTitleRate = this.transform(this.cleanTitleRate + "&nbsp;");
    this.rateTitle = this.cleanTitleRate;
    this.cleanDescriptionRate = '<img *ngIf="this.reservation.rate.icon" src="' + this.reservation.rate.tarifa.icon + '"style="max-height: 35px; min-width: 5px;">' + this.reservation.rate.tarifa.descripcion;
    var cleanIntermediate = this.cleanDescriptionRate.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanDescriptionRate = cleanIntermediate;
    this.cleanDescriptionRate = this.transform(this.cleanDescriptionRate);
    var modo = this.userPreferences.getElement('Reservation');
    if (modo.mode == 'Offline') {
      this.selectedDateCategoryData = selectCabin.precioCabinaPax;
    } else {
      this.selectedDateCategoryData = selectCabin.precioCabina;
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
  ProcessQueryParams() {
    this.params.keys.forEach(key => {
      var values = this.params.getAll(key);
      if (values && values.length > 0) {
        switch (key) {
          case 'IdItinerary':
            {
              if (values[0].trim() != '') {
                this.IdItinerary = values[0].trim();
              }
            }
            break;
          case 'IdDate':
            {
              if (values[0].trim() != '') {
                this.IdDate = values[0].trim();
              }
            }
            break;
          case 'categoryRoom':
            {
              if (values[0].trim() != '') {
                this.categoryRoom = values[0].trim();
                this.selectedCategoryRoom = values[0].trim();
              }
            }
            break;
          case 'sailDate':
            {
              if (values[0].trim() != '') {
                this.sailDate = values[0].trim();
              }
            }
            break;
          case 'company':
            {
              if (values[0].trim() != '') {
                this.company = values[0].trim();
              }
            }
            break;
          default:
            {
            }
            break;
        }
      }
    });
  }
  UpdateReservation() {
    if (!this.reservation) {
      this.reservation = {};
    }
    this.reservation.idItinerario = this.IdItinerary;
    this.reservation.idSalida = this.IdDate;
    this.reservation.idCategoriaHabitacion = this.selectedCategoryRoom;
    this.reservation.mode = this.reservationMode;
    this.userPreferences.setElement('Reservation', this.reservation);
  }
  showError(errorValue) {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ErrorWindowComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenError = errorValue;
    this.modalSubscription = from(modalRef.result).subscribe();

  }

  LoadXmls() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    var currentFilter =
    {
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      Nnoches: this.itinerary.nnoches.toString(),
      SalidaCode: this.selectedDate.idSalidas.toString(),
      Saildate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(this.selectedCategoryRoom),
      PrecioCabinaMasBarata: this.BuildPrecios(this.selectedCategoryRoom),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      PuertoSalidaCode: this.itinerary.departurePortCode,
      PackageId:'',
      TarifaPromoId:'',
      PriceProgramId:'',
      FunctionalBranch: this.reservaMode
    };
    const sources = [
      this.adminService.LoadXMLShipCabinMap(currentFilter),
      this.adminService.GetPreDataTarifas(currentFilter)
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([data, mode]: any[]) => {
          this.SaveSelectedDate();
          this.SaveItinerary();
          this.reservationMode = (mode && mode.value) ? mode.value : 'Offline';
          this.UpdateReservation();
          this.SelectCategoryData();
          this.InitData();
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
          this.errorLoadingLabels = true;
        });
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
  SaveSelectedDate() {
    this.userPreferences.setElement('SelectedDate', this.selectedDate);
  }
  SaveItinerary() {
    this.userPreferences.setElement('Itinerary', this.itinerary);
  }
  LoadItinerary() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.loadingLabels = true;
    this.errorLoadingLabels = false;
    var currentFilter =
    {
      ItinerarioCode: this.IdItinerary,
      Company: this.company,
      SalidaCode: this.IdDate,
      Saildate: this.sailDate,
      FunctionalBranch: this.reservaMode
    };
    const sources = [
      this.adminService.GetItinerarioById(currentFilter)
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([loaditinerary]: any[]) => {
          if (loaditinerary && loaditinerary.length > 0 && loaditinerary[0].salidaUnica && loaditinerary[0].salidaUnica.length > 0) {
            this.itinerary = loaditinerary[0];
            this.selectedDate = loaditinerary[0].salidaUnica[0];
            this.selectedDate.dateOut = this.BuildDateFormatDate(this.selectedDate.fechaSalidaString);
            this.LoadXmls();
          }
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
  BuildDateFormatDate(dateOut: string): any {
    var result = {
      dia: '',
      mes: '',
      anno: ''
    };
    var split: string[] = dateOut.split(' ');
    result.dia = split[1];
    result.mes = split[0];
    result.anno = split[2] != '' ? split[2] : split[3];
    return result;
  }
  BuildSailDate() {
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split('-');
      this.sailDate = split[2] + '-' + split[1] + '-' + split[0];
    }
  }
  CompareRates(rates: any[], ratesBR) {
    if (rates && rates.length > 0) {
      rates.forEach(currentRate => {
        if (ratesBR && ratesBR.O) {
          var index = ratesBR.O.indexOf(currentRate.priceProgramId);
          if (index != -1) {
            ratesBR.O = ratesBR.O.replace(currentRate.priceProgramId, '');
          }
        }
        if (ratesBR && ratesBR.I) {
          var index = ratesBR.I.indexOf(currentRate.priceProgramId);
          if (index != -1) {
            ratesBR.I = ratesBR.I.replace(currentRate.priceProgramId, '');
          }
        }
        if (ratesBR && ratesBR.B) {
          var index = ratesBR.B.indexOf(currentRate.priceProgramId);
          if (index != -1) {
            ratesBR.B = ratesBR.B.replace(currentRate.priceProgramId, '');
          }
        }
        if (ratesBR && ratesBR.D) {
          var index = ratesBR.D.indexOf(currentRate.priceProgramId);
          if (index != -1) {
            ratesBR.D = ratesBR.D.replace(currentRate.priceProgramId, '');
          }
        }
        if (ratesBR && ratesBR.S) {
          var index = ratesBR.S.indexOf(currentRate.priceProgramId);
          if (index != -1) {
            ratesBR.S = ratesBR.S.replace(currentRate.priceProgramId, '');
          }
        }
      });
      if (ratesBR && ratesBR.O) {
        var split: string[] = ratesBR.O.split(',');
        if (split && split.length > 0) {
          var newValue = '';
          split.forEach(element => {
            if (element.trim() != '') {
              newValue += element.trim() + ',';
            }
          });
          if (newValue != '') {
            newValue = newValue.substring(0, newValue.length - 1);
            this.existBR = true;
          }
          ratesBR.O = newValue;
        }
      }
      if (ratesBR && ratesBR.I) {
        var split: string[] = ratesBR.I.split(',');
        if (split && split.length > 0) {
          var newValue = '';
          split.forEach(element => {
            if (element.trim() != '') {
              newValue += element.trim() + ',';
            }
          });
          if (newValue != '') {
            newValue = newValue.substring(0, newValue.length - 1);
            this.existBR = true;
          }
          ratesBR.I = newValue;
        }
      }
      if (ratesBR && ratesBR.B) {
        var split: string[] = ratesBR.B.split(',');
        if (split && split.length > 0) {
          var newValue = '';
          split.forEach(element => {
            if (element.trim() != '') {
              newValue += element.trim() + ',';
            }
          });
          if (newValue != '') {
            newValue = newValue.substring(0, newValue.length - 1);
            this.existBR = true;
          }
          ratesBR.B = newValue;
        }
      }
      if (ratesBR && ratesBR.D) {
        var split: string[] = ratesBR.D.split(',');
        if (split && split.length > 0) {
          var newValue = '';
          split.forEach(element => {
            if (element.trim() != '') {
              newValue += element.trim() + ',';
            }
          });
          if (newValue != '') {
            newValue = newValue.substring(0, newValue.length - 1);
            this.existBR = true;
          }
          ratesBR.D = newValue;
        }
      }
      if (ratesBR && ratesBR.S) {
        var split: string[] = ratesBR.S.split(',');
        if (split && split.length > 0) {
          var newValue = '';
          split.forEach(element => {
            if (element.trim() != '') {
              newValue += element.trim() + ',';
            }
          });
          if (newValue != '') {
            newValue = newValue.substring(0, newValue.length - 1);
            this.existBR = true;
          }
          ratesBR.S = newValue;
        }
      }
      this.filterBR = ratesBR;
      if (this.existBR == false) {
        rates.splice(0, 1);
      }
      this.rateList = rates;
    }
  }
  ShowPassengerDataReservation() {
    this.router.navigate(['cruisebrowser', 'passengerdatareservation']);
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
      CantPasajeros: this.cantidadPasajeros.toString(),
      ListaPasajeros: arreglosinloyalty,
      CategoriaCabina: this.selectedCabin.categoria,
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid
    };
    return currentFilter;
  }
  dataLoaded(child) {
    var retorno = child;
    if (retorno.campo == 1) {
      this.selectedCabin.deckCode = retorno.valor;
    } else {
      this.selectedCabin.cabinNumber = retorno.valor;
    }
  }
  TerminaCargar(child) {
    var retorno = child;
    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    if (retorno == true) {
      this.loadingLabels = false;
    }
  }
}
