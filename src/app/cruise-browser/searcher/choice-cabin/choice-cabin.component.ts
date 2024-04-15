import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, Subscription } from 'rxjs';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { Key } from 'protractor';
import { ErrorWindowComponent } from '../error-window/error-window.component';
@Component({
  selector: 'app-choice-cabin',
  templateUrl: './choice-cabin.component.html',
  styleUrls: ['./choice-cabin.component.scss']
})
export class ChoiceCabinComponent implements OnInit {
  constructor(private activeModal: NgbActiveModal, private router: Router, private userPreferences: UserPreferencesService, private adminService: AdminUsersService,  private modalService: NgbModal) { }
  itinerary: any;
  selectedDate: any;
  reservation: any;
  screenInfo: any;
  messageError:any
  selectedCategoryRoom: string;
  dataSubscription: Subscription;
  dataSubscriptionOtra: Subscription;
  modalSubscription: Subscription;
  listaCabinasxCubiertas: any;
  listaCabinas: any;
  listaImagenes: any;
  listaPlanos: any;
  selectedCabin: any = null;
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
  cantPasajeros: any;
  DateIndexPageLoad: { [metaCategoria: string]: any; } = {};
  addonsValues: boolean = false;
  selectedCabinPos: number = 0;
  existFly: boolean = false;
  deckName: any[] = [];
  deckCabinList: any[] = [];
  deckImagenes: any[] = [];
  ratesCome: any[] = [];
  promoid: any;
  lowCabinsPrice: { [metaCategoria: string]: any; } = {};
  priceprogramid: any;
  reservaMode:any

  ngOnInit() {
    this.userPreferences.setElement("backReservationSummary", false);
    this.selectedDate = this.userPreferences.getElement('SelectedDate');
    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    this.itinerary = this.userPreferences.getElement('Itinerary');
    this.reservation = this.userPreferences.getElement('Reservation');
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.priceprogramid = this.userPreferences.getElement('priceProgramId');

    this.reservaMode = this.userPreferences.getElement("BookingMode")
    this.BuildSailDate();

    this.cantPasajeros = this.userPreferences.getElement('PaxTotal');
    this.promoid = this.userPreferences.getElement('priceProgramId');
    this.cargarLocales();
  }
  BuildSailDate() {
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split('-');
      this.sailDate = split[2] + '-' + split[1] + '-' + split[0];
    }
  }
  close() {
    this.activeModal.close();
  }
  ShowReservationSummary() {
    this.userPreferences.setElement("CotizarOnline", "false");
    this.userPreferences.setElement("AutomaticCabin", "true");
    this.AutomaticDeck(this.selectedCabin.metacategoria);
  }
  ShowStateroomChoice() {
    this.userPreferences.setElement("CotizarOnline", "false");
    this.router.navigate(['cruisebrowser', 'stateroomchoice']);
    this.activeModal.close();
  }
  BuildFilterCabinas(metaCategoria: string): any {
    let transactionSave = this.userPreferences.getElement('transactionSave');
    let aeropuertoIdSave = this.userPreferences.getElement('aeropuertoIdSave');

    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    var arreglosinloyalty = []

    /* for (var key in this.reservation.pasajeros) {
       arreglosinloyalty.push({
         "edad": String(this.reservation.pasajeros[key].edad),
         "loyaltyNumber": "",
         "codigoPromocional": ""
       })
     }*/

    //Nueva solucion
    for (let key of this.reservation.pasajeros) {
      arreglosinloyalty.push(key)
    }
    //Fin nueva solucion
    var d = this.sailDate;
    var fechaArreglo = d.split("-");
    var fechaSalida = [fechaArreglo[2], fechaArreglo[1], fechaArreglo[0]].join('-');

    this.sailDate = fechaSalida //Nuevo codigo
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
      Saildate: this.sailDate,
      Metacategoria: this.selectedCabin.metacategoria,
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      //PriceProgramId: this.BuildFilterBR(metaCategoria, precio.priceProgramId),
      CantPasajeros: this.cantPasajeros.toString(),
      ListaPasajeros: arreglosinloyalty,
      CategoriaCabina: this.selectedCabin.categoria,
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      //PriceProgramId:this.BuildFilterBR(metaCategoria, precio.priceProgramId),
      //PriceProgramId:this.selectedCabin.priceProgramId,
      PriceProgramId: this.priceprogramid,
      AeropuertoId: aeropuertoIdSave,
      Transaction: transactionSave,

      TarifaPromoId: this.priceprogramid,//Nuevo campo
      FunctionalBranch: this.reservaMode
    };
    return currentFilter;
  }
  AutomaticDeck(categoria) {
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
          this.selectedCabin.deckCode = deck;
          this.selectedCabin.cabinNumber = cabinsArray[0].cabinNo;
          this.userPreferences.setElement('selectedCabin', this.selectedCabin);
          this.selectedCabin =  this.userPreferences.getElement('selectedCabin')
          if (ListaCabins.length != 0) {
            this.router.navigate(['cruisebrowser', 'passengerdatareservation']);
            this.activeModal.close();
          } else {
            this.activeModal.close();
            var message
            if(this.messageError.err_cabinasNoDisponible != undefined){
              message = this.messageError.err_cabinasNoDisponible
            }
            this.showError(message)
          }

        },
        (error: HttpErrorResponse) => {
        });
  }

  showError(errorValue) {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ErrorWindowComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenError = errorValue;
    this.modalSubscription = from(modalRef.result).subscribe();

  }
  
  cargarLocales() {
    const sourcescabins = [
      this.adminService.GetScreenCabinaSelection(),
      this.adminService.GetScreenValidationLocale()
    ];
    this.dataSubscription = forkJoin(sourcescabins)
      .subscribe(
        ([screenInfo, messageError]: any[]) => {

          this.messageError = messageError
          this.screenInfo = screenInfo;         
        
        },
        (error: HttpErrorResponse) => {
        });
  }
}
