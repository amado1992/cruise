import { HttpErrorResponse } from '@angular/common/http';
import { Component, DoCheck, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, Subscription } from 'rxjs';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ChoiceCabinComponent } from '../choice-cabin/choice-cabin.component';
import { DomSanitizer } from '@angular/platform-browser';
import { ShowCabinComponent } from '../show-cabin/show-cabin.component';
import { Observable } from 'rxjs';
import { ErrorWindowComponent } from '../error-window/error-window.component';
@Component({
  selector: 'app-stateroom-rate',
  templateUrl: './stateroom-rate.component.html',
  styleUrls: ['./stateroom-rate.component.scss']
})
export class StateroomRateComponent implements OnInit, OnDestroy, DoCheck {

  public getScreenWidth: any;
  public getScreenHeight: any;
  reservaMode: any

  loading_one: boolean = false
  loading_two: boolean = false
  loading_three: boolean = false
  loading_four: boolean = false
  loading_five: boolean = false
  horizonte: boolean = true

  transactionSave: any// Nuevo campo
  aeropuertoIdSave: any// Nuevo campo
  messageValidate: any

  @Input() screenLangInfo: any;
  @Input() screenLangInfoCabinas: any;
  @Input() bestRate: boolean = true;
  @Input() filterBR: any;
  @Input() rate: any;
  @Input() indice: any;
  @Output() ChangeCategory: EventEmitter<any> = new EventEmitter();
  @Output() TerminaCargar = new EventEmitter<boolean>();
  @Output() dataLoaded = new EventEmitter<string>();
  showDeckArrowUp: boolean;
  showDeckArrowDown: boolean;
  itinerary: any;
  selectedDate: any;
  reservation: any;
  plano: any;
  selectedCategoryRoom: string;
  dataSubscription: Subscription;
  dataSubscriptionOtra: Subscription;
  dataSubscriptionAllInterior: Subscription
  dataSubscriptionAllExterior: Subscription
  dataSubscriptionAllBalcon: Subscription
  dataSubscriptionAllSuite: Subscription

  modalSubscription: Subscription;
  listaCabinasxCubiertas: any;
  listaCabinas: any;
  listaImagenes: any;
  listaPlanos: any;
  selectedCabin: any = null;
  messageError: any
  selectedShowCabin: any = null;
  selectedCabinIndex: any;
  selectedShowCabinIndex: any;
  DateCabinsLoad: { [metaCategoria: string]: any; } = {};
  ShowDateCabins: any[] = [];
  sailDate: string;
  loadCabins: boolean = false;
  loadingXST: boolean = true;
  loadingLabels: boolean;
  cleanTitleRate: any;
  cleanDescriptionRate: any;
  selectedDateCategoryData: any = null;
  taxesPrices: any;
  cantPasajeros: any;
  DateIndexPageLoad: { [metaCategoria: string]: any; } = {};
  addonsValues: boolean = false;
  selectedCabinPos: number = 0;
  existFly: boolean = false;
  deckName: any[] = [];
  deckCabinList: any[] = [];
  ModoReservacion: any;
  deckImagenes: any[] = [];
  ratesCome: any[] = [];
  rates: any;
  datospasajeros: any[] = []
  promoid: any;
  packageId: any;
  transactionCode: any;
  totalcabinas: any;
  lowCabinsPrice: { [metaCategoria: string]: any; } = {};
  priceprogramid: any;
  screenPropia: any;

