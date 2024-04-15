import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, of, Subscription } from 'rxjs';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ChoiceCabinComponent } from '../choice-cabin/choice-cabin.component';
import { DomSanitizer } from '@angular/platform-browser';
import { forEach } from '@angular/router/src/utils/collection';
import { ThrowStmt } from '@angular/compiler';
import { ErrorWindowComponent } from '../error-window/error-window.component';
import { delay, mergeMap, retryWhen, timeout } from 'rxjs/operators';
@Component({
  selector: 'app-rate-element',
  templateUrl: './rate-element.component.html',
  styleUrls: ['./rate-element.component.scss']
})
export class RateElementComponent implements OnInit, OnDestroy, AfterViewInit {
  public getScreenWidth: any;
  public getScreenHeight: any;
  loadingRate: boolean = false
  timeOutError: boolean = false
  errorMessage = ""
  selectedCabinMin: any = null
  selectedShowCabinMin: any = null
  Vuelo: any
  aeropuertoId: any
  quotationMode: any
  messageValidate: any
  soloCotizacionOnline: any

  @Output() ChangeAgotado: EventEmitter<any> = new EventEmitter();

  @Input() screenLangInfo: any;
  @Input() bestRate: boolean = true;
  @Input() filterBR: any;
  @Input() enableProcess: any;
  @Input() indice: any;
  @Input() disponible: any;
  @Input() InteriorInfo: any;
  @Input() ExteriorInfo: any;
  @Input() SuiteInfo: any;
  @Input() BalconInfo: any;
  loadingLabels: boolean = true;
  @Input() rate: any;
  @Input() ratecomplete: any;
  @Output() ChangeCategory: EventEmitter<any> = new EventEmitter();
  @Output() TerminaCargar: EventEmitter<any> = new EventEmitter();
  @Output() EnableProcessFather: EventEmitter<any> = new EventEmitter();
  itinerary: any;
  selectedDate: any;
  listaCabinasxCubiertas: any;
  listaCabinas: any;
  listaImagenes: any;
  listaPlanos: any;
  cantidadPasajeros: any;
  priceprogramid: any;
  reservation: any;
  listadoCatSeleccionado: any = {};
  selectedCategoryRoom: string;
  dataSubscription: Subscription;
  modalSubscription: Subscription;
  selectedChildCabin: any = null;
  selectedShowCabin: any = null;
  selectedCabinIndex: number = 0;
  selectedShowCabinIndex: number = 0;
  DateCabinsLoad: { [metaCategoria: string]: any; } = {};
  ShowDateCabins: any[] = [];
  sailDate: string;
  loadCabins: boolean = false;
  cleanTitleRate: any;
  cleanDescriptionRate: any;
  selectedDateCategoryData: any = null;
  taxesPrices: any;
  DateIndexPageLoad: { [metaCategoria: string]: any; } = {};
  addonsValues: boolean = false;
  selectedCabinPos: number = 0;
  existFly: boolean = false;
  cleanText: any;
  cantPasajeros: any;
  promoid: any;
  xcabinaxpasajero: any;
  lowCabinsPrice: { [metaCategoria: string]: any; } = {};
  constructor(private router: Router, private adminService: AdminUsersService, private modalService: NgbModal,
    private userPreferences: UserPreferencesService, private sanitized: DomSanitizer) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }

  showError(errorValue) {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ErrorWindowComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenError = errorValue;
    this.modalSubscription = from(modalRef.result).subscribe();

  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
  }

  showHTML(valor) {
    var cleanIntermediate = valor.toString();
    cleanIntermediate = cleanIntermediate.replace("\r\n", "<br/>");
    this.cleanText = cleanIntermediate;
    this.cleanText = this.transform(this.cleanText);
    return this.cleanText;
  }
  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

    this.userPreferences.setElement('selectedCabinIndex', 0);
    this.selectedDate = this.userPreferences.getElement('SelectedDate');
    this.itinerary = this.userPreferences.getElement('Itinerary');
    this.reservation = this.userPreferences.getElement('Reservation');
    Object.assign(this.reservation, this.listadoCatSeleccionado);
    this.userPreferences.setElement('Reservation', this.reservation);
    this.reservation = this.userPreferences.getElement('Reservation');
    this.promoid = this.userPreferences.getElement('priceProgramId');
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.cantPasajeros = this.userPreferences.getElement("PaxTotal"); 
    this.userPreferences.setElement("enews",false);

    this.Vuelo = this.userPreferences.getElement("ConVueloIncluido");

    this.soloCotizacionOnline =JSON.parse(localStorage.getItem('SoloCotizacionOnline').toLowerCase());
    if (this.Vuelo == null) { this.Vuelo = false; }
    //Agregando codigo
    this.aeropuertoId = this.userPreferences.getElement("AeropuertoId");
    if (this.aeropuertoId == null || this.aeropuertoId == undefined) {
      this.aeropuertoId = ""
    }
    //Fin agregando codigo

    var found = false;
    for (let i = 0; i < this.rate.length; i++) {
      if (this.rate[i].priceProgramId == this.promoid) {
        found = true;
      }
    }

    this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
    if (this.cantPasajeros != null || this.cantPasajeros != undefined) {
      this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]", this.cantPasajeros.toString());
    }
    this.cleanTitleRate = this.rate.titulo;
    var cleanIntermediate = this.cleanTitleRate.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanTitleRate = cleanIntermediate;
    this.cleanTitleRate = this.transform(this.cleanTitleRate);
    this.cleanDescriptionRate = this.rate.descripcion;
    var cleanIntermediate = this.cleanDescriptionRate.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanDescriptionRate = cleanIntermediate;
    this.cleanDescriptionRate = this.transform(this.cleanDescriptionRate);
    this.cantPasajeros = this.userPreferences.getElement('PaxTotal');
    this.BuildSailDate();
    this.validationLocale()
    this.InitDataNew()
    var categorias = ['Interior', 'Exterior', 'Balcon', 'Suite'];

    if (this.ShowDateCabins == undefined) {
      for (let i = 0; i < categorias.length; i++) {


        if (this.DateCabinsLoad[categorias[i]].length > 0) {

          this.selectedCategoryRoom = categorias[i];

          break;

        }
      }
    };
  }

  ngAfterViewInit() {

    if (this.DateCabinsLoad[this.selectedCategoryRoom] && this.DateCabinsLoad[this.selectedCategoryRoom].elements.length > 0 && this.selectedShowCabinIndex == 0) {
      this.ChangeAgotado.emit(true);
    } else {
      this.ChangeAgotado.emit(false);
    }
  }
  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }
  activeMetaCategoria(cat) {
    if (cat === "I") { return 'Interior'; }
    else if (cat === "B") { return 'Balcon'; }
    else if (cat === "S" || cat === "D") { return 'Suite'; }
    return 'Exterior';
  };

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
  LoadIndexInitData() {
    this.loadCabins = true;
    var pagesLoad: number = 1;
    var pageSize: number = 5;
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    const sources = [
      this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Interior'), pagesLoad, pageSize),
      this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Exterior'), pagesLoad, pageSize),
      this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Balcon'), pagesLoad, pageSize),
      this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Suite'), pagesLoad, pageSize)
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([InteriorInfo, ExteriorInfo, BalconInfo, SuiteInfo]: any[]) => {

          if (InteriorInfo) {
            this.CreateIniIndexElement('Interior', InteriorInfo);
          }
          if (ExteriorInfo) {
            this.CreateIniIndexElement('Exterior', ExteriorInfo);
          }
          if (BalconInfo) {
            this.CreateIniIndexElement('Balcon', BalconInfo);
          }
          if (SuiteInfo) {
            this.CreateIniIndexElement('Suite', SuiteInfo);
          }
          this.LoadInitDataNew();
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
  LoadInitData() {
    var pageSize: number = 5;
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    const sources = [
      this.adminService.GetCabinasXSalidas(this.BuildFilter('Interior'), this.DateIndexPageLoad['Interior'].currentPage, pageSize),
      this.adminService.GetCabinasXSalidas(this.BuildFilter('Exterior'), this.DateIndexPageLoad['Exterior'].currentPage, pageSize),
      this.adminService.GetCabinasXSalidas(this.BuildFilter('Balcon'), this.DateIndexPageLoad['Balcon'].currentPage, pageSize),
      this.adminService.GetCabinasXSalidas(this.BuildFilter('Suite'), this.DateIndexPageLoad['Suite'].currentPage, pageSize)
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([InteriorCabin, ExteriorCabin, BalconCabin, SuiteCabin]: any[]) => {
          this.selectedCategoryRoom = this.BuildCategoryRoom(InteriorCabin, ExteriorCabin, BalconCabin, SuiteCabin);
          this.BuildLoadElements(InteriorCabin, 'Interior');
          this.BuildLoadElements(ExteriorCabin, 'Exterior');
          this.BuildLoadElements(BalconCabin, 'Balcon');
          this.BuildLoadElements(SuiteCabin, 'Suite');
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
    this.loadCabins = false;

  }
  LoadInitDataNew() {
    var pageSize: number = 5;
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.selectedCategoryRoom = this.BuildCategoryRoom(this.InteriorInfo, this.ExteriorInfo, this.BalconInfo, this.SuiteInfo);
    this.BuildLoadElements(this.InteriorInfo, 'Interior');
    this.BuildLoadElements(this.ExteriorInfo, 'Exterior');
    this.BuildLoadElements(this.BalconInfo, 'Balcon');
    this.BuildLoadElements(this.SuiteInfo, 'Suite');
    this.loadCabins = false;
  }
  CabinChoice() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
    this.selectedChildCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];
    this.addonsValues = this.selectedChildCabin.addons.some((x: { valor: boolean; }) => x.valor)
    this.userPreferences.setElement('selectdateshowcabins', currentMeta.elements.length);
    this.userPreferences.setElement('selectedCabinIndex', this.selectedCabinIndex);
    this.userPreferences.setElement("BookingMode", "Reserva");

    this.userPreferences.setElement('indicetarifa', this.indice);
    this.userPreferences.setElement('selectedCabinPos', this.selectedCabinPos);    
    this.UpdateMetaCategoryReservation();

    const modalRef = this.modalService.open(ChoiceCabinComponent, { size: 'lg', centered: true });
    this.modalSubscription = from(modalRef.result).subscribe();
  }
  ShowPassengerQuote() {
    var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
    this.selectedChildCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];
    this.addonsValues = this.selectedChildCabin.addons.some((x: { valor: boolean; }) => x.valor)
    this.userPreferences.setElement('selectdateshowcabins', currentMeta.elements.length);
    this.UpdateMetaCategoryReservation();
    if (this.reservation.mode == 'Online') {
      this.userPreferences.setElement("CotizarOnline", "true");
      this.userPreferences.setElement("QuotationMode", "CotizacionOnline");
      this.AutomaticDeck();
    } else {
      this.userPreferences.setElement("QuotationMode", "CotizacionOffline");
      this.PreprareCotizaiconOffline();
    }
  }
  BuildFilterCabinas(metaCategoria: string): any {
    let transactionSave = this.userPreferences.getElement('transactionSave');
    let aeropuertoIdSave = this.userPreferences.getElement('aeropuertoIdSave');
    var arreglosinloyalty = []
    if (this.reservation.pasajeros.length > 0) {
      arreglosinloyalty = this.reservation.pasajeros;
    } else {
      for (var key in this.reservation.pasajeros) {
        arreglosinloyalty.push({
          "edad": String(this.reservation.pasajeros[key].edad),
          "loyaltyNumber": "",
          "codigoPromocional": "",
          "nombre": "",
          "apellido": "",
          "telefono": "",
          "fechaNacimiento": "",
          "correo": "",
          "numeroDocumento": "",
          "titulo": "",
          "tipoDocumento": "",
          "nacionalidad": "",
          "TurnoComida": ""
        })
      }
    }
    var d = this.sailDate;
    var fechaArreglo = d.split("-");
    var fechaSalida = [fechaArreglo[2], fechaArreglo[1], fechaArreglo[0]].join('-');
    this.priceprogramid = this.userPreferences.getElement('priceProgramId');
    var rateIncome = this.ratecomplete;
    var priceProgramIdResult = rateIncome.priceProgramId;
    var priceProgramIdArray = priceProgramIdResult.split('&&');
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
      Metacategoria: this.selectedChildCabin.metacategoria,
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      CantPasajeros: this.userPreferences.getElement("PaxTotal").toString(),
      ListaPasajeros: arreglosinloyalty,
      CategoriaCabina: this.selectedChildCabin.categoria,
      TransactionCode: this.selectedChildCabin.transaction,
      PackageId: this.selectedChildCabin.packageId,
      PriceProgramId: this.priceprogramid,
      Transaction: transactionSave,
      TarifaPromoId: this.priceprogramid,
      FunctionalBranch: this.quotationMode,
      IsNRF: this.selectedChildCabin.esNRF,
      ConVueloIncluido: this.Vuelo,
      AeropuertoId: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" :  this.reservation.VueloSeleccionado.id,
      ComponentCodeFlight: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" : this.reservation.VueloSeleccionado.code,
      };
    return currentFilter;
  }
  PreprareCotizaiconOffline() {
    this.userPreferences.setElement("PaxTotal", 2);
    this.cantidadPasajeros = 2;
    var result: any[] = [];
    var i = 0;
    for (let index = 0; index < this.cantidadPasajeros; index++) {
      var current_passenger: any = {};
      current_passenger.edad = String(30);
      current_passenger.LoyaltyNumber = "";
      current_passenger.codigoPromocional = "";
      current_passenger.nombre = "";
      current_passenger.apellido = "";
      current_passenger.telefono = "";
      current_passenger.correo = "";
      current_passenger.TurnoComida = "";
      current_passenger.titulo = "Sr";
      current_passenger.tipoDocumento = "";
      current_passenger.fechaNacimiento = "";
      current_passenger.nacionalidad = "";
      current_passenger.numeroDocumento = "";
      result.push(current_passenger);
    } 
    
    var categoria = this.selectedChildCabin.metacategoria;
    var metacategoria = "";
    if (categoria == "S") {
      metacategoria = "Suite";
    }
    if (categoria == "B") {
      metacategoria = "Balcon";
    }
    if (categoria == "E") {
      metacategoria = "Exterior";
    }
    if (categoria == "O") {
      metacategoria = "Exterior";
    }
    if (categoria == "I") {
      metacategoria = "Interior";
    }
    const sourcescabins = [      
      this.adminService.GetPreDataTarifas(this.BuildFilterCabinas(metacategoria))
    ];

    this.dataSubscription = forkJoin(sourcescabins)
      .subscribe(
        ([DataTarifas]: any[]) => {
          this.userPreferences.setElement("preDataTarifas", DataTarifas);
          this.reservation = this.userPreferences.getElement('Reservation');
          Object.assign(this.reservation.pasajeros, result);
          this.userPreferences.setElement('Reservation', this.reservation);
          this.reservation = this.userPreferences.getElement('Reservation');
          this.userPreferences.setElement('selectedCabin', this.selectedChildCabin);
          this.selectedChildCabin = this.userPreferences.getElement('selectedCabin')
          this.router.navigate(['cruisebrowser', 'passengerdatasummary']);
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
  AutomaticDeck() {
    this.selectedChildCabin = this.userPreferences.getElement('selectedCabin');
    this.addonsValues = this.selectedChildCabin.addons.some((x: { valor: boolean; }) => x.valor)
    this.quotationMode = this.userPreferences.getElement("QuotationMode");

    var categoria = this.selectedChildCabin.metacategoria;
    var metacategoria = "";
    if (categoria == "S") {
      metacategoria = "Suite";
    }
    if (categoria == "B") {
      metacategoria = "Balcon";
    }
    if (categoria == "E") {
      metacategoria = "Exterior";
    }
    if (categoria == "O") {
      metacategoria = "Exterior";
    }
    if (categoria == "I") {
      metacategoria = "Interior";
    }
    const sourcescabins = [
      this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas(metacategoria), 1, 5),
    ];
    this.dataSubscription = forkJoin(sourcescabins)
      .subscribe(
        ([ListaCabins]: any[]) => {
          this.listaCabinas = ListaCabins;
          var arrayCabinas = this.listaCabinas.data.listaCabinas
          this.selectedChildCabin.cabinNumber = arrayCabinas[0].listCabinas[0].cabinNo;
          this.selectedChildCabin.deckCode = arrayCabinas[0].cabinDeck;
          this.userPreferences.setElement('selectedCabin', this.selectedChildCabin);
          this.selectedChildCabin = this.userPreferences.getElement('selectedCabin')
          this.router.navigate(['cruisebrowser', 'passengerdatasummary']);
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
  ChangeCategoryRoom(value: string, price: any) {
    if (price != null && price != 0) {
      this.selectedCategoryRoom = value;
      this.selectedCabinIndex = this.DateIndexPageLoad[this.selectedCategoryRoom].indexBestDate;
      this.selectedShowCabinIndex = this.DateIndexPageLoad[this.selectedCategoryRoom].indexBestDate;
      this.userPreferences.setElement('selectedCabinPos', this.selectedCabinPos);
      this.selectedCabinPos = 0;
      var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
      this.selectedChildCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];
      this.selectedShowCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];
      this.addonsValues = this.selectedChildCabin.addons.some((x: { valor: boolean; }) => x.valor)
      this.userPreferences.setElement('selectedCabinIndex', this.selectedShowCabinIndex);
      this.userPreferences.setElement('selectdateshowcabins', currentMeta.elements.length);
      this.CheckFlyInCabin();
      this.SelectCategoryData();
      this.BuildShowCabins();
      this.UpdateMetaCategoryReservation();
      
      //new task
      var listadoCatSeleccionado
      switch (this.selectedCategoryRoom) {
        case 'Interior': {
          listadoCatSeleccionado = { "listadoCatSeleccionado": this.InteriorInfo }
          break;
        }
        case 'Exterior': {
          listadoCatSeleccionado = { "listadoCatSeleccionado": this.ExteriorInfo }
          break;
        }
        case 'Balcon': {
          listadoCatSeleccionado = { "listadoCatSeleccionado": this.BalconInfo }
          break;
        }
        case 'Suite': {
          listadoCatSeleccionado = { "listadoCatSeleccionado": this.SuiteInfo }
          break;
        }
        default: {
          break;
        }
      }

      Object.assign(this.reservation, listadoCatSeleccionado);
      this.userPreferences.setElement('Reservation', this.reservation);
      this.reservation = this.userPreferences.getElement('Reservation');

      //end new task
    }
  }
  UpdateMetaCategoryReservation(inicial: boolean = false) {

    if (!this.reservation) {
      this.reservation = {};
    }
    this.reservation.idCategoriaHabitacion = (this.selectedCategoryRoom != 'undefined' && this.selectedCategoryRoom && this.selectedCategoryRoom != "") ? this.selectedCategoryRoom : this.activeMetaCategoria(this.selectedChildCabin.metacategoria);
    this.reservation.rate = this.ratecomplete;
    this.ChangeCategory.emit([this.selectedChildCabin, this.reservation, this.selectedShowCabin, inicial]);
  }

  SaveDataToLocalStorage(data) {
    var a = [];
    // Parse the serialized data back into an aray of objects
    a = JSON.parse(localStorage.getItem('cabinsAll')) || [];
    // Push the new data (whether it be an object or anything else) onto the array
    a.push(data);

    // Re-serialize the array back into a string and store it in localStorage
    localStorage.setItem('cabinsAll', JSON.stringify(a));

    var cabins = JSON.parse(localStorage.getItem('cabinsAll'))

    var al = cabins.length;
    //var minimum = cabins[al - 1].precioCabina.valorPrincipal;
    var minimum = cabins[0].precioCabina.valorPrincipal;
    this.selectedChildCabin = cabins[0];
    this.selectedShowCabin = cabins[0];
    this.addonsValues = this.selectedChildCabin.addons.some((x: { valor: boolean; }) => x.valor)
    for (let entry of cabins) {

      if (entry.precioCabina.valorPrincipal < minimum) {
        minimum = entry.precioCabina.valorPrincipal
        this.selectedChildCabin = entry
        this.selectedShowCabin = entry
      }
    }
  }

  LoadCabins(ini: boolean) {
    if (!this.loadCabins) {
      this.loadCabins = true;
      var current_data = this.DateCabinsLoad[this.selectedCategoryRoom];
      var pagesLoad: number = current_data.pagesLoad;
      var totalPages: number = current_data.totalPages;
      var pageSize: number = 5;
      var element = this.DateIndexPageLoad[this.selectedCategoryRoom].currentPage;
      if (totalPages == 0 || (pagesLoad != totalPages)) {
        if (this.dataSubscription) {
          this.dataSubscription.unsubscribe();
        }
        const sources = [
          this.adminService.GetCabinasXSalidas(this.BuildFilter(this.selectedCategoryRoom),
            this.DateIndexPageLoad[this.selectedCategoryRoom].currentPage, pageSize)
        ];
        this.dataSubscription = forkJoin(sources)
          .subscribe(
            ([loadData]: any[]) => {


              if (loadData.data.length > 0) {
                var newElements: any[] = [];
                for (let index = 0; index < loadData.data.length; index++) {
                  newElements.push(loadData.data[index]);
                }
                if (ini) {
                  current_data.elements = newElements.concat(current_data.elements);
                }
                else {
                  current_data.elements = current_data.elements.concat(newElements);
                }
                if (totalPages == 0) {
                  this.BuildShowCabins();
                }
                else {
                  if (ini) {
                    element.indexBestDate += loadData.data.length;
                    this.selectedShowCabinIndex += loadData.data.length;
                    this.selectedCabinIndex += loadData.data.length;
                  }
                  this.BuildShowCabins();
                }
                //new code
             
                Object.assign(this.reservation.listadoCatSeleccionado.data, current_data)
                this.userPreferences.setElement('Reservation', this.reservation)
                current_data.totalPages = loadData.totalPages;
                current_data.pagesLoad++;
                this.loadCabins = false;
              }
            },
            (error: HttpErrorResponse) => {

              this.loadCabins = false;
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
  BuildSailDate() {
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split('-');
      this.sailDate = split[0] + '-' + split[1] + '-' + split[2];
    }
  }
  BuildFilter(metaCategoria: string): any {
    var precio = this.BuildPrecios(metaCategoria);

    var arreglosinloyalty = []
    if (this.reservation.pasajeros.length > 0) {
      arreglosinloyalty = this.reservation.pasajeros;
    } else {
      for (var key in this.reservation.pasajeros) {
        arreglosinloyalty.push({
          "edad": String(this.reservation.pasajeros[key].edad),
          "loyaltyNumber": "",
          "codigoPromocional": "",
          "nombre": "",
          "apellido": "",
          "telefono": "",
          "fechaNacimiento": "",
          "correo": "",
          "numeroDocumento": "",
          "titulo": "",
          "tipoDocumento": "",
          "nacionalidad": "",
          "TurnoComida": ""
        })
      }
    }
    this.reservation.pasajeros = arreglosinloyalty;
    var rateIncome = this.ratecomplete;
    var priceProgramIdResult = rateIncome.priceProgramId;
    var priceProgramIdArray = priceProgramIdResult.split(',');
    var cadenapromos = "";
    var cadenapackage = "";
    for (let j = 0; j < priceProgramIdArray.length; j++) {
      var priceProgramAndpackageId = priceProgramIdArray[j].split('&&');

      cadenapromos = cadenapromos + priceProgramAndpackageId[0] + ",";
      if (j == 0) {
        cadenapackage = cadenapackage + priceProgramAndpackageId[1] + ",";
      }

    }

    cadenapromos = cadenapromos.slice(0, -1);
    cadenapackage = cadenapackage.slice(0, -1);

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
      PriceProgramId: cadenapromos,
      CantPasajeros: this.userPreferences.getElement("PaxTotal").toString(),
      ListaPasajeros: this.reservation.pasajeros,
      PackageId: cadenapackage,
      TransactionCode: rateIncome.transactionCode,
      TarifaPromoId: cadenapromos,
      IsNRF: this.selectedDate.esNRF,
      ConVueloIncluido: this.Vuelo,
      AeropuertoId: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" :  this.reservation.VueloSeleccionado.id,
      ComponentCodeFlight: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" : this.reservation.VueloSeleccionado.code,
     
    };
    return currentFilter;
  }
  BuildFilterBR(metaCategoria, priceProgramId): any {
    var result: any = priceProgramId;
    if (this.filterBR) {
      if (metaCategoria == 'Interior' && this.filterBR.I != '') {
        result = this.filterBR.I;
      }
      else if (metaCategoria == 'Exterior' && this.filterBR.O != '') {
        result = this.filterBR.O;
      }
      else if (metaCategoria == 'Balcon' && this.filterBR.B != '') {
        result = this.filterBR.B;
      }
      else if (metaCategoria == 'Suite' && this.filterBR.S != '') {
        result = this.filterBR.S;
      }
      else if (metaCategoria == 'Suite' && this.filterBR.D != '') {
        result = this.filterBR.D;
      }
    }
    return result;
  }
  BuildLoadElements(loadData: any, metaCategoria: string) {
    var elementsData = [];
    for (let index = 0; index < loadData.data.length; index++) {
      if (index == 0) {
        this.lowCabinsPrice[metaCategoria] = loadData.data[index][0];
      }
      elementsData.push(loadData.data[index]);
    }

    this.DateCabinsLoad[metaCategoria] =
    {
      totalPages: loadData.totalPages,
      pagesLoad: (loadData.data.length > 0) ? 1 : 0,
      elements: elementsData,
    };
    if (metaCategoria == this.selectedCategoryRoom) {
      this.selectedChildCabin = elementsData[0][this.selectedCabinPos];
      this.selectedShowCabin = elementsData[0][this.selectedCabinPos];
      this.addonsValues = this.selectedChildCabin.addons.some((x: { valor: boolean; }) => x.valor)
      this.userPreferences.setElement('selectedShowCabin', this.selectedShowCabin);

      this.CheckFlyInCabin();
      this.SaveDataToLocalStorage(this.selectedChildCabin)
      this.SelectCategoryDataMin();
      for (let index = 0; index < loadData.data.length; index++) {
        var element = loadData.data[index];
        if (index < 2) {
          this.ShowDateCabins.push({ index: index, element: element });

        }
        else {
          break;
        }
      }
    }
  }
  SelectCabin(index: number) {
    this.selectedCabinIndex = index;
    this.selectedShowCabinIndex = index;

    var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
    if (this.selectedCabinPos >= currentMeta.elements[index].length) {
      this.selectedCabinPos = 0;
    }
    this.userPreferences.setElement('selectdateshowcabins', currentMeta.elements.length);
    this.userPreferences.setElement('selectedCabinIndex', this.selectedCabinIndex);
    this.userPreferences.setElement('indicetarifa', this.indice);
    this.userPreferences.setElement('selectedCabinPos', this.selectedCabinPos);
    this.selectedChildCabin = currentMeta.elements[index][this.selectedCabinPos];
    this.selectedShowCabin = currentMeta.elements[index][this.selectedCabinPos];
    this.addonsValues = this.selectedChildCabin.addons.some((x: { valor: boolean; }) => x.valor)
    this.userPreferences.setElement('selectdateshowcabins', currentMeta.elements.length);
    this.CheckFlyInCabin();
    this.SelectCategoryData();
    this.UpdateMetaCategoryReservation();
    this.BuildShowCabins();
    var element = this.DateIndexPageLoad[this.selectedCategoryRoom];
    this.userPreferences.setElement('selectdateshowcabins', currentMeta.elements.length);
    if (currentMeta.elements.length >= 5 && (this.selectedShowCabinIndex >= currentMeta.elements.length - 3)) {
      if (element.maxPageLoad != currentMeta.totalPages && !this.loadCabins) {
        element.maxPageLoad++;
        element.currentPage = element.maxPageLoad;
        if (!!this.ratecomplete.bestRate == true) {
          this.LoadCabins(false);
        }
        else {
          this.LoadRatesCabins(false);
        }
      }
    }
    else if (this.selectedShowCabinIndex < 2) {
      if (element.minPageLoad > 1 && !this.loadCabins) {
        element.minPageLoad--;
        element.currentPage = element.minPageLoad;
        if (!!this.ratecomplete.bestRate == true) {
          this.LoadCabins(true);
        }
        else {
          this.LoadRatesCabins(true);
        }
      }
    }
     //new code
     this.reservation.listadoCatSeleccionado.data = currentMeta.elements;     
     this.userPreferences.setElement('Reservation', this.reservation);
     this.reservation = this.userPreferences.getElement('Reservation')    
  }
  NextCabin() {
    var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
    if (this.selectedShowCabinIndex < currentMeta.elements.length - 1) {
      this.selectedShowCabinIndex++;
      this.selectedShowCabin = currentMeta.elements[this.selectedShowCabinIndex][0];
      this.BuildShowCabins();
    }
    var element = this.DateIndexPageLoad[this.selectedCategoryRoom];
    if (currentMeta.elements.length >= 5 && (this.selectedShowCabinIndex >= currentMeta.elements.length - 3)) {
      if (element.maxPageLoad != currentMeta.totalPages && !this.loadCabins) {
        element.maxPageLoad++;
        element.currentPage = element.maxPageLoad;
        if (!!this.ratecomplete.bestRate == true) {
          this.LoadCabins(false);
        }
        else {
          this.LoadRatesCabins(false);
        }
      }
    }
    this.SelectCabin(this.selectedShowCabinIndex);
  }
  PreviousCabin() {
    var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
    if (this.selectedShowCabinIndex > 0) {
      this.selectedShowCabinIndex--;
      this.selectedShowCabin = currentMeta.elements[this.selectedShowCabinIndex][0];
      this.BuildShowCabins();
      var element = this.DateIndexPageLoad[this.selectedCategoryRoom];
      if (this.selectedShowCabinIndex < 2) {
        if (element.minPageLoad > 1 && !this.loadCabins) {
          element.minPageLoad--;
          element.currentPage = element.minPageLoad;
          if (!!this.ratecomplete.bestRate == true) {
            this.LoadCabins(true);
          }
          else {
            this.LoadRatesCabins(true);
          }
        }
      }
    }
    this.SelectCabin(this.selectedShowCabinIndex);
  }
  BuildShowCabins() {
    this.ShowDateCabins = [];
    var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];

    if (this.selectedShowCabinIndex == 0) {

      for (let index = 0; index < currentMeta.elements.length; index++) {
        const date = currentMeta.elements[index];
        if (index < 2) {
          this.ShowDateCabins.push({ index: index, element: date });
        }
        else {
          break;
        }
      }
    }
    else

      if (this.selectedShowCabinIndex == currentMeta.elements.length - 1) {
        if (currentMeta.elements.length == 2) {
          for (let index = 0; index < currentMeta.elements.length; index++) {
            const date = currentMeta.elements[index];
            this.ShowDateCabins.push({ index: index, element: date });
          }
        }
        else {
          for (let index = currentMeta.elements.length - 2; index < currentMeta.elements.length; index++) {
            const date = currentMeta.elements[index];
            this.ShowDateCabins.push({ index: index, element: date });
          }
        }
      }
      else {
        for (let index = this.selectedShowCabinIndex - 1; index <= this.selectedShowCabinIndex + 1; index++) {
          const date = currentMeta.elements[index];
          this.ShowDateCabins.push({ index: index, element: date });
        }
      }
  }

  SelectCategoryData() {
    var date = this.selectedChildCabin;

    this.userPreferences.setElement('priceProgramIdSave', date.priceProgramId);
    this.userPreferences.setElement('transactionSave', date.transaction);
    this.userPreferences.setElement('packageIdSave', date.packageId);
    this.userPreferences.setElement('aeropuertoIdSave', date.aeropuertoId);
    var modo = this.userPreferences.getElement('Reservation');
    if (modo.mode == 'Offline') {
      if (this.selectedCategoryRoom == 'Interior') {
        this.selectedDateCategoryData = date.precioCabinaPax;
        this.taxesPrices = date.precioTaxesPax;
      }
      else if (this.selectedCategoryRoom == 'Exterior') {
        this.selectedDateCategoryData = date.precioCabinaPax;
        this.taxesPrices = date.precioTaxesPax;
      }
      else if (this.selectedCategoryRoom == 'Balcon') {
        this.selectedDateCategoryData = date.precioCabinaPax;
        this.taxesPrices = date.precioTaxesPax;
      }
      else {
        this.selectedDateCategoryData = date.precioCabinaPax;
        this.taxesPrices = date.precioTaxesPax;
      }
    } else {
      if (this.selectedCategoryRoom == 'Interior') {
        this.selectedDateCategoryData = date.precioCabina;
        this.taxesPrices = date.precioTaxes;
      }
      else if (this.selectedCategoryRoom == 'Exterior') {
        this.selectedDateCategoryData = date.precioCabina;
        this.taxesPrices = date.precioTaxes;
      }
      else if (this.selectedCategoryRoom == 'Balcon') {
        this.selectedDateCategoryData = date.precioCabina;
        this.taxesPrices = date.precioTaxes;
      }
      else {
        this.selectedDateCategoryData = date.precioCabina;
        this.taxesPrices = date.precioTaxes;
      }
    }
  }

  SelectCategoryDataMin() {
    var date = this.selectedChildCabin;

    this.userPreferences.setElement('priceProgramIdSave', date.priceProgramId);
    this.userPreferences.setElement('transactionSave', date.transaction);
    this.userPreferences.setElement('packageIdSave', date.packageId);
    this.userPreferences.setElement('aeropuertoIdSave', date.aeropuertoId);
    var modo = this.userPreferences.getElement('Reservation');
    if (modo.mode == 'Offline') {
      if (this.selectedCategoryRoom == 'Interior') {
        this.selectedDateCategoryData = date.precioCabinaPax;
        this.taxesPrices = date.precioTaxesPax;
      }
      else if (this.selectedCategoryRoom == 'Exterior') {
        this.selectedDateCategoryData = date.precioCabinaPax;
        this.taxesPrices = date.precioTaxesPax;
      }
      else if (this.selectedCategoryRoom == 'Balcon') {
        this.selectedDateCategoryData = date.precioCabinaPax;
        this.taxesPrices = date.precioTaxesPax;
      }
      else {
        this.selectedDateCategoryData = date.precioCabinaPax;
        this.taxesPrices = date.precioTaxesPax;
      }
    } else {
      if (this.selectedCategoryRoom == 'Interior') {
        this.selectedDateCategoryData = date.precioCabina;
        this.taxesPrices = date.precioTaxes;
      }
      else if (this.selectedCategoryRoom == 'Exterior') {
        this.selectedDateCategoryData = date.precioCabina;
        this.taxesPrices = date.precioTaxes;
      }
      else if (this.selectedCategoryRoom == 'Balcon') {
        this.selectedDateCategoryData = date.precioCabina;
        this.taxesPrices = date.precioTaxes;
      }
      else {
        this.selectedDateCategoryData = date.precioCabina;
        this.taxesPrices = date.precioTaxes;
      }
    }
  }
  GetBGC(value): any {
    if (value == null || value == 0) {
      return '#B0B0B0';
    }
    else {
      return '';

    }
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
  BuildIniFilter(metaCategoria: string): any {
    var precio = this.BuildPrecios(metaCategoria);
    var rateIncome = this.ratecomplete;
    var priceProgramIdResult = rateIncome.priceProgramId;
    var priceProgramIdArray = priceProgramIdResult.split('&&');
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
      PrecioCabinaMasBarata: precio,
      PriceProgramId: precio.priceProgramId,
      PackageId: priceProgramIdArray[1],
      TransactionCode: rateIncome.transactionCode,
      TarifaPromoId: precio.priceProgramId
    };

    return currentFilter;
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
  CreateIniIndexElement(metaCategoria: string, element: any) {
    this.DateIndexPageLoad[metaCategoria] =
    {
      minPageLoad: element.pageNumber,
      maxPageLoad: element.pageNumber,
      currentPage: element.pageNumber,
      indexBestDate: element.posInPage,
    };
  }
  BuildRatesIniFilter(metaCategoria: string): any {
    var rateIncome = this.ratecomplete;
    var priceProgramIdResult = rateIncome.priceProgramId;
    var priceProgramIdArray = priceProgramIdResult.split(',');
    var cadenapromos = "";
    var cadenapackage = "";
    for (let j = 0; j < priceProgramIdArray.length; j++) {
      var priceProgramAndpackageId = priceProgramIdArray[j].split('&&');
      cadenapromos = cadenapromos + priceProgramAndpackageId[0] + ",";    
        if (j == 0) {
        cadenapackage = cadenapackage + priceProgramAndpackageId[1] + ",";
      }

    }
    cadenapromos = cadenapromos.slice(0, -1);
    cadenapackage = cadenapackage.slice(0, -1);
    var currentFilter =
    {
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      Nnoches: this.itinerary.nnoches.toString(),
      PuertoSalidaCode: this.itinerary.departurePortCode,
      Saildate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(metaCategoria),
      PriceProgramId: cadenapromos,
      CantPasajeros: this.userPreferences.getElement("PaxTotal").toString(),
      ListaPasajeros: this.reservation.pasajeros,
      TransactionCode: rateIncome.transactionCode,
      PackageId: cadenapackage,
      TarifaPromoId: cadenapromos,
      IsNRF: this.selectedDate.esNRF,
      ConVueloIncluido: this.Vuelo,
      AeropuertoId: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" :  this.reservation.VueloSeleccionado.Id,
      ComponentCodeFlight: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" : this.reservation.VueloSeleccionado.Code,
    
    };
    return currentFilter;
  }
  CreateIniIndexRatesElement(metaCategoria: string, element: any) {
    this.DateIndexPageLoad[metaCategoria] =
    {
      minPageLoad: element.pageNumber,
      maxPageLoad: element.pageNumber,
      currentPage: element.pageNumber,
      indexBestDate: 0,
    };
  }
  LoadRatesCabins(ini: boolean) {
    if (!this.loadCabins) {
      this.loadCabins = true;
      var current_data = this.DateCabinsLoad[this.selectedCategoryRoom];
      var pagesLoad: number = current_data.pagesLoad;
      var totalPages: number = current_data.totalPages;
      var pageSize: number = 5;
      var element = this.DateIndexPageLoad[this.selectedCategoryRoom].currentPage;
      if (totalPages == 0 || (pagesLoad != totalPages)) {
        if (this.dataSubscription) {
          this.dataSubscription.unsubscribe();
        }
        const sources = [
          this.adminService.GetCabinasXTarifas(this.BuildRatesIniFilter(this.selectedCategoryRoom),
            this.DateIndexPageLoad[this.selectedCategoryRoom].currentPage, pageSize)
        ];
        this.dataSubscription = forkJoin(sources)
          .subscribe(
            ([loadData]: any[]) => {
                            if (loadData.data.length > 0) {
                var newElements: any[] = [];
                for (let index = 0; index < loadData.data.length; index++) {
                  newElements.push(loadData.data[index]);
                }
                if (ini) {
                  current_data.elements = newElements.concat(current_data.elements);
                }
                else {
                  current_data.elements = current_data.elements.concat(newElements);
                }
                if (totalPages == 0) {
                  this.BuildShowCabins();
                }
                else {
                  if (ini) {
                    element.indexBestDate += loadData.data.length;
                    this.selectedShowCabinIndex += loadData.data.length;
                    this.selectedCabinIndex += loadData.data.length;
                  }
                  this.BuildShowCabins();
                }               
                
                current_data.totalPages = loadData.totalPages;
                current_data.pagesLoad++;
                this.loadCabins = false;
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
              this.loadCabins = false;
            });
      }
    }
  }
  ChangeAirport(e: any) {
    this.selectedCabinPos = e.target.options.selectedIndex;
    var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
    this.selectedChildCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];
    this.selectedShowCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];    
    this.addonsValues = this.selectedChildCabin.addons.some((x: { valor: boolean; }) => x.valor)

    this.UpdateMetaCategoryReservation();
    this.SelectCategoryData();
  }
  CheckFlyInCabin() {
    var result = false;
    this.DateCabinsLoad[this.selectedCategoryRoom].elements[this.selectedCabinIndex].forEach(cabin => {
      if (cabin.aeropuertoName && cabin.aeropuertoName.trim() != '') {
        result = true;
      }
    });
    this.existFly = result;
  }
  BuildCategoryRoom(InteriorCabin: any, ExteriorCabin: any, BalconCabin: any, SuiteCabin: any): any {
    var modo = this.userPreferences.getElement('Reservation');
    var result = this.selectedCategoryRoom;
    var validCategory: boolean = false;
    if (modo.mode == 'Offline') {
      switch (this.selectedCategoryRoom) {
        case 'Interior':
          if (InteriorCabin.data[0][0].precioCabinaPax && InteriorCabin.data[0][0].precioCabinaPax.valorPrincipal
            && InteriorCabin.data[0][0].precioCabinaPax.valorPrincipal > 0) {
            validCategory = true;
          }
          break;
        case 'Exterior':
          if (ExteriorCabin.data[0][0].precioCabinaPax && ExteriorCabin.data[0][0].precioCabinaPax.valorPrincipal
            && ExteriorCabin.data[0][0].precioCabinaPax.valorPrincipal > 0) {
            validCategory = true;
          }
          break;
        case 'Balcon':
          if (BalconCabin.data[0][0].precioCabinaPax && BalconCabin.data[0][0].precioCabinaPax.valorPrincipal
            && BalconCabin.data[0][0].precioCabinaPax.valorPrincipal > 0) {
            validCategory = true;
          }
          break;
        default:
          if (SuiteCabin.data[0][0].precioCabinaPax && SuiteCabin.data[0][0].precioCabinaPax.valorPrincipal
            && SuiteCabin.data[0][0].precioCabinaPax.valorPrincipal > 0) {
            validCategory = true;
          }
          break;
      }
    } else {
      switch (this.selectedCategoryRoom) {
        case 'Interior':
          if (InteriorCabin.data[0][0].precioCabina && InteriorCabin.data[0][0].precioCabina.valorPrincipal
            && InteriorCabin.data[0][0].precioCabina.valorPrincipal > 0) {
            validCategory = true;
          }
          break;
        case 'Exterior':
          if (ExteriorCabin.data[0][0].precioCabina && ExteriorCabin.data[0][0].precioCabina.valorPrincipal
            && ExteriorCabin.data[0][0].precioCabina.valorPrincipal > 0) {
            validCategory = true;
          }
          break;
        case 'Balcon':
          if (BalconCabin.data[0][0].precioCabina && BalconCabin.data[0][0].precioCabina.valorPrincipal
            && BalconCabin.data[0][0].precioCabina.valorPrincipal > 0) {
            validCategory = true;
          }
          break;
        default:
          if (SuiteCabin.data[0][0].precioCabina && SuiteCabin.data[0][0].precioCabina.valorPrincipal
            && SuiteCabin.data[0][0].precioCabina.valorPrincipal > 0) {
            validCategory = true;
          }
          break;
      }
    }
    if (validCategory == false) {
      var listElements: any[] = [];
      listElements.push(InteriorCabin.data[0][0]);
      listElements.push(ExteriorCabin.data[0][0]);
      listElements.push(BalconCabin.data[0][0]);
      listElements.push(SuiteCabin.data[0][0]);
      var minPrice = 5000000; //Max Value
      var result = '';
      listElements.forEach(element => {
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
  ValidateDiasValidosReserva() {
    var fechadesde = new Date().getTime();
    var fechahasta = new Date(this.selectedDate.fechaSalida).getTime();
    var diff_ = (fechahasta - fechadesde) / (1000 * 60 * 60 * 24);
    return diff_ > Number(this.reservation.CotizacionConfig.diasSoloCotizacion);
  }

  InitDataNew() {
    this.timeOutError = false
    this.loadingRate = false
    this.errorMessage = ""

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.InteriorInfo = [];
    this.ExteriorInfo = [];
    this.SuiteInfo = [];
    this.BalconInfo = [];

    var arreglosinloyalty = []


    if (this.reservation.pasajeros) {
      if (this.reservation.pasajeros.length > 0) {
        arreglosinloyalty = this.reservation.pasajeros;
      }
    } else {
      this.reservation.pasajeros = [];

      for (var key = 0; key < this.cantidadPasajeros; key++) {
        arreglosinloyalty.push({
          "edad": "",
          "loyaltyNumber": "",
          "codigoPromocional": "",
          "nombre": "",
          "apellido": "",
          "telefono": "",
          "fechaNacimiento": "",
          "correo": "",
          "numeroDocumento": "",
          "titulo": "",
          "tipoDocumento": "",
          "nacionalidad": "",
          "TurnoComida": ""
        })
      }
      this.reservation.pasajeros = arreglosinloyalty;
    }

    let rate = this.ratecomplete
    var pagesLoad: number = 1;
    var pageSize: number = 5;


    var activa = rate.tarifa;
    if (activa.activa) {
      if (rate.disponible != true) {
        this.disponible = false;
      }
      if (rate.bestRate == true && rate.disponible == true) {

        var priceProgramIdResult = rate.priceProgramId;
        var priceProgramIdArray = priceProgramIdResult.split(',');
        var cadenapromos = "";
        var cadenapackage = "";
        for (let j = 0; j < priceProgramIdArray.length; j++) {
          var priceProgramAndpackageId = priceProgramIdArray[j].split('&&');

          cadenapromos = cadenapromos + priceProgramAndpackageId[0] + ",";
          if (j == 0) {
            cadenapackage = cadenapackage + priceProgramAndpackageId[1] + ",";
          }
        }

        cadenapromos = cadenapromos.slice(0, -1);
        cadenapackage = cadenapackage.slice(0, -1);

        if (this.reservation.mode == "Online") {
          if (priceProgramIdResult != "") {
            this.enableProcess = true;
            this.EnableProcessFather.emit(this.enableProcess)
          }
        } else {
          this.enableProcess = true;
        }
        const maxRetries = 2;
        const delayMs = 2000;
        const sourcesBR = [
          this.adminService.GetCabinasXSalidas(this.BuildIniFilterBR('Interior', cadenapromos, cadenapackage, rate.transactionCode), 1, 5),
          this.adminService.GetCabinasXSalidas(this.BuildIniFilterBR('Suite', cadenapromos, cadenapackage, rate.transactionCode), 1, 5),
          this.adminService.GetCabinasXSalidas(this.BuildIniFilterBR('Exterior', cadenapromos, cadenapackage, rate.transactionCode), 1, 5),
          this.adminService.GetCabinasXSalidas(this.BuildIniFilterBR('Balcon', cadenapromos, cadenapackage, rate.transactionCode), 1, 5),

        ];
        this.dataSubscription = forkJoin(sourcesBR)
          .pipe(
            // El Observable lanzará un error si no se emite un valor en 1min
            /* timeout(1200000),
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
          ).subscribe(
            ([InteriorInfo, SuiteInfo, ExteriorInfo, BalconInfo]: any[]) => {

              this.InteriorInfo = InteriorInfo;
              this.ExteriorInfo = ExteriorInfo

              this.BalconInfo = BalconInfo;
              this.SuiteInfo = SuiteInfo;
              this.loadingRate = true
              this.LoadRatesInitData()

            },
            (error: HttpErrorResponse) => {

              this.loadingRate = true
              this.timeOutError = true


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
                this.errorMessage = error.error

              } else {

                if (error.error.value && typeof (error.error) === 'object') {
                  this.showError(error.error.value)
                  this.errorMessage = error.error.value
                } else {
                  if (error.status == 400) {
                    this.showError(this.messageValidate.err_400Controlado)
                    this.errorMessage = this.messageValidate.err_400Controlado
                  }
                  if (error.status == 404) {
                    this.showError(this.messageValidate.err_404PaginaNoEncontrada)
                    this.errorMessage = this.messageValidate.err_404PaginaNoEncontrada
                  }
                  if (error.status == 500) {
                    this.showError(this.messageValidate.err_500NoControlado)
                    this.errorMessage = this.messageValidate.err_500NoControlado
                  }
                }

              }
              console.error(errorMessage);
            });
      }
      if (rate.bestRate == false && rate.disponible == true) {

        var priceProgramIdResult = rate.priceProgramId;
        var priceProgramIdArray = priceProgramIdResult.split(',');
        var cadenapromos = "";
        var cadenapackage = "";
        for (let j = 0; j < priceProgramIdArray.length; j++) {
          var priceProgramAndpackageId = priceProgramIdArray[j].split('&&');

          cadenapromos = cadenapromos + priceProgramAndpackageId[0] + ",";
          if (j == 0) {
            cadenapackage = cadenapackage + priceProgramAndpackageId[1] + ",";
          }
        }

        cadenapromos = cadenapromos.slice(0, -1);
        cadenapackage = cadenapackage.slice(0, -1);

        if (this.reservation.mode == "Online") {

          if (priceProgramIdResult != "") {
            this.enableProcess = true;
            this.EnableProcessFather.emit(this.enableProcess)

          }
        } else {
          this.enableProcess = true;
        }
        const maxRetries = 2;
        const delayMs = 2000;
        const sourcesBR = [
          this.adminService.GetCabinasXTarifas(this.BuildIniFilterXTarifasSpefica('Interior', cadenapromos, cadenapackage, rate.transactionCode), pagesLoad, pageSize),
          this.adminService.GetCabinasXTarifas(this.BuildIniFilterXTarifasSpefica('Exterior', cadenapromos, cadenapackage, rate.transactionCode), pagesLoad, pageSize),
          this.adminService.GetCabinasXTarifas(this.BuildIniFilterXTarifasSpefica('Balcon', cadenapromos, cadenapackage, rate.transactionCode), pagesLoad, pageSize),
          this.adminService.GetCabinasXTarifas(this.BuildIniFilterXTarifasSpefica('Suite', cadenapromos, cadenapackage, rate.transactionCode), pagesLoad, pageSize)

        ];
        this.dataSubscription = forkJoin(sourcesBR)
          .pipe().subscribe(
            ([InteriorInfo, ExteriorInfo, BalconInfo, SuiteInfo]: any[]) => {
              this.InteriorInfo = InteriorInfo;
              this.BalconInfo = BalconInfo
              this.SuiteInfo = SuiteInfo
              this.ExteriorInfo = ExteriorInfo;
              this.loadingRate = true
              this.LoadRatesInitData()
            },
            (error: HttpErrorResponse) => {
              this.loadingRate = true
              this.timeOutError = true


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
                this.errorMessage = error.error

              } else {

                if (error.error.value && typeof (error.error) === 'object') {
                  this.showError(error.error.value)
                  this.errorMessage = error.error.value
                } else {
                  if (error.status == 400) {
                    this.showError(this.messageValidate.err_400Controlado)
                    this.errorMessage = this.messageValidate.err_400Controlado
                  }
                  if (error.status == 404) {
                    this.showError(this.messageValidate.err_404PaginaNoEncontrada)
                    this.errorMessage = this.messageValidate.err_404PaginaNoEncontrada
                  }
                  if (error.status == 500) {
                    this.showError(this.messageValidate.err_500NoControlado)
                    this.errorMessage = this.messageValidate.err_500NoControlado
                  }
                }

              }
              console.error(errorMessage);

            });
      }
    }
  }


  BuildIniFilterBR(metaCategoria: string, priceprogramidini: string, packageid: string, transactioncode: string): any {
    var arreglosinloyalty = []

    var arreglosinloyalty = []
    if (this.reservation.pasajeros.length > 0) {
      arreglosinloyalty = this.reservation.pasajeros;
    } else {
      for (var key in this.reservation.pasajeros) {
        arreglosinloyalty.push({
          "edad": String(this.reservation.pasajeros[key].edad),
          "loyaltyNumber": "",
          "codigoPromocional": "",
          "nombre": "",
          "apellido": "",
          "telefono": "",
          "fechaNacimiento": "",
          "correo": "",
          "numeroDocumento": "",
          "titulo": "",
          "tipoDocumento": "",
          "nacionalidad": "",
          "TurnoComida": ""
        })
      }
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
      PuertoSalidaCode: this.itinerary.departurePortCode,
      Saildate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(metaCategoria),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      PriceProgramId: priceprogramidini,
      ListaPasajeros: arreglosinloyalty,
      CantPasajeros: this.userPreferences.getElement("PaxTotal") ? this.userPreferences.getElement("PaxTotal").toString() : "2",
      TransactionCode: transactioncode,
      PackageId: packageid,
      TarifaPromoId: priceprogramidini,
      ConVueloIncluido: this.Vuelo,
      AeropuertoId: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" :  this.reservation.VueloSeleccionado.id,
      ComponentCodeFlight: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" : this.reservation.VueloSeleccionado.code,
     IsNRF: this.selectedDate.esNRF,
    };
    return currentFilter;
  }

  BuildIniFilterXTarifasSpefica(metaCategoria: string, priceprogramidini: string, packageid: string, transactioncode: string): any {
    var arreglosinloyalty = []

    var arreglosinloyalty = []
    if (this.reservation.pasajeros.length > 0) {
      arreglosinloyalty = this.reservation.pasajeros;
    } else {
      for (var key in this.reservation.pasajeros) {
        arreglosinloyalty.push({
          "edad": String(this.reservation.pasajeros[key].edad),
          "loyaltyNumber": "",
          "codigoPromocional": "",
          "nombre": "",
          "apellido": "",
          "telefono": "",
          "fechaNacimiento": "",
          "correo": "",
          "numeroDocumento": "",
          "titulo": "",
          "tipoDocumento": "",
          "nacionalidad": "",
          "TurnoComida": ""
        })
      }
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
      PuertoSalidaCode: this.itinerary.departurePortCode,
      Saildate: this.sailDate,
      Metacategoria: this.BuildMetaCategoria(metaCategoria),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      PriceProgramId: priceprogramidini,
      ListaPasajeros: arreglosinloyalty,
      CantPasajeros: this.userPreferences.getElement("PaxTotal") ? this.userPreferences.getElement("PaxTotal").toString() : "2",
      TransactionCode: transactioncode,
      PackageId: packageid,
      TarifaPromoId: priceprogramidini,
      ConVueloIncluido: this.Vuelo,
      AeropuertoId: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" :  this.reservation.VueloSeleccionado.id,
      ComponentCodeFlight: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" : this.reservation.VueloSeleccionado.code,
     IsNRF: this.selectedDate.esNRF
    };
    return currentFilter;
  }

  LoadRatesInitData() {
    if (this.disponible == true) {
      this.loadCabins = true;

      if (this.dataSubscription) {
        this.dataSubscription.unsubscribe();
      }

      if (this.InteriorInfo) {
        this.CreateIniIndexRatesElement('Interior', this.InteriorInfo);
      }
      if (this.ExteriorInfo) {
        this.CreateIniIndexRatesElement('Exterior', this.ExteriorInfo);
      }
      if (this.BalconInfo) {
        this.CreateIniIndexRatesElement('Balcon', this.BalconInfo);
      }
      if (this.SuiteInfo) {
        this.CreateIniIndexRatesElement('Suite', this.SuiteInfo);
      }
      this.selectedCategoryRoom = this.BuildCategoryRoom(this.InteriorInfo, this.ExteriorInfo, this.BalconInfo, this.SuiteInfo);

      //new task
      var listadoCatSeleccionado
      switch (this.selectedCategoryRoom) {
        case 'Interior': {
          listadoCatSeleccionado = { "listadoCatSeleccionado": this.InteriorInfo }
          break;
        }
        case 'Exterior': {
          listadoCatSeleccionado = { "listadoCatSeleccionado": this.ExteriorInfo }
          break;
        }
        case 'Balcon': {
          listadoCatSeleccionado = { "listadoCatSeleccionado": this.BalconInfo }
          break;
        }
        case 'Suite': {
          listadoCatSeleccionado = { "listadoCatSeleccionado": this.SuiteInfo }
          break;
        }
        default: {
          break;
        }
      }

      Object.assign(this.reservation, listadoCatSeleccionado);
      this.userPreferences.setElement('Reservation', this.reservation);
      this.reservation = this.userPreferences.getElement('Reservation');
      //end new task

      this.BuildLoadElements(this.InteriorInfo, 'Interior');
      this.BuildLoadElements(this.ExteriorInfo, 'Exterior');
      this.BuildLoadElements(this.BalconInfo, 'Balcon');
      this.BuildLoadElements(this.SuiteInfo, 'Suite');

      var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];

      if (currentMeta != undefined || currentMeta != null) {
        this.selectedChildCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];
        this.selectedShowCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];    
        this.addonsValues = this.selectedChildCabin.addons.some((x: { valor: boolean; }) => x.valor)
        this.userPreferences.setElement('selectdateshowcabins', currentMeta.elements.length);
        this.UpdateMetaCategoryReservation(true);
      }
      this.loadingLabels = false;
      this.loadCabins = false;
    }
  }

}
