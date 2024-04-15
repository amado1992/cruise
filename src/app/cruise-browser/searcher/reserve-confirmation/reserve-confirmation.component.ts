import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, Subscription } from 'rxjs';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { MessageService } from 'src/app/services/message.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ChoiceCabinComponent } from '../choice-cabin/choice-cabin.component';
import { ShowCabinComponent } from '../show-cabin/show-cabin.component';
import { DomSanitizer } from '@angular/platform-browser';
import { ItineraryinfoComponent } from '../itineraryinfo/itineraryinfo.component';
@Component({
  selector: 'app-reserve-confirmation',
  templateUrl: './reserve-confirmation.component.html',
  styleUrls: ['./reserve-confirmation.component.scss']
})
export class ReserveConfirmationComponent implements OnInit {
  loadingLabels: boolean;
  errorLoadingLabels: boolean;
  dataSubscription: Subscription;
  modalSubscription: Subscription;
  screenLangInfo: any = null;
  itinerary: any;
  selectedDate: any;
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
  initSearch: string;
  selectedCategoryRoom: string = 'Interior';
  priceprogramid: any;
  constructor(private router: Router, private adminService: AdminUsersService, private modalService: NgbModal,
    private messageService: MessageService, private userPreferences: UserPreferencesService, private sanitized: DomSanitizer) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  transformStyle(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  showHTML(value) {
    var cleanIntermediate = value.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanText = cleanIntermediate;
    this.cleanText = this.transform(this.cleanText);
    return this.cleanText;
  }
  ngOnInit() {
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");
    this.priceprogramid = this.userPreferences.getElement('priceProgramId');
    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.InitEmails();
    this.BuildSailDate();
    this.InitData();
  }
  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
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
      Company: this.itinerary.company
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
      //PriceProgramId:  (this.reservation && this.reservation.rate && this.reservation.rate.priceProgramId
      //   && this.reservation.rate.priceProgramId.trim() != '') ? this.reservation.rate.priceProgramId : precio.priceProgramId,
      PriceProgramId: this.priceprogramid,
      CotizacionId: this.reservation.idCotizacion,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0'
    };
    const sources = [
      this.adminService.GetScreenResumenCotizacionLocale(),
      this.adminService.GetImagenBarco(shipFilter),
      this.adminService.GetImagenDesgolse(),
      this.adminService.GetResumenCotizacion(resumeFilter),
      this.adminService.GetErrorMessage('0', 'InfoVolverAEmpezar')
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo, shipUrl, desgUrl, cotResume, initSearch]: any[]) => {
          this.screenLangInfo = screenInfo;
          this.urlShip = shipUrl.value; // Cambio de .Value;
          this.urlDesg = desgUrl.value; // Cambio de .Value;
          this.cotResume = cotResume;
          if(this.itinerary.nnoches == '1'){
            var noche = this.screenLangInfo.lbl_noche;
            this.screenLangInfo.lbl_nochesEnEl = noche;
          
          }
          this.loadingLabels = false;
          this.cleanTitleRate = '<strong>' + this.screenLangInfo.lbl_tarifa + '</strong><img *ngIf="' + this.reservation.rate.icon + '" src=' + this.reservation.rate.icon + ' style="max-height: 35px; min-width: 5px;">' + this.reservation.rate.titulo;
          var cleanIntermediate = this.cleanTitleRate.toString();
          cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
          this.cleanTitleRate = cleanIntermediate;
          this.cleanTitleRate = this.transform(this.cleanTitleRate);
          this.cleanDescriptionRate = this.reservation.rate.descripcion;
          var cleanIntermediate = this.cleanDescriptionRate.toString();
          cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
          this.cleanDescriptionRate = cleanIntermediate;
          this.cleanDescriptionRate = this.transform(this.cleanDescriptionRate);
          //this.cotResume.listaNotasAlPie=['&lt;--Pruebas de diferentes Formatos Ingenius--&gt;<hr /><img alt="" src="http://localhost:5001/Principal/GetImageResource?name=Resources.RCCL.png&amp;size=small" /><img alt="" src="http://localhost:5001/Principal/GetImageResource?name=Resources.RCCL.png&amp;size=small" style="float:left" />Este es la <a href="http://cb-test.ingeniuscuba.com/CruiseBrowserAngular/cruisebrowser/searcher">compa&ntilde;ia </a>usada<br /><br /><span style="color:#FF0000;"><span style="background-color:#000080;">sfsafsfFfFF</span></span><br /> &nbsp;&acute;&acute;* Los precios son par ael crucero &uacute;nicamente. no incluye propinas ni gastos externos al crucero.<br />'];
        },
        (error: HttpErrorResponse) => {
          this.loadingLabels = false;
          this.errorLoadingLabels = true;
        });
  }
  PassengersNumber() {
    this.router.navigate(['cruisebrowser', 'passengersnumber']);
  }
  ShowSelectionRates() {
    this.router.navigate(['cruisebrowser', 'selectionrates']);
  }
  CabinChoice() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ChoiceCabinComponent, { size: 'lg', centered: true });
    this.modalSubscription = from(modalRef.result).subscribe();
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
  BuildSailDate() {
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split("-");
      this.sailDate = split[2] + "-" + split[1] + "-" + split[0];
    }
  }
  ShowSearch() {
    this.router.navigate(['cruisebrowser', 'searcher']);
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
      CantPasajeros: this.reservation.pasajeros ? this.reservation.pasajeros.length.toString() : "2",
      CorreoResumen: this.mail,
      ListaPasajeros: this.reservation.pasajeros,
      TipoSubjectTarget: '0',
      //PriceProgramId:  (this.reservation && this.reservation.rate && this.reservation.rate.priceProgramId
      //  && this.reservation.rate.priceProgramId.trim() != '') ? this.reservation.rate.priceProgramId : precio.priceProgramId,
      PriceProgramId: this.priceprogramid,
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipalString,
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipalString,
      CotizacionId: this.reservation.idCotizacion,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
        IsNRF: this.selectedCabin.esNRF,
        ConVueloIncluido: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? true : false,
        ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
          ENews: enews
    };
    const sources = [
      this.adminService.NotificarCotizacion(mailData)
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([mailResume]: any[]) => {
          if (mailResume && mailResume.Estate) {
            if (mailResume.Estate == 'Correct') {
              this.messageService.generalMessage('success', mailResume.NotificationMsg);
              // this.messageService.generalMessage('success', this.initSearch ? this.initSearch : 'Puede realizar nuevas búsquedas de itinerarios.');
            }
            else if (mailResume.Estate == 'Error') {
              this.messageService.generalMessage('error', mailResume.NotificationMsg);
            }
            else if (mailResume.Estate == 'Warning') {
              this.messageService.generalMessage('warning', mailResume.NotificationMsg);
            }
            else if (mailResume.Estate == 'In Process') {
              this.messageService.generalMessage('info', mailResume.NotificationMsg);
            }
          }
        },
        (error: HttpErrorResponse) => {
        });
  }
  ViewCabin() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ShowCabinComponent, { size: 'sm', centered: true });
    (<ShowCabinComponent>modalRef.componentInstance).screenLangInfo = this.screenLangInfo;
    this.modalSubscription = from(modalRef.result).subscribe();
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
  InitEmails() {
    var result = '';
    if (this.reservation && this.reservation.pasajeros && this.reservation.pasajeros.length > 0) {
      this.reservation.pasajeros.forEach(element => {
        if (element.correo && element.correo != null && element.correo.trim() != '') {
          result += element.correo + ',';
        }
      });
    }
    if (result != '') {
      result = result.substring(0, result.length - 1);
    }
    this.mail = result;
  }
}
