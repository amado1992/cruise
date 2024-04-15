import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, Subscription } from 'rxjs';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ChoiceCabinComponent } from '../choice-cabin/choice-cabin.component';
import { ItineraryinfoComponent } from '../itineraryinfo/itineraryinfo.component';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { CallCenterComponent } from '../call-center/call-center.component';
import { ErrorWindowComponent } from '../error-window/error-window.component';
import { element } from '@angular/core/src/render3/instructions';
import { Key } from 'selenium-webdriver';
import { AgenciaService } from 'src/app/services/DataServices/agencia.service';

@Component({
  selector: 'app-rates',
  templateUrl: './rates.component.html',
  styleUrls: ['./rates.component.scss']
})
export class RatesComponent implements OnInit, OnDestroy, AfterViewInit {
  conVueloIncluidoTariff: false
  aeropuertoIdTariff: ""
  aeropuertoId: any// Nuevo campo
  transactionSave: any// Nuevo campo
  aeropuertoIdSave: any// Nuevo campo
  exitExhausted: boolean = true
  messageValidate: any
  soloCotizacionOnline: any

  public getScreenWidth: any;
  public getScreenHeight: any;
  @ViewChild('addons0') addons0: ElementRef;

  loadingLabels: boolean;
  errorLoadingLabels: boolean;
  dataSubscription: Subscription;
  modalSubscription: Subscription;
  screenLangInfo: any = null;
  listaCabinasxCubiertas: any;
  listaCabinas: any;
  listaImagenes: any;
  listaPlanos: any;
  selectedCabin: any;
  itinerary: any;
  selectedDate: any;
  priceprogramid: any;
  experienciatitle: any;
  experienciaicon: any;
  experienciadescription: any;
  reservation: any;
  InteriorInfo: any[] = [];
  ExteriorInfo: any[] = [];
  SuiteInfo: any[] = [];
  BalconInfo: any[] = [];
  Vuelo: any;
  selectedCategoryRoom: string;
  selectedDateCategoryData: any;
  params: ParamMap;
  queryParamSubscription: Subscription;
  IdItinerary: any;
  IdDate: any;
  categoryRoom: any;
  cantidadPasajeros: any;
  sailDate: any;
  cleanText: any;
  cleanTitleRate: any;
  company: any;
  reservationMode: any;
  //rateList: any;
  rateList: any[] = [];
  rateTitle: string;
  rateDescription: string;
  cleanDescriptionRate: string;
  existBR: boolean = false;
  rateListReverse: any;
  filterBR: any;
  rate: any;
  enableProcess: any;
  activeaddons: any;
  xcabinaxpasajero: any;
  preciofinal: any;
  mostrarcallcenter: any;
  activeAgencia: any;
  constructor(private router: Router, private adminService: AdminUsersService, private modalService: NgbModal,
    private renderer: Renderer2, private userPreferences: UserPreferencesService,
     private activatedRoute: ActivatedRoute, private sanitized: DomSanitizer, 
     private cdRef: ChangeDetectorRef,
     private agenciaService: AgenciaService) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  showHTML(valor) {
    var cleanIntermediate = valor.toString();
    cleanIntermediate = cleanIntermediate.replace("\r\n", "<br/>");
    this.cleanText = cleanIntermediate;
    this.cleanText = this.transform(this.cleanText);
    return this.cleanText;
  }
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
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
  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;    
    this.activeAgencia = this.agenciaService.getAgenciabyurl(this.userPreferences.getUrlConexion());
    this.userPreferences.setElement("backReservationSummary", false);
    localStorage.removeItem('cabinsAll');
    this.soloCotizacionOnline = JSON.parse(localStorage.getItem('SoloCotizacionOnline').toLowerCase());

    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    let value = this.userPreferences.getElement("PaxTotal");
    if (value) {

      this.cantidadPasajeros = value;
    } else {
      this.userPreferences.setElement("PaxTotal", 2);
      this.cantidadPasajeros = 2;
    }
    this.userPreferences.setElement('enews', false);
    this.userPreferences.setElement("checkagenteViajes", false);
    this.userPreferences.setElement("PropinaIncluida", false);
    this.userPreferences.setElement("SeguroIncluido", false);
    this.userPreferences.setElement("acceptTermConditions", false);
    this.preciofinal = false;
    this.userPreferences.setElement('indicetarifa', 0);
    this.enableProcess = false;
    this.mostrarcallcenter = this.activeAgencia.mostrarcallcenter;
    this.Vuelo = this.userPreferences.getElement("ConVueloIncluido");
    if (this.Vuelo == null) { this.Vuelo = false; }
    //Agregando codigo
    this.aeropuertoId = this.userPreferences.getElement("AeropuertoId");
    if (this.aeropuertoId == null || this.aeropuertoId == undefined) {
      this.aeropuertoId = ""
    }
    //Fin agregando codigo

