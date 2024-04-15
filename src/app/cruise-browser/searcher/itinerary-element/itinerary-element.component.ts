import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, of, Subscription } from 'rxjs';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ItineraryinfoComponent } from '../itineraryinfo/itineraryinfo.component';
import { DomSanitizer } from '@angular/platform-browser';
import { _MatTabHeaderMixinBase } from '@angular/material/tabs/typings/tab-header';
import { catchError, delay, mergeMap, retryWhen, tap, timeout } from 'rxjs/operators';
import { ErrorWindowComponent } from '../error-window/error-window.component';
@Component({
  selector: 'app-itinerary-element',
  templateUrl: './itinerary-element.component.html',
  styleUrls: ['./itinerary-element.component.scss']
})
export class ItineraryElementComponent implements OnInit, OnDestroy {
  @Input() itinerary: any;
  @Input() screenLangInfo: any;
  @Output() ChangePosInPage: EventEmitter<any> = new EventEmitter();
  showItinerary: boolean = false
  loadingItinerary: boolean = false
  timeOutError: boolean = false
  errorMessage = ""
  messageValidate: any 

  errorEmit: any = {
    posInPage: false,
    showItinerary: true
  }

  selectedDate: any = null;
  selectedDateShow: any = null;
  selectedDateIndex: number = 0;
  selectedDateShowIndex: number = 0;
  totalPages: number = 0;
  pagesLoad: number = 0;
  currentPage: number;
  mostrarItinerarios: any[] = [];
  ItineraryDatesLoad: any[] = [];
  ShowItineraryDates: any[] = [];
  selectedCategoryRoom: string = 'Interior';
  modalSubscription: Subscription;
  dataSubscription: Subscription;
  selectedDateCategoryData: any = null;
  loadDates: boolean = false;
  reservation: any;
  cleanText: any;
  reservationMode: string;
  taxesPricePax: any;
  minPageLoad: number;
  maxPageLoad: number;
  indexBestDate: number;
  cantidadNoches: any;
  selectedmetacategoria: any;

  public getScreenWidth: any;
  public getScreenHeight: any;

  datesObject: any = {
    idSalidas: 0,
    fechaSalida: "",
    addons: [],
    recorrido: [],
    recorridoString: "",
    compannia: "",
    fechaSalidaString: "",
    tieneCupo: false,
    esNRF: false,
    tieneVuelos: false,
    idOfertas: null,
    precios: [],
    categoria: [],
    cabinasMasBaratas: [],
    taxesIncluidos: false,
    minPrecio: {
      valorPrincipalString: "",
      monedaP: "",
      valorLocalString: "",
      monedaL: null,
      posMoneda: 0,
      valorPrincipal: 0,
      valorLocal: 0
    },
    dateOut: {
      dia: "",
      mes: "",
      anno: ""
    },
    selectedCategoryRoom: ""
  }