  constructor(private router: Router, private adminService: AdminUsersService, private modalService: NgbModal,
    private userPreferences: UserPreferencesService, private sanitized: DomSanitizer) { }
  transform(value) {
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

    this.loadingLabels = false;
    this.selectedDate = this.userPreferences.getElement('SelectedDate');
    this.itinerary = this.userPreferences.getElement('Itinerary');
    this.reservation = this.userPreferences.getElement('Reservation');
    this.selectedCabinIndex = this.userPreferences.getElement('selectedCabinIndex');
    this.selectedShowCabinIndex = this.userPreferences.getElement('selectedCabinIndex');
    this.screenPropia = this.screenLangInfoCabinas;
    this.datospasajeros = this.reservation.pasajeros;
    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.totalcabinas = this.userPreferences.getElement('selectdateshowcabins');
    this.priceprogramid = this.userPreferences.getElement('priceProgramId');
    this.ModoReservacion = this.userPreferences.getElement('ModoReservacion');
    this.reservaMode = this.userPreferences.getElement("BookingMode")

    this.transactionSave = this.userPreferences.getElement('transactionSave');
    this.aeropuertoIdSave = this.userPreferences.getElement('aeropuertoIdSave');

    this.BuildAddonds();
    this.BuildSailDate();
    this.cleanTitleRate = this.reservation.rate.tarifa.titulo;
    var cleanIntermediate = this.cleanTitleRate.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanTitleRate = cleanIntermediate;
    this.cleanTitleRate = this.transform(this.cleanTitleRate);
    this.cleanDescriptionRate = '<img *ngIf="this.reservation.rate.icon" src="' + this.reservation.rate.tarifa.icon + '"style="max-height: 35px; min-width: 5px;">' + this.reservation.rate.tarifa.descripcion;
    var cleanIntermediate = this.cleanDescriptionRate.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanDescriptionRate = cleanIntermediate;
    this.cleanDescriptionRate = this.transform(this.cleanDescriptionRate);
    this.cantPasajeros = this.userPreferences.getElement('PaxTotal');
    var cabinaInicio = this.userPreferences.getElement('selectedCabin');
    this.promoid = this.userPreferences.getElement('priceProgramId');

    this.ratesCome = this.userPreferences.getElement("rates");
    this.rates = this.userPreferences.getElement("rates");
    var found = false;
    var rateIncome = this.ratesCome;

    var indicetarifa = this.userPreferences.getElement('indicetarifa');
    //Antes 
    /*if(rateIncome.length>1){
      indicetarifa = indicetarifa + 1;
    }*/
    //Fin antes
    this.initData()

    if (this.indice == indicetarifa) {
      if (this.ratesCome[indicetarifa].disponible == false) {
        indicetarifa = indicetarifa + 1;
      }

      var priceProgramIdResult = this.ratesCome[indicetarifa].priceProgramId;
      var priceProgramIdArray = priceProgramIdResult.split(',');
      var cadenapromos = "";
      var cadenapackage = "";
      for (let j = 0; j < priceProgramIdArray.length; j++) {
        var priceProgramAndpackageId = priceProgramIdArray[j].split('&&');
        //onsole.log("PRICE PROGRAM ", )
        cadenapromos = cadenapromos + priceProgramAndpackageId[0] + ",";
        if (j == 0) {

          cadenapackage = cadenapackage + priceProgramAndpackageId[1] + ",";
        }
      }

      cadenapromos = cadenapromos.slice(0, -1);
      cadenapackage = cadenapackage.slice(0, -1);
      this.promoid = cadenapromos

      this.packageId = cadenapackage;
      this.transactionCode = this.ratesCome[indicetarifa].transactionCode;

      found = true;


      if (this.transactionCode) {
        this.selectedCabinPos = this.userPreferences.getElement('selectedCabinPos');

        //New code
        let selectRate = this.rates[this.indice]
        let priceProgramId = selectRate.priceProgramId.split(",")

        if (this.reservation.rate.bestRate && this.reservation.rate.disponible) {
          this.promoid = ""
          this.LoadIndexInitData();
        }
        if (!this.reservation.rate.bestRate && this.reservation.rate.disponible) {
          this.LoadRatesInitData();
        }
        //End new code
        var metacategoriaAqui = "";
        if (this.selectedCabin != undefined || this.selectedCabin != null) {
          if (cabinaInicio.metacategoria == "S") {
            this.CargarCubiertas("Suite");
          }
          if (cabinaInicio.metacategoria == "D") {
            this.CargarCubiertas("Suite");
          }
          if (cabinaInicio.metacategoria == "B") {
            this.CargarCubiertas("Balcon");
          }
          if (cabinaInicio.metacategoria == "E") {
            this.CargarCubiertas("Exterior");
          }
          if (cabinaInicio.metacategoria == "O") {
            this.CargarCubiertas("Exterior");
          }
          if (cabinaInicio.metacategoria == "I") {
            this.CargarCubiertas("Interior");
          }
        }
        this.emitLoad(true);
      }
    }
  }
  ngDoCheck() {
    /*if (this.listaCabinas.length == 0) {
      if(this.messageError.err_cabinasNoDisponible != undefined){
        
      }
    }*/
  }
  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }
  emit(deck) {
    this.dataLoaded.emit(deck);
  }
  emitLoad(valor) {
    this.TerminaCargar.emit(valor);
  }
  emitContinue() {
    this.router.navigate(['cruisebrowser', 'passengerdatareservation']);
  }
  BuildAddonds() {
    if (this.selectedDate && this.selectedCabin.addons && this.selectedCabin.addons.length > 0) {
      for (let i = 1; i < this.selectedCabin.addons.length; i++) {
        if (this.selectedCabin.addons[i].valor == true) {
          this.addonsValues = true;
        }
      }
    }
  }
  LoadIndexInitData() {
    this.loadingXST = true
    this.loadCabins = true;
    var pagesLoad: number = 1;
    var pageSize: number = 5;
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    const sources = [
      this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter(this.reservation.idCategoriaHabitacion), pagesLoad, pageSize),
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([CategInfo]: any[]) => {
          this.loadingXST = false

          if (CategInfo) {
            this.CreateIniIndexElement(this.reservation.idCategoriaHabitacion, CategInfo);
          }
          this.LoadInitData();
        },
        (error: HttpErrorResponse) => {
          this.loadingXST = false

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
  LoadRatesInitData() {
    this.loadingXST = true
    this.loadCabins = true;
    var pagesLoad: number = 1;
    var pageSize: number = 5;
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    //new task
    this.CreateIniIndexRatesElement(this.reservation.idCategoriaHabitacion, this.reservation.listadoCatSeleccionado);
    this.selectedCategoryRoom = this.BuildCategoryRoomExtra(this.reservation.listadoCatSeleccionado);
    this.BuildLoadElements(this.reservation.listadoCatSeleccionado, this.reservation.idCategoriaHabitacion);

    this.UpdateMetaCategoryReservation();
    this.SaveSelectedCabin();
    this.loadingLabels = true;
    this.loadingXST = false
    this.loadCabins = false;
    //end new task

    /*const sources = [
      this.adminService.GetCabinasXTarifas(this.BuildRatesIniFilter(this.reservation.idCategoriaHabitacion), pagesLoad, pageSize),
      ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([CategInfo]: any[]) => {
          this.loadingXST = false
          if (CategInfo) {
            this.CreateIniIndexRatesElement(this.reservation.idCategoriaHabitacion, CategInfo);
          }


          this.selectedCategoryRoom = this.BuildCategoryRoomExtra(CategInfo);
          this.BuildLoadElements(CategInfo, this.reservation.idCategoriaHabitacion);

          var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
        /*  if (currentMeta != undefined) {
            this.selectedCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];
          }*/

    /*this.UpdateMetaCategoryReservation();
    this.SaveSelectedCabin();
    this.loadingLabels = true;
  },
  (error: HttpErrorResponse) => {
    this.loadingXST = false

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

  });*/

  }
  LoadInitData() {
    this.loadingXST = true
    var pageSize: number = 5;
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    //new task
    this.selectedCategoryRoom = this.BuildCategoryRoomExtra(this.reservation.listadoCatSeleccionado);
    this.BuildLoadElements(this.reservation.listadoCatSeleccionado, this.reservation.idCategoriaHabitacion);
    this.loadingLabels = true;
    this.loadingXST = false
    this.loadCabins = false;
    //end new task

    /*const sources = [


      this.adminService.GetCabinasXSalidas(this.BuildFilter(this.reservation.idCategoriaHabitacion), this.DateIndexPageLoad[this.reservation.idCategoriaHabitacion].currentPage, pageSize),


    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(

        ([CategCabin]: any[]) => {
          this.loadingXST = false
          this.selectedCategoryRoom = this.BuildCategoryRoomExtra(CategCabin);
          this.BuildLoadElements(CategCabin, this.reservation.idCategoriaHabitacion);

          this.loadingLabels = true;
        },
        (error: HttpErrorResponse) => {
          this.loadingXST = false

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

        });*/

  }
  ChangeCategoryRoom(value: string, price: any) {
    if (price != null && price != 0) {
      this.selectedCategoryRoom = value;
      this.selectedCabinIndex = this.DateIndexPageLoad[this.selectedCategoryRoom].indexBestDate;
      this.selectedShowCabinIndex = this.DateIndexPageLoad[this.selectedCategoryRoom].indexBestDate;
      this.selectedCabinPos = 0;
      var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
      this.selectedCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];
      this.selectedShowCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];
      this.CheckFlyInCabin();
      this.UpdateMetaCategoryReservation();
      this.SelectCategoryData();
      this.SaveSelectedCabin();
      this.BuildShowCabins();
      this.CargarCubiertas(value);

    }
  }
  UpdateMetaCategoryReservation() {
    if (!this.reservation) {
      this.reservation = {};
    }
    this.reservation.idCategoriaHabitacion = this.selectedCategoryRoom;
    this.ChangeCategory.emit(this.selectedCabin);
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
              var reservation = this.userPreferences.getElement('Reservation');
              var data = reservation.listadoCatSeleccionado.data

              if (loadData.data.length > 0) {
                var newElements: any[] = [];
                for (let index = 0; index < loadData.data.length; index++) {
                  var found = data.find(element => element[0].titulo == loadData.data[index][0].titulo)

                  //newElements.push(loadData.data[index]);
                  if (found == undefined) {
                    newElements.push(loadData.data[index])
                  }
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
  ChangeCategoryInside(selectCabin: any) {
    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    var modo = this.userPreferences.getElement('Reservation');
    if (modo.mode == 'Offline') {
      this.selectedDateCategoryData = selectCabin.precioCabinaPax;
    } else {
      this.selectedDateCategoryData = selectCabin.precioCabina;
    }
  }
  BuildSailDate() {
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split('-');
      this.sailDate = split[0] + '-' + split[1] + '-' + split[2];
    }
  }
  BuildFilter(metaCategoria: string): any {
    var precio = this.BuildPrecios(metaCategoria);

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
      PriceProgramId: this.promoid,
      TarifaPromoId: this.promoid,
      CantPasajeros: this.cantPasajeros.toString(),
      ListaPasajeros: this.reservation.pasajeros,
      PackageId: this.packageId,
      TransactionCode: this.transactionCode,
      IsNRF: this.selectedCabin.esNRF,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
        ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      FunctionalBranch: this.reservaMode
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
      pageSize: loadData.pageSize
    };

    //this.selectedCabinIndex = 4

    if (metaCategoria == this.selectedCategoryRoom) {
      this.selectedCabin = elementsData[this.selectedCabinIndex][this.selectedCabinPos];
      this.selectedShowCabin = elementsData[this.selectedCabinIndex][this.selectedCabinPos];
      this.CheckFlyInCabin();
      if (this.reservation.rate.bestRate && this.reservation.rate.disponible) {
        this.UpdateMetaCategoryReservation();
        this.SaveSelectedCabin();
      }
      this.SelectCategoryData();

      /* for (let index = 0; index < loadData.data.length; index++) {
         var element = loadData.data[index];
         if (index < this.selectedCabinIndex + 1) {
           this.ShowDateCabins.push({ index: index, element: element });
         }
         else {
           break;
         }
       }*/

      //new code
      this.BuildShowCabinsData(loadData.data)

    }
    /*if (this.ShowDateCabins.length == 0 || loadData.data.length == 0){
      this.ShowDateCabins = this.copyShowDateCabins.slice()
    }*/
  }

  BuildShowCabinsData(data) {
    this.ShowDateCabins = [];
    var currentMeta = data
    if (this.selectedShowCabinIndex == 0) {
      for (let index = 0; index < currentMeta.length; index++) {
        var date = currentMeta[index];
        if (index < 3) {
          this.ShowDateCabins.push({ index: index, element: date });
        }
        else {
          break;
        }
      }
    }
    else if (this.selectedShowCabinIndex == currentMeta.length - 1) {
      if (currentMeta.length == 2) {
        for (let index = 0; index < currentMeta.length; index++) {
          var date = currentMeta[index];
          this.ShowDateCabins.push({ index: index, element: date });
        }
      }

      else {
        for (let index = currentMeta.length - 2; index < currentMeta.length; index++) {
          const date = currentMeta[index];
          this.ShowDateCabins.push({ index: index, element: date });
        }
      }
    }
    else {
      for (let index = this.selectedShowCabinIndex - 1; index <= this.selectedShowCabinIndex + 1; index++) {
        const date = currentMeta[index];
        this.ShowDateCabins.push({ index: index, element: date });
      }
    }
  }

  SelectCabin(index: number) {
    this.selectedCabinIndex = index;
    this.selectedShowCabinIndex = index;
    var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
    if (this.selectedCabinPos > currentMeta.elements[index].length) {
      this.selectedCabinPos = 0;
    }
    this.emitLoad(true);
    this.selectedShowCabin = currentMeta.elements[index][this.selectedCabinPos];
    this.selectedCabin = currentMeta.elements[index][this.selectedCabinPos];
    this.CheckFlyInCabin();
    this.SelectCategoryData();
    this.UpdateMetaCategoryReservation();
    this.SaveSelectedCabin();
    this.BuildShowCabins();
    var element = this.DateIndexPageLoad[this.selectedCategoryRoom];

    if (currentMeta.elements.length >= 5 && (this.selectedShowCabinIndex >= currentMeta.elements.length - 3)) {
      if (Math.ceil(currentMeta.elements.length / currentMeta.pageSize) != currentMeta.totalPages && !this.loadCabins) {
        element.maxPageLoad = Math.ceil(currentMeta.elements.length / currentMeta.pageSize) + 1
        element.currentPage = Math.ceil(currentMeta.elements.length / currentMeta.pageSize) + 1;
        if (this.reservation.rate.bestRate && this.reservation.rate.disponible) {
          this.LoadCabins(false);
        }
        else {
          this.LoadRatesCabins(false);
        }
      }
    }
    else if (this.selectedShowCabinIndex < 2) {
      if (element.minPageLoad > 1 && !this.loadCabins) {
        element.minPageLoad = Math.ceil(currentMeta.elements.length / currentMeta.pageSize) - 1;
        element.currentPage = Math.ceil(currentMeta.elements.length / currentMeta.pageSize) - 1;
        if (this.reservation.rate.bestRate && this.reservation.rate.disponible) {
          this.LoadCabins(true);
        }
        else {
          this.LoadRatesCabins(true);
        }
      }

    }
    this.selectedCabin.cabinNumber = '';
    this.selectedCabin.deckCode = '';
    this.userPreferences.setElement('selectedCabin', this.selectedCabin);
    this.selectedCabin = this.userPreferences.getElement('selectedCabin')
    this.emit({ campo: 2, valor: "" });
    this.emit({ campo: 1, valor: "" });
  }
  ViewCabin() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ShowCabinComponent, { size: 'sm', centered: true });
    (<ShowCabinComponent>modalRef.componentInstance).screenLangInfo = this.screenLangInfo;
    this.modalSubscription = from(modalRef.result).subscribe();
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
        if (Math.ceil(currentMeta.elements.length / currentMeta.pageSize) != currentMeta.totalPages && !this.loadCabins) {
          element.maxPageLoad = Math.ceil(currentMeta.elements.length / currentMeta.pageSize) + 1;
           element.currentPage = Math.ceil(currentMeta.elements.length / currentMeta.pageSize) + 1;
          if (this.reservation.rate.bestRate && this.reservation.rate.disponible) {
            this.LoadCabins(false);
          } else {
            this.LoadRatesCabins(false);
          }
        }
        this.SelectCabin(Number(this.selectedShowCabinIndex));
      }
    this.SelectCabin(Number(this.selectedShowCabinIndex));
  }
  PreviousCabin() {
    var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
    if (this.selectedShowCabinIndex > 0) {
      this.selectedShowCabinIndex--;
      this.selectedShowCabin = currentMeta.elements[this.selectedShowCabinIndex][0];
      this.BuildShowCabins();
      this.SelectCabin(Number(this.selectedShowCabinIndex));
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

  PreviusDeck() {
    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    var newDeckPosition = this.deckName.indexOf(this.selectedCabin.deckCode) - 1;
    if (newDeckPosition >= 0) {
      var newDeck = this.deckName[this.deckName.indexOf(this.selectedCabin.deckCode) - 1];
      this.selectedCabin.deckCode = newDeck;
      this.SelectDeck(newDeck);
      if (newDeckPosition == 0) {
        this.showDeckArrowUp = false;
        if (this.deckName.length > 1) {
          this.showDeckArrowDown = true;
        }
      } else {
        this.showDeckArrowUp = true;
        if (this.deckName.length > 1) {
          this.showDeckArrowDown = true;
        }
      }
    } else {
      this.showDeckArrowUp = false;
      if (this.deckName.length > 1) {
        this.showDeckArrowDown = true;
      }
    }
  }
  NextDeck() {
    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    var newDeckPosition = this.deckName.indexOf(this.selectedCabin.deckCode) + 1;
    if (newDeckPosition < this.deckName.length) {
      var newDeck = this.deckName[this.deckName.indexOf(this.selectedCabin.deckCode) + 1];
      this.selectedCabin.deckCode = newDeck;
      this.SelectDeck(newDeck);
      if (newDeckPosition + 1 == this.deckName.length) {
        this.showDeckArrowUp = true;
        this.showDeckArrowDown = false;
      } else {
        this.showDeckArrowUp = true;
        this.showDeckArrowDown = true;
      }
    } else {
      this.showDeckArrowUp = true;
      this.showDeckArrowDown = true;
    }
  }
  SelectDeckDiv(indice) {
  }
  BuildShowCabinsOld() {
    this.ShowDateCabins = [];
    var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
    if (this.selectedShowCabinIndex == 0) {
      for (let index = 0; index < currentMeta.elements.length; index++) {
        const date = currentMeta.elements[index];
        if (index < 3) {
          this.ShowDateCabins.push({ index: index, element: date });
        }
        else {
          break;
        }
      }
    }
    else if (this.selectedShowCabinIndex == currentMeta.elements.length - 1) {
      if (currentMeta.elements.length == 3) {
        for (let index = 0; index < currentMeta.elements.length; index++) {
          const date = currentMeta.elements[index];
          this.ShowDateCabins.push({ index: index, element: date });
        }
      }
      else {
        for (let index = currentMeta.elements.length - 3; index < currentMeta.elements.length; index++) {
          const date = currentMeta.elements[index];
          this.ShowDateCabins.push({ index: index, element: date });
        }
      }
    }
    else {
      for (let index = this.selectedShowCabinIndex - 1; index < currentMeta.elements.length; index++) {
        //for (let index = this.selectedShowCabinIndex - 1; index <= 3; index++) {
        const date = currentMeta.elements[index];
        this.ShowDateCabins.push({ index: index, element: date });
      }
    }

    /*if (this.ShowDateCabins.length == 0 || currentMeta.elements.length == 0){
      this.ShowDateCabins = this.copyShowDateCabins.slice()
    }*/
  }

  BuildShowCabins() {
    this.ShowDateCabins = [];
    var currentMeta = this.DateCabinsLoad[this.selectedCategoryRoom];
    if (this.selectedShowCabinIndex == 0) {
      for (let index = 0; index < currentMeta.elements.length; index++) {
        const date = currentMeta.elements[index];
        if (index < 3) {
          this.ShowDateCabins.push({ index: index, element: date });
        }
        else {
          break;
        }
      }
    }
    else if (this.selectedShowCabinIndex == currentMeta.elements.length - 1) {
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

  SaveSelectedCabin() {
    this.userPreferences.setElement('selectedCabin', this.selectedCabin);
    this.userPreferences.setElement('selectedShowCabin', this.selectedShowCabin);
    this.selectedCabin = this.userPreferences.getElement('selectedCabin')
    var metacategoriaAqui = "";
    if (this.selectedCabin.metacategoria == "S") {
      this.CargarCubiertas("Suite");
    }
    if (this.selectedCabin.metacategoria == "D") {
      this.CargarCubiertas("Suite");
    }
    if (this.selectedCabin.metacategoria == "B") {
      this.CargarCubiertas("Balcon");
    }
    if (this.selectedCabin.metacategoria == "E") {
      this.CargarCubiertas("Exterior");
    }
    if (this.selectedCabin.metacategoria == "O") {
      this.CargarCubiertas("Exterior");
    }
    if (this.selectedCabin.metacategoria == "I") {
      this.CargarCubiertas("Interior");
    }
  }
  SelectCategoryData() {
    var date = this.selectedCabin;
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
  showcolor(value) {
    var colormiddle = "";
    if (value != null) {
      colormiddle = value.replace("Color", "");
      colormiddle = colormiddle.replace("[", "");
      colormiddle = colormiddle.replace("]", "");
    }
    return colormiddle.trim();
  }
  BuildIniFilter(metaCategoria: string): any {
    var precio = this.BuildPrecios(metaCategoria);
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
      //PriceProgramId: this.priceprogramid
      PriceProgramId: this.promoid,
      FunctionalBranch: this.reservaMode
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
      pageSize: element.pageSize,
      totalPages: element.totalPages,
      indexBestDate: element.posInPage,
    };
  }

  BuildRatesIniFilter(metaCategoria: string): any {
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
      TarifaPromoId: this.promoid,
      Metacategoria: this.BuildMetaCategoria(metaCategoria),
      //PriceProgramId: this.priceprogramid,
      PriceProgramId: this.promoid,
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      CantPasajeros: this.cantPasajeros.toString(),
      ListaPasajeros: this.reservation.pasajeros,
      PackageId: this.packageId,
      TransactionCode: this.transactionCode,
      AeropuertoId: this.aeropuertoIdSave,
      Transaction: this.transactionSave,
      IsNRF: this.selectedCabin.esNRF,
      ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
      ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
      FunctionalBranch: this.reservaMode
    };
    return currentFilter;
  }
  CreateIniIndexRatesElement(metaCategoria: string, element: any) {
    this.DateIndexPageLoad[metaCategoria] =
    {
      minPageLoad: element.pageNumber,
      maxPageLoad: element.pageNumber,
      currentPage: element.pageNumber,
      pageSize: element.pageSize,
      totalPages: element.totalPages,
      indexBestDate: 0,
    };
  }
  LoadRatesCabins(ini: boolean) {
    this.loadingXST = true
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

              this.loadingXST = false
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
              this.loadingXST = false

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
    this.selectedCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];
    this.selectedShowCabin = currentMeta.elements[this.selectedCabinIndex][this.selectedCabinPos];
    this.UpdateMetaCategoryReservation();
    this.SelectCategoryData();
    this.SaveSelectedCabin();
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

  BuildCategoryRoomExtra(CategCabin: any): any {
    var modo = this.userPreferences.getElement('Reservation');
    var result = this.selectedCategoryRoom;
    var ExteriorCabin = CategCabin;
    var InteriorCabin = CategCabin;
    var BalconCabin = CategCabin;
    var SuiteCabin = CategCabin;

    var validCategory: boolean = false;
    if (modo.mode == 'Offline') {
      switch (this.selectedCategoryRoom) {
        case 'Interior':
          if (CategCabin.data[0][0].precioCabinaPax && CategCabin.data[0][0].precioCabinaPax.valorPrincipal
            && CategCabin.data[0][0].precioCabinaPax.valorPrincipal > 0) {
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
  CargarCubiertas(horizonte) {
    this.loading_one = false
    this.loading_two = false
    this.loading_three = false
    this.loading_four = false
    this.loading_five = false

    this.horizonte = horizonte

    if (this.dataSubscriptionOtra) {
      this.dataSubscriptionOtra.unsubscribe();
    }

    //Nueva condiciones
    if (this.dataSubscriptionAllInterior) {
      this.dataSubscriptionAllInterior.unsubscribe();
    }

    if (this.dataSubscriptionAllExterior) {
      this.dataSubscriptionAllExterior.unsubscribe();
    }

    if (this.dataSubscriptionAllSuite) {
      this.dataSubscriptionAllSuite.unsubscribe();
    }

    if (this.dataSubscriptionAllBalcon) {
      this.dataSubscriptionAllBalcon.unsubscribe();
    }
    //Fin de nueva condiciones
    if (horizonte == "TODAS") {

      //Nueva solucion
      this.dataSubscriptionAllInterior = this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas('Interior'), 1, 5)
        .subscribe(
          (ListaInteriorCabins: any[]) => {
            this.loading_one = true
            if (this.selectedCategoryRoom == "Interior") {
              this.listaCabinas = ListaInteriorCabins;
            }
          },
          (error: HttpErrorResponse) => {
            this.loading_one = true

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

      this.dataSubscriptionAllExterior = this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas('Exterior'), 1, 5)
        .subscribe(
          (ListaExteriorCabins: any[]) => {
            this.loading_two = true
            if (this.selectedCategoryRoom == "Exterior") {
              this.listaCabinas = ListaExteriorCabins;
            }
          },
          (error: HttpErrorResponse) => {
            this.loading_two = true

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

      this.dataSubscriptionAllBalcon = this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas('Balcon'), 1, 5)
        .subscribe(
          (ListaBalconCabins: any[]) => {
            this.loading_three = true
            if (this.selectedCategoryRoom == "Balcon") {
              this.listaCabinas = ListaBalconCabins;
            }
          },
          (error: HttpErrorResponse) => {
            this.loading_three = true

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

      this.dataSubscriptionAllSuite = this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas('Suite'), 1, 5)
        .subscribe(
          (ListaSuiteCabins: any[]) => {
            this.loading_four = true
            if (this.selectedCategoryRoom == "Suite") {
              this.listaCabinas = ListaSuiteCabins;
            }
          },
          (error: HttpErrorResponse) => {
            this.loading_four = true
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
    } else {
      this.selectedShowCabin = this.userPreferences.getElement('selectedShowCabin');
      if (this.selectedCabin.categoria === this.selectedShowCabin.categoria) {
        this.listaCabinas = "";
        this.deckName = [];
        const sourcescabins = [
          this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas(horizonte), 1, 5),
        ];
        this.dataSubscriptionOtra = forkJoin(sourcescabins)
          .subscribe(
            ([ListaCabins]: any[]) => {
              this.loading_five = true
              if (horizonte == "Exterior") {
                this.listaCabinas = ListaCabins;
              }
              if (horizonte == "Interior") {
                this.listaCabinas = ListaCabins;
              }
              if (horizonte == "Suite") {
                this.listaCabinas = ListaCabins;
              }
              if (horizonte == "Balcon") {
                this.listaCabinas = ListaCabins;
              }

              var arrayCabinas = this.listaCabinas.data.listaCabinas

              for (let k = 0; k < arrayCabinas.length; k++) {
                var objeto = arrayCabinas[k];
                this.deckName[k] = objeto.cabinDeck;
                this.deckCabinList[k] = objeto.listCabinas;
                this.deckImagenes[k] = objeto.listaImagenes;
              }
              if (this.deckName.length > 0) {
                this.showDeckArrowDown = true;
                this.showDeckArrowUp = false;
              }
              if (arrayCabinas.length > 0) {
                this.listaCabinasxCubiertas = this.deckCabinList[0];
                var Imagenes = this.deckImagenes[0];
                this.listaImagenes = Imagenes[0].url;

                if (this.selectedCabin != undefined || this.selectedCabin != null) {

                  if (this.selectedCabin.deckImg != null) {
                    this.selectedCabin.deckImg.url = this.listaImagenes;
                  }
                  this.selectedCabin.deckCode = this.deckName[0];
                  this.selectedCabin.deckProfileImg.url = Imagenes[1].url;
                }
                this.listaPlanos = Imagenes[1].url;
                this.plano = this.listaPlanos;
                this.plano = this.plano.includes("Default_Cabina");
                this.emitLoad(true);
              } else {
                this.emitLoad(true);
              }
            },
            (error: HttpErrorResponse) => {
              this.loading_five = true
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
      Metacategoria: this.selectedCabin.metacategoria,
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      CantPasajeros: this.cantPasajeros.toString(),
      //ListaPasajeros: arreglosinloyalty,
      ListaPasajeros: this.reservation.pasajeros,
      CategoriaCabina: this.selectedCabin.categoria,
      TransactionCode: this.selectedCabin.transaction,

      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid,
      AeropuertoId: this.aeropuertoIdSave,
      Transaction: this.transactionSave,

      TarifaPromoId: this.priceprogramid,
      FunctionalBranch: this.reservaMode

    };
    return currentFilter;
  }
  showHTML(valor) {

    var cleanIntermediate = valor.toString();

    cleanIntermediate = cleanIntermediate.toString().replace("\r\n", "<br/>");

    let cleanText = cleanIntermediate;
    cleanText = this.transform(cleanText);
    return cleanText;
  }
  SelectDeck(indice) {
    var indiceArreglo = this.deckName.indexOf(indice);
    this.listaCabinasxCubiertas = this.deckCabinList[indiceArreglo];
    var Imagenes = this.deckImagenes[indiceArreglo];
    this.listaImagenes = Imagenes[0].url;
    this.listaPlanos = Imagenes[1].url;
    this.selectedCabin.deckImg.url = this.listaImagenes;
    this.selectedCabin.deckProfileImg.url = Imagenes[1].url;
    this.selectedCabin.deckCode = indice;
    this.emit({ campo: 2, valor: "" });
    this.emit({ campo: 1, valor: "" });
  }
  SelectDeckCabin(cabinnumber) {
    this.selectedCabin.cabinNumber = cabinnumber;
    this.userPreferences.setElement('selectedCabin', this.selectedCabin);
    this.selectedCabin = this.userPreferences.getElement('selectedCabin')
    this.emit({ campo: 2, valor: cabinnumber });
    this.emit({ campo: 1, valor: this.selectedCabin.deckCode });
  }
  zoomIn(event: any) {
    var pre = document.getElementById("preview");
    var posX = event.offsetX;
    var posY = event.offsetY;
    if (pre) {
      var valor = pre.clientHeight >= 500 ? 3 : 5;
      pre.style.backgroundPosition = 0 + "px " + (-posY * valor) + "px";
    }
  }
  zoomOut() {
  }

  initData() {
    this.adminService.GetScreenValidationLocale().subscribe(next => {
      this.messageError = next

    }, (error: HttpErrorResponse) => {

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

    })

  }

  validationLocale() {
    this.adminService.GetScreenValidationLocale().subscribe(next => {
      this.messageValidate = next
    })
  }

}