    //Add atribute
    //this.userPreferences.getElement('priceProgramIdSave');
    //this.userPreferences.getElement('packageIdSave');

    this.transactionSave = this.userPreferences.getElement('transactionSave');
    this.aeropuertoIdSave = this.userPreferences.getElement('aeropuertoIdSave');
    //End add atribute
    this.userPreferences.setElement("TerminaRate", "false");
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
      this.itinerary = this.userPreferences.getElement("Itinerary");
      this.reservation = this.userPreferences.getElement("Reservation");
      this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;

      this.BuildSailDate();
      if (this.cantidadPasajeros == undefined) {
        this.cantidadPasajeros = "2";
        this.reservation.pasajeros = [];

      }
      this.InitDataNew();
      this.SelectCategoryData();
    }
  }

  ValidateDiasValidosReserva() {
    var fechadesde = new Date().getTime();
    var fechahasta = new Date(this.selectedDate.fechaSalida).getTime();
    var diff_ = (fechahasta - fechadesde) / (1000 * 60 * 60 * 24);
    return diff_ > Number(this.reservation.CotizacionConfig.diasSoloCotizacion);
  }

  ngAfterViewInit() {

  }
  ChangeAgotado($event) {
    this.exitExhausted = $event
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
  InitData() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.InteriorInfo = [];
    this.ExteriorInfo = [];
    this.SuiteInfo = [];
    this.BalconInfo = [];
    this.loadingLabels = true;
    this.errorLoadingLabels = false;
    var arreglosinloyalty = []
    if (this.reservation.pasajeros.length > 0) {
      arreglosinloyalty = this.reservation.pasajeros;
    } else {
      //for (var key in this.reservation.pasajeros) {
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
      this.adminService.GetListTarifasPSZ(currentFilter),
      this.adminService.GetListTarifasBR(currentFilter),
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo, rates, ratesBR]: any[]) => {
          this.screenLangInfo = screenInfo;
          if (this.itinerary.nnoches == '1') {
            var noche = this.screenLangInfo.lbl_noche;
            this.screenLangInfo.lbl_nochesEnEl = noche;

          }
          this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
          this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]", this.cantidadPasajeros.toString());
          var pagesLoad: number = 1;
          var pageSize: number = 5;
          if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
          }
          this.userPreferences.setElement("rates", rates);
          this.loadingLabels = false;
          const sourcesini = [
            this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Interior'), pagesLoad, pageSize),
            this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Exterior'), pagesLoad, pageSize),
            this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Balcon'), pagesLoad, pageSize),
            this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Suite'), pagesLoad, pageSize)
          ];
          this.dataSubscription = forkJoin(sourcesini)
            .subscribe(
              ([InteriorInfo, ExteriorInfo, BalconInfo, SuiteInfo]: any[]) => {
                this.ExteriorInfo = ExteriorInfo;
                this.InteriorInfo = InteriorInfo;
                this.BalconInfo = BalconInfo;
                this.SuiteInfo = SuiteInfo;
                this.userPreferences.setElement("ratesBR", ratesBR);
                this.userPreferences.setElement("rates", rates);
                this.CompareRates(rates, rates.ratesBR);
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
        });
  }
  swapElements(a, x, y) {
    if (a.length === 1) return a;
    a.splice(y, 1, a.splice(x, 1, a[y])[0]);
    return a;
  };
  InitDataNewOld() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.InteriorInfo = [];
    this.ExteriorInfo = [];
    this.SuiteInfo = [];
    this.BalconInfo = [];
    this.loadingLabels = true;
    this.errorLoadingLabels = false;
    var arreglosinloyalty = []


    if (this.reservation.pasajeros) {
      if (this.reservation.pasajeros.length > 0) {
        arreglosinloyalty = this.reservation.pasajeros;
      }
    } else {
      this.reservation.pasajeros = [];

      for (var key = 0; key < this.cantidadPasajeros; key++) {
        arreglosinloyalty.push({
          //"edad": String(this.reservation.pasajeros[key].edad),
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
    this.userPreferences.setElement("Reservation", this.reservation);
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
      PackageId: this.selectedDate.packageId.toString(),
      TarifaPromoId: '',
      PriceProgramId: '',
      ConVueloIncluido: this.Vuelo,
      AeropuertoId: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == 'undefined') ? "" :  this.reservation.VueloSeleccionado.Id,
      ComponentCodeFlight: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == 'undefined') ? "" : this.reservation.VueloSeleccionado.Code,
     IsNRF: this.selectedDate.esNRF
    };

    const sources = [
      this.adminService.GetScreenTarifaSelectionLocale(),
      this.adminService.GetBloqueTarifas(currentFilter),
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo, rates]: any[]) => {

          this.screenLangInfo = screenInfo;
          var hayNoDisponible = false;
          this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
          this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]", this.cantidadPasajeros.toString());
          var pagesLoad: number = 1;
          var pageSize: number = 5;

          //rates = rates.reverse();
          for (let i = 0; i < rates.length; i++) {
            var activa = rates[i].tarifa;
            if (activa.activa) {
              if (rates[i].disponible != true) { hayNoDisponible = true; }
              if (rates[i].bestRate == true && rates[i].disponible == true) {

                //New add
                this.aeropuertoIdTariff = rates[i].aeropuertoId
                this.conVueloIncluidoTariff = rates[i].conVueloIncluido
                //End add

                this.existBR = true;
                var priceProgramIdResult = rates[i].priceProgramId;
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
                if (priceProgramIdResult != "") {
                  this.enableProcess = true;

                }

                const sourcesBRIni = [

                  this.adminService.GetCabinasXSalidas(this.BuildIniFilterBR('Interior', cadenapromos, cadenapackage, rates[i].transactionCode), 1, 5),

                ];

                this.dataSubscription = forkJoin(sourcesBRIni)
                  .subscribe(
                    ([InteriorInfo]: any[]) => {

                      this.InteriorInfo.push(InteriorInfo);

                      const sourcesBR = [

                        //this.adminService.GetCabinasXSalidas(this.BuildIniFilterBR('Interior', cadenapromos, cadenapackage, rates[i].transactionCode), 1, 5),
                        this.adminService.GetCabinasXSalidas(this.BuildIniFilterBR('Suite', cadenapromos, cadenapackage, rates[i].transactionCode), 1, 5),
                        this.adminService.GetCabinasXSalidas(this.BuildIniFilterBR('Exterior', cadenapromos, cadenapackage, rates[i].transactionCode), 1, 5),
                        this.adminService.GetCabinasXSalidas(this.BuildIniFilterBR('Balcon', cadenapromos, cadenapackage, rates[i].transactionCode), 1, 5),

                      ];
                      this.dataSubscription = forkJoin(sourcesBR)
                        .subscribe(
                          // ([InteriorInfo, SuiteInfo, ExteriorInfo, BalconInfo]: any[]) => {
                          ([SuiteInfo, ExteriorInfo, BalconInfo]: any[]) => {
                            this.rateList.push(rates[i]);

                            this.ExteriorInfo.push(ExteriorInfo);

                            this.BalconInfo.push(BalconInfo);
                            this.SuiteInfo.push(SuiteInfo);
                            if (i + 1 == rates.length) {
                              //this.rateListReverse = this.rateList.reverse();
                              if (hayNoDisponible) {
                                var final = this.rateList[rates.length - 1];
                                this.rateList[rates.length - 1] = this.rateList[0];
                                this.rateList[0] = final;

                                this.rateListReverse = this.rateList;
                                this.orderByTariff()
                              } else {

                                this.rateListReverse = this.rateList;
                                this.orderByTariff()

                              }
                              this.CargarLuego();

                              this.loadingLabels = false;


                            }

                          },
                          (error: HttpErrorResponse) => {

                            this.loadingLabels = false;
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
                          },
                          () => {

                            //this.orderBy()
                          });

                    },
                    (error: HttpErrorResponse) => {

                      this.loadingLabels = false;
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
                    },
                    () => {
                      //this.orderBy()
                    });
              } else {

                if (rates[i].bestRate == true && rates[i].disponible == false) {
                  //New add
                  this.aeropuertoIdTariff = rates[i].aeropuertoId
                  this.conVueloIncluidoTariff = rates[i].conVueloIncluido
                  //End add
                  this.rateList.push(rates[i]);
                  if (i + 1 == rates.length) {
                    var final = this.rateList[rates.length - 1];
                    this.rateList[rates.length - 1] = this.rateList[0];
                    this.rateList[0] = final;

                    this.rateListReverse = this.rateList;

                    this.orderByTariff()

                    this.loadingLabels = false;
                  }
                }
              }
              if (rates[i].bestRate == false && rates[i].disponible == true) {
                //New add
                this.aeropuertoIdTariff = rates[i].aeropuertoId
                this.conVueloIncluidoTariff = rates[i].conVueloIncluido
                //End add
                this.existBR = false;
                var priceProgramIdResult = rates[i].priceProgramId;
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

                if (priceProgramIdResult != "") {
                  this.enableProcess = true;

                }

                const sourcesBRIni = [

                  this.adminService.GetCabinasXTarifas(this.BuildIniFilterXTarifasSpefica('Interior', cadenapromos, cadenapackage, rates[i].transactionCode), pagesLoad, pageSize),

                ];

                this.dataSubscription = forkJoin(sourcesBRIni)
                  .subscribe(
                    ([InteriorInfo]: any[]) => {

                      this.InteriorInfo.push(InteriorInfo);
                      const sourcesBR = [

                        //  this.adminService.GetCabinasXTarifas(this.BuildIniFilterBR('Interior', cadenapromos, cadenapackage, rates[i].transactionCode), pagesLoad, pageSize),
                        this.adminService.GetCabinasXTarifas(this.BuildIniFilterXTarifasSpefica('Exterior', cadenapromos, cadenapackage, rates[i].transactionCode), pagesLoad, pageSize),
                        this.adminService.GetCabinasXTarifas(this.BuildIniFilterXTarifasSpefica('Balcon', cadenapromos, cadenapackage, rates[i].transactionCode), pagesLoad, pageSize),
                        this.adminService.GetCabinasXTarifas(this.BuildIniFilterXTarifasSpefica('Suite', cadenapromos, cadenapackage, rates[i].transactionCode), pagesLoad, pageSize)

                      ];
                      this.dataSubscription = forkJoin(sourcesBR)
                        .subscribe(
                          // ([InteriorInfo, ExteriorInfo, BalconInfo, SuiteInfo]: any[]) => {
                          ([ExteriorInfo, BalconInfo, SuiteInfo]: any[]) => {
                            this.rateList.push(rates[i]);

                            this.BalconInfo.push(BalconInfo);
                            this.SuiteInfo.push(SuiteInfo);
                            this.ExteriorInfo.push(ExteriorInfo);
                            if (i + 1 == rates.length) {

                              /*var final = this.rateList[rates.length - 1];
                              this.rateList[rates.length - 1] = this.rateList[0];
                              this.rateList[0] = final;
                              this.rateListReverse = this.rateList;*/

                              if (hayNoDisponible) {
                                var final = this.rateList[rates.length - 1];
                                this.rateList[rates.length - 1] = this.rateList[0];
                                this.rateList[0] = final;

                                this.rateListReverse = this.rateList;
                                this.orderByTariff()
                              } else {
                                this.rateListReverse = this.rateList;
                                this.orderByTariff()

                              }
                              this.CargarLuego();



                              this.loadingLabels = false;
                            }

                          },
                          (error: HttpErrorResponse) => {
                            this.loadingLabels = false;
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

                    },
                    (error: HttpErrorResponse) => {
                      this.loadingLabels = false;
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

                    }, () => {
                      //this.orderBy()
                    });


              } else {
                if (rates[i].bestRate == false && rates[i].disponible == false) {
                  //New add
                  this.aeropuertoIdTariff = rates[i].aeropuertoId
                  this.conVueloIncluidoTariff = rates[i].conVueloIncluido
                  //End add
                  this.rateList.push(rates[i]);
                  if (i + 1 == rates.length) {
                    var final = this.rateList[rates.length - 1];
                    this.rateList[rates.length - 1] = this.rateList[0];
                    this.rateList[0] = final;


                    this.rateListReverse = this.rateList;

                    this.orderByTariff()

                    this.CargarLuego();


                    this.loadingLabels = false;
                  }
                }
              }
            }
          }

          this.userPreferences.setElement("rates", rates);

          var modo = this.userPreferences.getElement('Reservation');
          const sourcesini = [
            this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Interior'), pagesLoad, pageSize),
            this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Exterior'), pagesLoad, pageSize),
            this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Balcon'), pagesLoad, pageSize),
            this.adminService.GetCabinaMasBarataPosition(this.BuildIniFilter('Suite'), pagesLoad, pageSize)
          ];


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

        }
      ),
      () => {
        //this.orderBy()
      };

  }

  TerminaCargar(valor) {    
    this.preciofinal = true;
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
  PassengersNumber() {
    this.router.navigate(['cruisebrowser', 'passengersnumber']);
  }
  CabinChoice() {

    this.userPreferences.setElement("BookingMode", "Reserva");

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ChoiceCabinComponent, { size: 'lg', centered: true });
    this.modalSubscription = from(modalRef.result).subscribe();
  }
  BuildFilterCabinas(metaCategoria: string): any {
    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    var arreglosinloyalty = [];
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
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");
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
      CantPasajeros: this.cantidadPasajeros.toString(),
      ListaPasajeros: arreglosinloyalty,
      CategoriaCabina: this.selectedCabin.categoria,
      TransactionCode: this.selectedCabin.transaction,

      PackageId: this.selectedCabin.packageId,
      PriceProgramId: this.priceprogramid,
      AeropuertoId: this.aeropuertoIdSave,
      Transaction: this.transactionSave,

      TarifaPromoId: this.priceprogramid //Nuevo parametro
    };

    return currentFilter;
  }
  AutomaticDeck() {
    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    var categoria = this.selectedCabin.metacategoria;
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
          var deck = arrayCabinas[0].cabinDeck;
          var cabinsArray = arrayCabinas[0].listCabinas;
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
  ShowPassengerQuote() {
    if (this.reservation.mode == 'Online') {

      this.userPreferences.setElement("CotizarOnline", "true");
      this.userPreferences.setElement("QuotationMode", "CotizacionOnline");

      this.AutomaticDeck();
    } else {
      this.userPreferences.setElement("QuotationMode", "CotizacionOffline");
      //this.router.navigate(['cruisebrowser', 'passengerdata']);
      this.router.navigate(['cruisebrowser', 'passengerdatasummary']);
    }
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
    if (this.itinerary.company == 'MSC') {
      var cabina = selectCabin[0].experiencia;
      if (cabina != null) {
        this.userPreferences.setElement('Experiencia', cabina);

        this.experienciatitle = cabina.titulo;
        this.experienciadescription = cabina.descripion;
        this.experienciaicon = cabina.urlIcon;
      } else {
        this.userPreferences.setElement('Experiencia', null);

      }
    }
    var seleccionada = this.userPreferences.getElement('selectedCabin');
    var reservationseleccionada = this.userPreferences.getElement("Reservation");
    var mostrada = this.userPreferences.getElement('selectedShowCabin');
    if (!!selectCabin[3]) {
      seleccionada = seleccionada == null ? selectCabin[2] : JSON.stringify(seleccionada) === '{}' ? selectCabin[2] : seleccionada;
      mostrada = seleccionada
      reservationseleccionada = seleccionada == null ? selectCabin[1] : JSON.stringify(seleccionada) === '{}' ? selectCabin[1] : reservationseleccionada;
      if (reservationseleccionada.rate == null) { reservationseleccionada.rate = selectCabin[1].rate }
      if (seleccionada.precioCabina.valorPrincipal > selectCabin[2].precioCabina.valorPrincipal) {
        seleccionada = selectCabin[2]
        reservationseleccionada = selectCabin[1]
        mostrada = selectCabin[2]
      }
    }
    else {
      seleccionada = selectCabin[2]
      reservationseleccionada = selectCabin[1]
      mostrada = selectCabin[2]
    }
    seleccionada.cabinNumber = '';
    this.userPreferences.setElement('selectedCabin', seleccionada);
    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    if (this.selectedCabin != undefined || this.selectedCabin != null) {
      this.userPreferences.setElement('priceProgramId', this.selectedCabin.promo);
    }
    this.userPreferences.setElement('Reservation', reservationseleccionada);
    this.reservation = this.userPreferences.getElement("Reservation");
    this.userPreferences.setElement('selectedShowCabin', mostrada);
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.rateTitle = (this.reservation.rate.tarifa) ? this.reservation.rate.tarifa.titulo : this.screenLangInfo.lbl_TipoTarifa;
    this.rateDescription = (this.reservation.rate.tarifa) ? this.reservation.rate.tarifa.descripcion : this.screenLangInfo.lbl_TipoTarifa;
    this.cleanTitleRate = "<strong>" + this.screenLangInfo.lbl_tarifa + ":</strong> " + this.rateTitle;
    var cleanIntermediate = this.cleanTitleRate.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanTitleRate = this.transform(this.cleanTitleRate + "&nbsp;");
    this.rateTitle = this.cleanTitleRate;
    this.cleanDescriptionRate = '<img *ngIf="reservation.rate!=undefined" src="' + this.reservation.rate.tarifa.icon + '" style="max-height: 35px; min-width: 5px;">&nbsp;' + this.rateDescription;
    cleanIntermediate = this.cleanDescriptionRate.toString(); this.cleanDescriptionRate
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanTitleRate = this.transform(this.cleanDescriptionRate);
    this.rateDescription = this.cleanDescriptionRate;
    var modo = this.userPreferences.getElement('Reservation');
    this.userPreferences.setElement('rateList', this.reservation.rate);

    //Add code
    let rates = this.userPreferences.getElement('rates');
    let rateList = this.userPreferences.getElement('rateList');
    const resultado = rates.find(rate => rate.priceProgramId.split("&&")[0] == rateList.priceProgramId);
    this.userPreferences.setElement('rateComplete', resultado);
    //Add end code

    if (this.selectedDateCategoryData) {
      if (modo.mode == 'Offline') {
        this.selectedDateCategoryData = seleccionada.precioCabinaPax;
      } else {
        if (seleccionada != null || seleccionada != undefined) {
          this.selectedDateCategoryData = seleccionada.precioCabina;
        }
      }
      this.preciofinal = true;
    }
    this.activeaddons = seleccionada.addons;
  }

  CargarLuego() {

    setTimeout(function () {



      if (this.InteriorInfo) {
        if (this.InteriorInfo.length > 0) {
          var pivot = this.InteriorInfo[0].data[0][0].precioCabina;
          var pivotPax = this.InteriorInfo[0].data[0][0].precioCabinaPax;
          this.selectedDateCategoryData.precioCabina.valorPrincipalString = pivot.valorPrincipalString;
          this.selectedDateCategoryData.precioCabinaPax.valorPrincipalString = pivotPax.valorPrincipalString;
          this.selectedDateCategoryData.precioCabina.valorLocalString = pivotPax.valorLocalString;
          this.selectedDateCategoryData.precioCabinaPax.valorLocalString = pivotPax.valorLocalString;

        }
      } else

        if (this.ExteriorInfo) {
          if (this.ExteriorInfo.length > 0) {
            var pivot = this.ExteriorInfo[0].data[0][0].precioCabina;
            var pivotPax = this.ExteriorInfo[0].data[0][0].precioCabinaPax;
            this.selectedDateCategoryData.precioCabina.valorPrincipalString = this.ExteriorInfo[0].data[0][0].precioCabina.valorPrincipalString;
            this.selectedDateCategoryData.precioCabinaPax.valorPrincipalString = this.ExteriorInfo[0].data[0][0].precioCabinaPax.valorPrincipalString;
            this.selectedDateCategoryData.precioCabina.valorLocalString = pivotPax.valorLocalString;
            this.selectedDateCategoryData.precioCabinaPax.valorLocalString = pivotPax.valorLocalString;

          }
        } else

          if (this.BalconInfo) {
            if (this.BalconInfo.length > 0) {
              var pivot = this.BalconInfo[0].data[0][0].precioCabina;
              var pivotPax = this.BalconInfo[0].data[0][0].precioCabinaPax;
              this.selectedDateCategoryData.precioCabina.valorPrincipalString = this.BalconInfo[0].data[0][0].precioCabina.valorPrincipalString;
              this.selectedDateCategoryData.precioCabinaPax.valorPrincipalString = this.BalconInfo[0].data[0][0].precioCabinaPax.valorPrincipalString;
              this.selectedDateCategoryData.precioCabina.valorLocalString = pivotPax.valorLocalString;
              this.selectedDateCategoryData.precioCabinaPax.valorLocalString = pivotPax.valorLocalString;

            }
          } else

            if (this.SuiteInfo) {
              if (this.SuiteInfo.length > 0) {
                var pivot = this.SuiteInfo[0].data[0][0].precioCabina;
                var pivotPax = this.SuiteInfo[0].data[0][0].precioCabinaPax;
                this.selectedDateCategoryData.precioCabina.valorPrincipalString = this.SuiteInfo[0].data[0][0].precioCabina.valorPrincipalString;
                this.selectedDateCategoryData.precioCabinaPax.valorPrincipalString = this.SuiteInfo[0].data[0][0].precioCabinaPax.valorPrincipalString;
                this.selectedDateCategoryData.precioCabina.valorLocalString = pivotPax.valorLocalString;
                this.selectedDateCategoryData.precioCabinaPax.valorLocalString = pivotPax.valorLocalString;

              }
            }



    }, 4000);






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
      PackageId: '',
      TarifaPromoId: '',
      PriceProgramId: '',
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
          //this.InitData();
          this.InitDataNew();
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
      Saildate: this.sailDate
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
      this.sailDate = split[0] + '-' + split[1] + '-' + split[2];
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
    this.userPreferences.setElement("rateList", this.rateList);
    this.userPreferences.setElement("filterBR", this.filterBR);
    this.userPreferences.setElement("existBR", this.existBR);
    this.loadingLabels = false;
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
      PriceProgramId: precio.priceProgramId,
      TarifaPromoId: precio.priceProgramId
    };
    return currentFilter;
  }
  BuildIniFilterBR(metaCategoria: string, priceprogramidini: string, packageid: string, transactioncode: string): any {
    var arreglosinloyalty = []
    /*for (var key in this.reservation.pasajeros) {
      arreglosinloyalty.push({
        "edad": String(this.reservation.pasajeros[key].edad),
        "loyaltyNumber": "",
        "codigoPromocional": ""
      })
    }*/
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
      CantPasajeros: this.cantidadPasajeros ? this.cantidadPasajeros.toString() : "2",
      TransactionCode: transactioncode,
      PackageId: packageid,
      TarifaPromoId: priceprogramidini,
      AeropuertoId: this.aeropuertoIdTariff,
      ConVueloIncluido: this.conVueloIncluidoTariff,
      IsNRF: this.selectedDate.esNRF
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
      CantPasajeros: this.cantidadPasajeros ? this.cantidadPasajeros.toString() : "2",
      TransactionCode: transactioncode,
      PackageId: packageid,
      TarifaPromoId: priceprogramidini,
      AeropuertoId: this.aeropuertoIdTariff,
      ConVueloIncluido: this.conVueloIncluidoTariff,
      IsNRF: this.selectedDate.esNRF
    };
    return currentFilter;
  }


  overTooltip() {

  }

  orderByTariff() {

    this.userPreferences.setElement('rateListReverse', this.rateListReverse);
  }
  orderBy(array) {
    this.rateListReverse = array

    let array_one = []
    let array_two = []
    let array_three = []

    for (let entry of this.rateListReverse) {

      if (entry != undefined) {
        if (entry.bestRate == true && entry.disponible == true) {

          array_one.push(entry)
        }
        if (entry.bestRate == false && entry.disponible == true) {
          array_two.push(entry)
        }

        if ((entry.bestRate == false || entry.bestRate == true) && entry.disponible == false) {

          array_three.push(entry)
        }
      }
    }
    const array_four = array_two.concat(array_three);

    this.rateListReverse = array_one.concat(array_four)

    return this.rateListReverse

  }



  InitDataNew() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.loadingLabels = true;
    this.errorLoadingLabels = false;
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
    this.userPreferences.setElement("Reservation", this.reservation);

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
      PackageId: this.selectedDate.packageId.toString(),
      TarifaPromoId: '',
      PriceProgramId: '',
      ConVueloIncluido: this.Vuelo,
      AeropuertoId: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" :  this.reservation.VueloSeleccionado.id,
      ComponentCodeFlight: (this.reservation.VueloSeleccionado == null || this.reservation.VueloSeleccionado == undefined) ? "" : this.reservation.VueloSeleccionado.code,
      IsNRF: this.selectedDate.esNRF
    };
    this.adminService.GetScreenValidationLocale().subscribe(messageValidate => {
      this.messageValidate = messageValidate

      const sources = [
        this.adminService.GetScreenTarifaSelectionLocale(),
        this.adminService.GetBloqueTarifas(currentFilter),
      ];
      this.dataSubscription = forkJoin(sources)
        .subscribe(
          ([screenInfo, rates, messageValidate]: any[]) => {
            //this.messageValidate = messageValidate
            this.screenLangInfo = screenInfo;
            this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
            this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]", this.cantidadPasajeros.toString());

            this.rateList = rates;
            this.rateListReverse = rates;

            this.userPreferences.setElement("rates", rates);
          },
          (error: HttpErrorResponse) => {
            this.loadingLabels = false
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
          }, () => { this.loadingLabels = false });

    })


  }

  EnableProcessFather(event) {
    this.enableProcess = event
  }

}