  constructor(private adminService: AdminUsersService, private modalService: NgbModal,
    private userPreferences: UserPreferencesService, private router: Router, private sanitized: DomSanitizer) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  showHTML(valor) {
    //var valor1="dfdsfdsfdsfdsfdsfd<br>ffdsfdfdsfdsf\nfgdfg<br>dsfdf";
    //alert(valor1);
    var cleanIntermediate = valor.toString();
    //cleanIntermediate = cleanIntermediate + "\r\nfdfdsf\r\n";
    cleanIntermediate = cleanIntermediate.replace("\r\n", "<br/>");
    this.cleanText = cleanIntermediate;
    this.cleanText = this.transform(this.cleanText);
    return this.cleanText;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
  }
  ngOnInit() {

    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

    this.userPreferences.setElement("permitePaxNumber", "not");
    this.reservation = this.userPreferences.getElement('Reservation');
    if (this.itinerary.paginationCenterElemt) {
      this.minPageLoad = this.itinerary.paginationCenterElemt.pageNumber;
      this.maxPageLoad = this.itinerary.paginationCenterElemt.pageNumber;
      this.currentPage = this.itinerary.paginationCenterElemt.pageNumber;
      this.indexBestDate = this.itinerary.paginationCenterElemt.posInPage;
    }

    if (this.itinerary.nnoches == '1') {
      var noche = this.screenLangInfo.lbl_Itinerario_OracionNoNoche;
      this.cantidadNoches = noche;

    } else {
      var noche = this.screenLangInfo.lbl_Itinerario_OracionNoNoches;
      this.cantidadNoches = noche;
    }
    this.validationLocale()
    this.LoadItineraryDates(false);
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
    this.SaveSelectedDate();
    this.SaveItinerary();
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ItineraryinfoComponent, { size: 'lg', centered: true });
    (<ItineraryinfoComponent>modalRef.componentInstance).tabItinerary = value;
    this.modalSubscription = from(modalRef.result).subscribe();
  }
  ChangeCategoryRoom(value: string, price: any) {
    if (price != null && price != 0) {
      this.selectedCategoryRoom = value;
      this.selectedDateIndex = this.selectedDateShowIndex;
      this.selectedDate = this.ItineraryDatesLoad[this.selectedDateIndex];
      this.selectedDateShow = this.ItineraryDatesLoad[this.selectedDateIndex];
      this.SelectCategoryData();
      this.SaveSelectedDate();
      this.SaveItinerary();
    }
  }
  showError(errorValue) {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ErrorWindowComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenError = errorValue;
    this.modalSubscription = from(modalRef.result).subscribe();

  }
  validationLocale() {
    this.adminService.GetScreenValidationLocale().subscribe(next => {
      this.messageValidate = next
    },
    (error: HttpErrorResponse) => {
      
      var errorMessage = '';

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
    })
  }

  LoadItineraryDates(ini: boolean) {
    this.timeOutError = false
    this.loadingItinerary = false
    this.errorMessage = ""

    if (!this.loadDates) {
      this.loadDates = true;
      var pageSize = 5;
      if (!this.ItineraryDatesLoad) {
        this.ItineraryDatesLoad = [];
      }
      if (this.totalPages == 0 || (this.pagesLoad != this.totalPages)) {
        if (this.dataSubscription) {
          this.dataSubscription.unsubscribe();
        }
        var currentFilter =
        {
          PackageId: '',
          TarifaPromoId: '',
          PriceProgramId: '',
          ItinerarioCode: this.itinerary.itinerarioCode,
          MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
          Mercado: this.itinerary.mercado,
          Company: this.itinerary.company,
          ShipCode: this.itinerary.shipCode,
          Nnoches: this.itinerary.nnoches.toString(),
          PuertoSalidaCode: this.itinerary.departurePortCode,
          FechaDesde: (this.itinerary && this.itinerary.rangofechas && this.itinerary.rangofechas.fechaInicio)
            ? this.itinerary.rangofechas.fechaInicio.substring(0, 10) : null,
          FechaHasta: (this.itinerary && this.itinerary.rangofechas && this.itinerary.rangofechas.fechaFin)
            ? this.itinerary.rangofechas.fechaFin.substring(0, 10) : null,
          DestinoCode: this.itinerary.agrupacionZona.toString()
        };
        const sources = [
          this.adminService.GetSalidasXItinerario(currentFilter, this.currentPage, pageSize)
        ];
        const maxRetries = 2;
        const delayMs = 2000;
        let count = 0
        this.dataSubscription = forkJoin(sources)
          .pipe(
             // El Observable lanzará un error si no se emite un valor en 1min
       /* timeout(60000),
         retryWhen((errors) =>
              errors.pipe(
                mergeMap((error, index) => {
                  if (index < maxRetries) {
                    return of(error).pipe(delay(delayMs));
                  }
                  throw error;
                })
              )
            ),*/
          )
          .subscribe(
            ([dates]: any[]) => {
              if (dates.data.length > 0) {
                if (this.totalPages == 0) {
                  //New add
                  if (dates.data.length > 0) {
                    this.indexBestDate = dates.data[0].paginationCenterElemt.posInPage
                    if (dates.data.length > this.indexBestDate) {
                      var date = dates.data[this.indexBestDate]
                    } else {
                      var date = dates.data[0]
                    }
                  }
                  //End new add

                  date.minPrecio = this.BuildMinPrice(date, false);
                  date.dateOut = this.BuildDateFormatDate(date.fechaSalidaString);

                  date.selectedCategoryRoom = this.BuildCategoryRoom(date);
                  this.selectedDate = date;
                  this.selectedDateShow = date;
                  this.selectedDateIndex = this.indexBestDate;
                  this.selectedDateShowIndex = this.indexBestDate;

                  this.selectedCategoryRoom = date.selectedCategoryRoom;
                  this.selectedDateCategoryData = this.BuildMinPrice(date, true);

                }
                var newElements: any[] = [];
                for (let index = 0; index < dates.data.length; index++) {
                  var date = dates.data[index];
                  date.minPrecio = this.BuildMinPrice(date, false);
                  date.dateOut = this.BuildDateFormatDate(date.fechaSalidaString);
                  date.selectedCategoryRoom = this.BuildCategoryRoom(date);
                  newElements.push(date);
                }
                
                if (ini) {
                  this.ItineraryDatesLoad = newElements.concat(this.ItineraryDatesLoad);
                  
                }
                else {
                  this.ItineraryDatesLoad = this.ItineraryDatesLoad.concat(newElements);
                  
                }
                if (this.totalPages == 0) {
                  
                  this.BuildShowDates();
                }
                else {
                  if (ini) {
                    this.indexBestDate += dates.data.length;
                    this.selectedDateShowIndex += dates.data.length;
                    this.selectedDateIndex += dates.data.length;
                  }
                  
                  this.BuildShowDates();
                }
                this.loadDates = false;
                this.totalPages = dates.totalPages;
                this.pagesLoad++;
              }
            },
            (error: HttpErrorResponse) => {
              this.loadingItinerary = true
              this.timeOutError = true
                          
            var errorMessage = '';

            if (error.error instanceof ErrorEvent) {
              // client-side error
              errorMessage = `Error: ${error.error.message}`;
            } else {
              // server-side error
              errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            }

            if (Object.keys(error.error).length != 0 && typeof (error.error) === 'string') {
              this.errorMessage = error.error

            } else {

              if (error.error.value && typeof (error.error) === 'object') {
                this.errorMessage = error.error.value
              } else {
                if (error.status == 400) {
                  this.errorMessage = this.messageValidate.err_400Controlado
                }
                if (error.status == 404) {
                  this.errorMessage = this.messageValidate.err_404PaginaNoEncontrada
                }
                if (error.status == 500) {
                  this.errorMessage = this.messageValidate.err_500NoControlado
                }
              }

            }
            console.error(errorMessage);
              this.loadDates = false;
            }, () => this.loadingItinerary = true);
      }
    }

  }
  LoadItineraryDatesOld(ini: boolean) {
    if (!this.loadDates) {
      this.loadDates = true;
      var pageSize = 5;
      if (!this.ItineraryDatesLoad) {
        this.ItineraryDatesLoad = [];
      }
      if (this.totalPages == 0 || (this.pagesLoad != this.totalPages)) {
        if (this.dataSubscription) {
          this.dataSubscription.unsubscribe();
        }
        var currentFilter =
        {
          PackageId: '',
          TarifaPromoId: '',
          PriceProgramId: '',
          ItinerarioCode: this.itinerary.itinerarioCode,
          MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
          Mercado: this.itinerary.mercado,
          Company: this.itinerary.company,
          ShipCode: this.itinerary.shipCode,
          Nnoches: this.itinerary.nnoches.toString(),
          PuertoSalidaCode: this.itinerary.departurePortCode,
          FechaDesde: (this.itinerary && this.itinerary.rangofechas && this.itinerary.rangofechas.fechaInicio)
            ? this.itinerary.rangofechas.fechaInicio.substring(0, 10) : null,
          FechaHasta: (this.itinerary && this.itinerary.rangofechas && this.itinerary.rangofechas.fechaFin)
            ? this.itinerary.rangofechas.fechaFin.substring(0, 10) : null,
          DestinoCode: this.itinerary.agrupacionZona.toString()
        };
        const sources = [
          this.adminService.GetSalidasXItinerario(currentFilter, this.currentPage, pageSize)
        ];
        this.dataSubscription = forkJoin(sources)
          .subscribe(
            ([dates]: any[]) => {

              if (dates.data.length > 0) {
                if (this.totalPages == 0) {
                  //New add
                  if (dates.data.length > 0) {
                    this.indexBestDate = dates.data[0].paginationCenterElemt.posInPage
                    if (dates.data.length > this.indexBestDate) {

                      // var date = dates.data[this.indexBestDate].salidaMinPrecio
                      var date = dates.data[this.indexBestDate]
                    } else {
                      //var date = dates.data[0].salidaMinPrecio
                      var date = dates.data[0]
                    }
                  }
                  //var date = dates.data[0].salidaMinPrecio
                  //End new add

                  date.minPrecio = this.BuildMinPrice(date, false);
                  date.dateOut = this.BuildDateFormatDate(date.fechaSalidaString);

                  date.selectedCategoryRoom = this.BuildCategoryRoom(date);
                  this.selectedDate = date;
                  this.selectedDateShow = date;
                  this.selectedDateIndex = this.indexBestDate;
                  this.selectedDateShowIndex = this.indexBestDate;

                  this.selectedCategoryRoom = date.selectedCategoryRoom;
                  //this.selectedDateCategoryData = this.BuildMinPrice(this.itinerary.salidaMinPrecio, true);
                  this.selectedDateCategoryData = this.BuildMinPrice(date, true);


                  // } 
                  /*else {
                    
                    this.itinerary.salidaMinPrecio.minPrecio = this.BuildMinPrice(this.itinerary.salidaMinPrecio, false);
                    this.itinerary.salidaMinPrecio.dateOut = this.BuildDateFormatDate(this.itinerary.salidaMinPrecio.fechaSalidaString);

                    date.salidaMinPrecio.selectedCategoryRoom = this.BuildCategoryRoom(date.salidaMinPrecio);
                    this.selectedDate = date.salidaMinPrecio;
                    this.selectedDateShow = date.salidaMinPrecio;

                    this.selectedCategoryRoom = this.itinerary.salidaMinPrecio.selectedCategoryRoom;
                    this.selectedDateCategoryData = this.BuildMinPrice(this.itinerary.salidaMinPrecio, true);
                   
                  }*/
                  // }
                  /*else {
                    this.itinerary.salidaMinPrecio.minPrecio = this.BuildMinPrice(this.itinerary.salidaMinPrecio, false);
                      this.itinerary.salidaMinPrecio.dateOut = this.BuildDateFormatDate(this.itinerary.salidaMinPrecio.fechaSalidaString);

                    date.salidaMinPrecio.selectedCategoryRoom = this.BuildCategoryRoom(date.salidaMinPrecio);
                      this.selectedDate = date.salidaMinPrecio;
                      this.selectedDateShow = date.salidaMinPrecio;

                      this.selectedCategoryRoom = this.itinerary.salidaMinPrecio.selectedCategoryRoom;
                      this.selectedDateCategoryData = this.BuildMinPrice(this.itinerary.salidaMinPrecio, true);
                    
                  }*/
                }
                var newElements: any[] = [];
                for (let index = 0; index < dates.data.length; index++) {
                  var date = dates.data[index];
                  date.minPrecio = this.BuildMinPrice(date, false);
                  date.dateOut = this.BuildDateFormatDate(date.fechaSalidaString);
                  date.selectedCategoryRoom = this.BuildCategoryRoom(date);
                  newElements.push(date);
                }
                if (ini) {
                  this.ItineraryDatesLoad = newElements.concat(this.ItineraryDatesLoad);
                }
                else {
                  this.ItineraryDatesLoad = this.ItineraryDatesLoad.concat(newElements);
                }
                if (this.totalPages == 0) {
                  this.BuildShowDates();
                }
                else {
                  if (ini) {
                    this.indexBestDate += dates.data.length;
                    this.selectedDateShowIndex += dates.data.length;
                    this.selectedDateIndex += dates.data.length;
                  }
                  this.BuildShowDates();
                }
                this.loadDates = false;
                this.totalPages = dates.totalPages;
                this.pagesLoad++;
              }
            },
            (error: HttpErrorResponse) => {
              this.loadDates = false;
            }, () => this.loadingItinerary = true);
      }
    }

  }
  LoadXmls() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    var currentFilter =
    {
      PackageId: '',
      TarifaPromoId: '',
      PriceProgramId: '',
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      Nnoches: this.itinerary.nnoches.toString(),
      SalidaCode: this.selectedDate.idSalidas.toString(),
      Saildate: this.BuildSailDate(),
      Metacategoria: this.BuildMetaCategoria(this.selectedCategoryRoom),
      PrecioCabinaMasBarata: this.BuildPrecios(this.selectedCategoryRoom),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      PuertoSalidaCode: this.itinerary.departurePortCode,
    };
    if (this.selectedCategoryRoom == 'Interior') {
      this.selectedmetacategoria = this.selectedDate.cabinasMasBaratas[0].metacategoria;
    }
    else if (this.selectedCategoryRoom == 'Exterior') {
      this.selectedmetacategoria = this.selectedDate.cabinasMasBaratas[1].metacategoria;
    }
    else if (this.selectedCategoryRoom == 'Balcon') {
      this.selectedmetacategoria = this.selectedDate.cabinasMasBaratas[2].metacategoria;
    }
    else {
      this.selectedmetacategoria = this.selectedDate.cabinasMasBaratas[3].metacategoria;
    }
    this.userPreferences.setElement('SelectedCategoria', this.selectedmetacategoria);
    this.userPreferences.setElement('SelectedMetacategoria', this.selectedCategoryRoom);

    let bodyParams = {
      ItinerarioCode: currentFilter.ItinerarioCode,
      MonedaMercado: currentFilter.MonedaMercado,
      Mercado: currentFilter.Mercado,
      Company: currentFilter.Company,
      ShipCode: currentFilter.ShipCode,
      Nnoches: currentFilter.Nnoches,
      PuertoSalidaCode: currentFilter.PuertoSalidaCode,
      Saildate: currentFilter.Saildate,
      ListaPasajeros: [
        {
          edad: "",
          loyaltyNumber: "",
          codigoPromocional: "",
          nombre: "",
          apellido: "",
          telefono: "",
          fechaNacimiento: "",
          correo: "",
          numeroDocumento: "",
          titulo: "",
          tipoDocumento: "",
          nacionalidad: "",
          TurnoComida: ""
        },
        {
          edad: "",
          loyaltyNumber: "",
          codigoPromocional: "",
          nombre: "",
          apellido: "",
          telefono: "",
          fechaNacimiento: "",
          correo: "",
          numeroDocumento: "",
          titulo: "",
          tipoDocumento: "",
          nacionalidad: "",
          TurnoComida: ""
        }
      ],
      CantPasajeros: "2",
      SalidaCode: currentFilter.SalidaCode,
      Metacategoria: currentFilter.Metacategoria,
      DestinoCode: currentFilter.DestinoCode,
      ConVueloIncluido: false,
      PackageId: currentFilter.PackageId,
      TarifaPromoId: currentFilter.TarifaPromoId,
      PriceProgramId: currentFilter.PriceProgramId
    }

    const sources = [
      this.adminService.LoadXMLShipCabinMap(currentFilter),
      this.adminService.GetPreDataTarifas(bodyParams)
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([data,preData]: any[]) => {

          this.userPreferences.setElement('maxEdadNinno', preData.maxEdadNinno)//Nueva linea
          this.userPreferences.setElement("mostrarVueloIncluido",preData.mostrarVueloIncluido)//Nueva linea

          this.SaveSelectedDate();
          this.SaveItinerary();
          this.reservationMode = 'Offline';
          localStorage.setItem('SoloCotizacionOnline', 'false');
          if (preData) {
            if (preData.modo == "Online") {
              this.reservationMode = 'Online';              
            }
            localStorage.setItem('SoloCotizacionOnline', preData.soloCotizacionOnline);
          }
         
          this.userPreferences.setElement('ModoReservacion', this.reservationMode);
          //this.reservationMode='Online';
          this.reservation.CotizacionConfig = preData;
          this.UpdateReservation();
          this.userPreferences.setCompany(this.itinerary.company);

          if (this.reservationMode == 'Online') {
            this.router.navigate(['cruisebrowser', 'passengersnumber']);
          }

          if (this.reservationMode == 'Offline') {
            this.userPreferences.setElement("maxNumberPax", preData.maxNumberPax);

            if (preData.permitePaxNumber) {
              this.userPreferences.setElement("permitePaxNumber", "yes");
              this.router.navigate(['cruisebrowser', 'passengersnumberoffline']);
            } else {
              this.router.navigate(['cruisebrowser', 'selectionrates']);
            }
          }

        },
        (error: HttpErrorResponse) => {
        });
  }
  ShowPassengersNumber() {
    this.LoadXmls();
  }
  
  ValidateDiasValidosReserva() {
    var fechadesde = new Date().getTime();
    var fechahasta = new Date(this.selectedDate.fechaSalida).getTime();    
    var diff_ =(fechahasta - fechadesde)/(1000 * 60 * 60 * 24);
    return diff_ > Number(this.reservation.CotizacionConfig.diasSoloCotizacion);    
  }
  UpdateReservation() {
    if (!this.reservation) {
      this.reservation = {};
    }

    this.reservation.idItinerario = this.itinerary.itinerarioCode;
    this.reservation.idSalida = this.selectedDate.idSalidas;
    this.reservation.idCategoriaHabitacion = this.selectedCategoryRoom;
    //this.reservation.metacategoria = this.se
    this.reservation.mode = this.reservationMode;
    if (this.reservationMode == 'Offline') {
      //this.reservation.pasajeros=2;
      this.userPreferences.setElement("PaxTotal", "2");
    }
    this.userPreferences.setElement('Reservation', this.reservation);
  }
  SelectDate(index: number) {
    this.selectedDateIndex = index;
    this.selectedDateShowIndex = index;
    this.selectedDate = this.ItineraryDatesLoad[index];
    this.selectedDateShow = this.ItineraryDatesLoad[index];
    this.selectedCategoryRoom = this.selectedDate.selectedCategoryRoom;
    this.SelectCategoryData();
    this.SaveSelectedDate();
    this.SaveItinerary();
    this.BuildShowDates();
    if (this.ItineraryDatesLoad.length >= 5 && (this.selectedDateShowIndex >= this.ItineraryDatesLoad.length - 3)) {
      if (this.maxPageLoad != this.totalPages && !this.loadDates) {
        this.maxPageLoad++;
        this.currentPage = this.maxPageLoad;
        this.LoadItineraryDates(false);
      }
    }
    else if (this.selectedDateShowIndex < 2) {
      if (this.minPageLoad > 1 && !this.loadDates) {
        this.minPageLoad--;
        this.currentPage = this.minPageLoad;
        this.LoadItineraryDates(true);
      }
    }
  }
  NextDate() {
    if (this.selectedDateShowIndex < this.ItineraryDatesLoad.length - 1) {
      this.selectedDateShowIndex++;
      this.selectedDateIndex = this.selectedDateShowIndex;
      this.selectedDateShow = this.ItineraryDatesLoad[this.selectedDateShowIndex];
      this.BuildShowDates();
    }
    if (this.ItineraryDatesLoad.length >= 5 && (this.selectedDateShowIndex >= this.ItineraryDatesLoad.length - 3)) {
      if (this.maxPageLoad != this.totalPages && !this.loadDates) {
        this.maxPageLoad++;
        this.currentPage = this.maxPageLoad;
        this.LoadItineraryDates(false);
      }
    }
  }
  PreviousDate() {
    if (this.selectedDateShowIndex > 0) {
      this.selectedDateShowIndex--;
      this.selectedDateIndex = this.selectedDateShowIndex;

      this.selectedDateShow = this.ItineraryDatesLoad[this.selectedDateShowIndex];
      this.BuildShowDates();
      if (this.selectedDateShowIndex < 2) {
        if (this.minPageLoad > 1 && !this.loadDates) {
          this.minPageLoad--;
          this.currentPage = this.minPageLoad;
          this.LoadItineraryDates(true);
        }
      }
    }
  }
  BuildShowDates() {
    this.ShowItineraryDates = [];
    if (this.selectedDateShowIndex == 0) {
      for (let index = 0; index < this.ItineraryDatesLoad.length; index++) {
        const date = this.ItineraryDatesLoad[index];
        if (index < 2) {
          this.ShowItineraryDates.push({ index: index, date: date });
        }
        else {
          break;
        }
      }
    }
    else if (this.selectedDateShowIndex == this.ItineraryDatesLoad.length - 1) {
      if (this.ItineraryDatesLoad.length == 2) {
        for (let index = 0; index < this.ItineraryDatesLoad.length; index++) {
          const date = this.ItineraryDatesLoad[index];
          this.ShowItineraryDates.push({ index: index, date: date });
        }
      }
      else {
        for (let index = this.ItineraryDatesLoad.length - 2; index < this.ItineraryDatesLoad.length; index++) {
          const date = this.ItineraryDatesLoad[index];
          this.ShowItineraryDates.push({ index: index, date: date });
        }
      }
    }
    else {

      for (let index = this.selectedDateShowIndex - 1; index <= this.selectedDateShowIndex + 1; index++) {
        //Add
        let date
        if (this.ItineraryDatesLoad[index]) {
          date = this.ItineraryDatesLoad[index];
          this.ShowItineraryDates.push({ index: index, date: date });
        }
      }
    }
  }
  SaveSelectedDate() {
    this.userPreferences.setElement('SelectedDate', this.selectedDate);
    if (this.selectedCategoryRoom == 'Interior') {
      this.selectedmetacategoria = this.selectedDate.cabinasMasBaratas[0].metacategoria;
    }
    else if (this.selectedCategoryRoom == 'Exterior') {
      this.selectedmetacategoria = this.selectedDate.cabinasMasBaratas[1].metacategoria;
    }
    else if (this.selectedCategoryRoom == 'Balcon') {
      this.selectedmetacategoria = this.selectedDate.cabinasMasBaratas[2].metacategoria;
    }
    else {
      this.selectedmetacategoria = this.selectedDate.cabinasMasBaratas[3].metacategoria;
    }
    this.userPreferences.setElement('SelectedCategoria', this.selectedmetacategoria);
    this.userPreferences.setElement('SelectedMetacategoria', this.selectedCategoryRoom);
  }
  SaveItinerary() {
    this.userPreferences.setElement('Itinerary', this.itinerary);
  }
  BuildMinPrice(date, updateTaxes: Boolean): any {
    var minPrice = 5000000; //Max Value
    var result = 0;
    if (date && date.cabinasMasBaratas && date.cabinasMasBaratas.length > 0) {
      date.cabinasMasBaratas.forEach(element => {
        if (element.precioCabinaPax && element.precioCabinaPax.valorPrincipal && minPrice > element.precioCabinaPax.valorPrincipal) {
          result = element.precioCabinaPax;
          minPrice = element.precioCabinaPax.valorPrincipal;
          this.mostrarItinerarios[this.itinerary.itinerarioCode] = true;
          this.showItinerary = true

          if (updateTaxes) {
            this.taxesPricePax = element.precioTaxesPax;
          }
        } else {
          this.showItinerary = false

        }
      });
    }
    return result;
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
  SelectCategoryData() {
    var date = this.selectedDate;

    if (this.selectedCategoryRoom == 'Interior') {
      this.selectedDateCategoryData = date.cabinasMasBaratas[0].precioCabinaPax;
      this.taxesPricePax = date.cabinasMasBaratas[0].precioTaxesPax;
      this.selectedmetacategoria = date.cabinasMasBaratas[0].metacategoria;
    }
    else if (this.selectedCategoryRoom == 'Exterior') {
      this.selectedDateCategoryData = date.cabinasMasBaratas[1].precioCabinaPax;
      this.taxesPricePax = date.cabinasMasBaratas[1].precioTaxesPax;
      this.selectedmetacategoria = date.cabinasMasBaratas[1].metacategoria;
    }
    else if (this.selectedCategoryRoom == 'Balcon') {
      this.selectedDateCategoryData = date.cabinasMasBaratas[2].precioCabinaPax;
      this.taxesPricePax = date.cabinasMasBaratas[2].precioTaxesPax;
      this.selectedmetacategoria = date.cabinasMasBaratas[2].metacategoria;
    }
    else {
      this.selectedDateCategoryData = date.cabinasMasBaratas[3].precioCabinaPax;
      this.taxesPricePax = date.cabinasMasBaratas[3].precioTaxesPax;
      this.selectedmetacategoria = date.cabinasMasBaratas[3].metacategoria;
    }
    this.userPreferences.setElement('SelectedCategoria', this.selectedmetacategoria);
    this.userPreferences.setElement('SelectedMetacategoria', this.selectedCategoryRoom);
  }
  BuildSailDate(): any {
    var result = '';
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split('-');
      result = split[0] + '-' + split[1] + '-' + split[2];
    }
    return result;
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
  BuildDate(fecha: string): any {
    var result = '';
    if (fecha) {
      var split: string[] = fecha.substring(0, 10).split('-');
      result = split[2] + '-' + split[1] + '-' + split[0];
    }
    return result;
  }
  GetBGC(value): any {
    if (value == null || value == 0) {
      return '#B0B0B0';
    }
    else {
      return '';
    }
  }
  BuildCategoryRoom(date): any {
    var minPrice = 5000000; //Max Value
    var result = '';
    if (date && date.cabinasMasBaratas && date.cabinasMasBaratas.length > 0) {
      date.cabinasMasBaratas.forEach(element => {
        if (element.precioCabinaPax && element.precioCabinaPax.valorPrincipal && minPrice > element.precioCabinaPax.valorPrincipal) {
          switch (element.metacategoria) {
            case 'I':
              result = 'Interior';
              break;
            case 'O':
              result = 'Exterior';
              break;
            case 'B':
              result = 'Balcon';
              break;
            default:
              result = 'Suite';
              break;
          }
          minPrice = element.precioCabinaPax.valorPrincipal;
        }
      });
    }
    return result;
  }
  SelectBestDate() {
    this.SelectDate(this.indexBestDate);
  }
  ShowValue(value, valueString, monedaP: boolean): any {
    if (value == null || value == 0) {
      return monedaP ? this.screenLangInfo.lbl_CabinaNoDisponible : '';
    }
    else {
      return valueString;
    }
  }
  ShowMoneda(value, moneda: string): any {
    if (value == null || value == 0) {
      return '';
    }
    else {
      return moneda;
    }
  }
  HasValue(value): any {
    if (value == null || value == 0) {
      return false;
    }
    else {
      return true;
    }
  }
  GetStyleUnAvailable(): any {
    if (this.itinerary.mostrarMonedaLocal) {
      return '14px';
    }
    else {
      return '4px';
    }
  }
  GetCatTranslate(value: any): any {
    if (value == "Interior") {
      return this.screenLangInfo.lbl_Button_Interior;
    }
    else if (value == "Exterior") {
      return this.screenLangInfo.lbl_Button_Exterior;
    }
    else if (value == "Balcon") {
      return this.screenLangInfo.lbl_Button_Balcon;
    }
    else {
      return this.screenLangInfo.lbl_Button_Suite;
    }
  }

  LoadItineraryDatesCopy(ini: boolean) {
    if (!this.loadDates) {
      this.loadDates = true;
      var pageSize = 5;
      if (!this.ItineraryDatesLoad) {
        this.ItineraryDatesLoad = [];
      }
      if (this.totalPages == 0 || (this.pagesLoad != this.totalPages)) {
        if (this.dataSubscription) {
          this.dataSubscription.unsubscribe();
        }
        var currentFilter =
        {
          PackageId: '',
          TarifaPromoId: '',
          PriceProgramId: '',
          ItinerarioCode: this.itinerary.itinerarioCode,
          MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
          Mercado: this.itinerary.mercado,
          Company: this.itinerary.company,
          ShipCode: this.itinerary.shipCode,
          Nnoches: this.itinerary.nnoches.toString(),
          PuertoSalidaCode: this.itinerary.departurePortCode,
          FechaDesde: (this.itinerary && this.itinerary.rangofechas && this.itinerary.rangofechas.fechaInicio)
            ? this.itinerary.rangofechas.fechaInicio.substring(0, 10) : null,
          FechaHasta: (this.itinerary && this.itinerary.rangofechas && this.itinerary.rangofechas.fechaFin)
            ? this.itinerary.rangofechas.fechaFin.substring(0, 10) : null,
          DestinoCode: this.itinerary.agrupacionZona.toString()
        };
        const sources = [
          this.adminService.GetSalidasXItinerario(currentFilter, this.currentPage, pageSize)
        ];
        this.dataSubscription = forkJoin(sources)
          .subscribe(
            ([dates]: any[]) => {

              if (dates.data.length > 0) {
                if (this.totalPages == 0) {

                  if (this.indexBestDate < dates.data.length) {
                    if (dates.data[this.indexBestDate] != undefined || dates.data[this.indexBestDate] != null) {

                      var date = dates.data[this.indexBestDate];

                      date.minPrecio = this.BuildMinPrice(date, false);
                      date.dateOut = this.BuildDateFormatDate(date.fechaSalidaString);

                      date.selectedCategoryRoom = this.BuildCategoryRoom(date);
                      this.selectedDate = date;
                      this.selectedDateShow = date;
                      this.selectedDateIndex = this.indexBestDate;
                      this.selectedDateShowIndex = this.indexBestDate;

                      this.selectedCategoryRoom = date.selectedCategoryRoom;
                      this.selectedDateCategoryData = this.BuildMinPrice(this.itinerary.salidaMinPrecio, true);

                      /*this.errorEmit.posInPage = false

                      this.errorEmit.showItinerary = this.showItinerary
                      this.ChangePosInPage.emit(this.errorEmit)*/

                    } else {

                      this.itinerary.salidaMinPrecio.minPrecio = this.BuildMinPrice(this.itinerary.salidaMinPrecio, false);
                      this.itinerary.salidaMinPrecio.dateOut = this.BuildDateFormatDate(this.itinerary.salidaMinPrecio.fechaSalidaString);

                      this.itinerary.salidaMinPrecio.selectedCategoryRoom = this.BuildCategoryRoom(this.itinerary.salidaMinPrecio);
                      this.selectedDate = this.itinerary.salidaMinPrecio;
                      this.selectedDateShow = this.itinerary.salidaMinPrecio;

                      this.selectedCategoryRoom = this.itinerary.salidaMinPrecio.selectedCategoryRoom;
                      this.selectedDateCategoryData = this.BuildMinPrice(this.itinerary.salidaMinPrecio, true);

                      /*this.errorEmit.posInPage = true
                      this.errorEmit.showItinerary = this.showItinerary
                      this.ChangePosInPage.emit(this.errorEmit)*/
                    }
                  } else {
                    this.itinerary.salidaMinPrecio.minPrecio = this.BuildMinPrice(this.itinerary.salidaMinPrecio, false);
                    this.itinerary.salidaMinPrecio.dateOut = this.BuildDateFormatDate(this.itinerary.salidaMinPrecio.fechaSalidaString);

                    this.itinerary.salidaMinPrecio.selectedCategoryRoom = this.BuildCategoryRoom(this.itinerary.salidaMinPrecio);
                    this.selectedDate = this.itinerary.salidaMinPrecio;
                    this.selectedDateShow = this.itinerary.salidaMinPrecio;

                    this.selectedCategoryRoom = this.itinerary.salidaMinPrecio.selectedCategoryRoom;
                    this.selectedDateCategoryData = this.BuildMinPrice(this.itinerary.salidaMinPrecio, true);

                    /*this.errorEmit.posInPage = true
                    this.errorEmit.showItinerary = this.showItinerary
                    this.ChangePosInPage.emit(this.errorEmit)*/
                  }
                }
                var newElements: any[] = [];
                for (let index = 0; index < dates.data.length; index++) {
                  var date = dates.data[index];
                  date.minPrecio = this.BuildMinPrice(date, false);
                  date.dateOut = this.BuildDateFormatDate(date.fechaSalidaString);
                  date.selectedCategoryRoom = this.BuildCategoryRoom(date);
                  newElements.push(date);
                }
                if (ini) {
                  this.ItineraryDatesLoad = newElements.concat(this.ItineraryDatesLoad);
                }
                else {
                  this.ItineraryDatesLoad = this.ItineraryDatesLoad.concat(newElements);
                }
                if (this.totalPages == 0) {
                  this.BuildShowDates();
                }
                else {
                  if (ini) {
                    this.indexBestDate += dates.data.length;
                    this.selectedDateShowIndex += dates.data.length;
                    this.selectedDateIndex += dates.data.length;
                  }
                  this.BuildShowDates();
                }
                this.loadDates = false;
                this.totalPages = dates.totalPages;
                this.pagesLoad++;
              }
            },
            (error: HttpErrorResponse) => {
              this.loadDates = false;
            });
      }
    }

  }
}
