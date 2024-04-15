import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, Subscription } from 'rxjs';
import { Pasajero } from 'src/app/models/Pasajero.model';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { MessageService } from 'src/app/services/message.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ItineraryinfoComponent } from '../itineraryinfo/itineraryinfo.component';
import { ShowCabinComponent } from '../show-cabin/show-cabin.component';
import {DomSanitizer} from '@angular/platform-browser';
import { A11yModule } from '@angular/cdk/a11y';
import { AgenciaService } from 'src/app/services/DataServices/agencia.service';

@Component({
  selector: 'app-tax-food',
  templateUrl: './tax-food.component.html',
  styleUrls: ['./tax-food.component.scss']
})
export class TaxFoodComponent implements OnInit, OnDestroy {

  loadingLabels: boolean;
  errorLoadingLabels: boolean;

  acceptTermConditions:boolean = false;
  dataSubscription: Subscription;

  modalSubscription: Subscription;

  screenLangInfo: any = null;

  screenLangInfoPax: any = null;

  nationalityInfo: any = null;

  itinerary: any;

  selectedDate: any;

  reservation: any;

  selectedCategoryRoom: string;

  selectedCabin: any;

  cotizaronline:any;

  pasajeros: any[] = [];

  sailDate: string;

  cleanTitleRate:any;

  cleanDescriptionRate:any;

  IdCotizacion: string;

  errorObligatorios: string;

  errorFormatoCorreo: string;

  cleanText:any;

  rateTitle: string;
  cantPasajeros:any;
  resumenPasajero:any;
  resumenPasajeroff:any;
  resumenPasajerovf:any;
  resumenPasajerovv:any;
  resumenPasajerofv:any;

  seguro:any;
  propina:any;
  cotResume:any;
  xcabinaxpasajero:any;
  cantidadPasajeros:any;
  terminoscondiciones:any;
  finalprice:any;
  activeAgencia: any;

  constructor(private router: Router, private adminService: AdminUsersService, private messageService: MessageService,
    private userPreferences: UserPreferencesService, private modalService: NgbModal,private sanitized: DomSanitizer,
    private agenciaService: AgenciaService) { }



showHTML(valor){
var cleanIntermediate = valor.toString();
cleanIntermediate = cleanIntermediate.replace("\r\n", "<br/>");      
this.cleanText = cleanIntermediate;
this.cleanText  = this.transform(this.cleanText);
return this.cleanText ;
}


  ngOnInit() {
    this.activeAgencia = this.agenciaService.getAgenciabyurl(this.userPreferences.getUrlConexion());
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.reservation = this.userPreferences.getElement("Reservation");
    this.pasajeros = this.reservation.pasajeros;
    this.cantidadPasajeros = this.userPreferences.getElement("PaxTotal");


    this.cotizaronline = this.userPreferences.getElement("CotizarOnline");
    this.cleanTitleRate =this.reservation.rate.titulo;
    var cleanIntermediate = this.cleanTitleRate.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanTitleRate = cleanIntermediate;
    this.cleanTitleRate = this.transform(this.cleanTitleRate+"&nbsp;" );

    //this.cleanDescriptionRate =this.reservation.rate.descripcion;
    this.cleanDescriptionRate ='<img *ngIf="this.reservation.rate.icon" src="'+this.reservation.rate.icon+'"style="max-height: 35px; min-width: 5px;">'+this.reservation.rate.descripcion;
   
    var cleanIntermediate = this.cleanDescriptionRate.toString();
    cleanIntermediate = cleanIntermediate.replace("\n", "<br />");
    this.cleanDescriptionRate = cleanIntermediate;
    this.cleanDescriptionRate = this.transform(this.cleanDescriptionRate );

    
    

    this.selectedCategoryRoom = this.reservation.idCategoriaHabitacion;
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");

    this.rateTitle = (this.reservation.rate) ? this.reservation.rate.titulo : this.screenLangInfo.lbl_TipoTarifa;
    this.BuildSailDate();
    this.InitData();
  }f


  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
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

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }

    const modalRef = this.modalService.open(ItineraryinfoComponent, { size: 'lg', centered: true });
    (<ItineraryinfoComponent>modalRef.componentInstance).tabItinerary = value;
    this.modalSubscription = from(modalRef.result).subscribe();
  }

  ShowSelectionRates() {
    this.router.navigate(['cruisebrowser', 'selectionrates']);
  }

  ShowSumaryQuotation() {

    if (this.CheckRequiredData()) {
      if (this.CheckMail()) {
        this.SendMail();
      }
      else {
        this.messageService.generalMessage('error', this.errorFormatoCorreo ? this.errorFormatoCorreo : 'El correo no tiene un formato válido.');
      }
    }
    else {
      this.messageService.generalMessage('error', this.errorObligatorios ? this.errorObligatorios : 'Campos obligatorios no especificados.');
    }
  }

  PassengersNumber() {
    this.router.navigate(['cruisebrowser', 'passengersnumber']);
  }

  GetClass(object: any): any
  {
     if (object && object.color && object.color != null)
     {
        if (object.color.toString().indexOf("Gray") >= 0)
        {
          return "";
        }
        else if (object.color.toString().indexOf("Blue") >= 0)
        {
          return "text-primary";
        }
        else if (object.color.toString().indexOf("Red") >= 0)
        {
          return "text-danger";
        }
        else
        {
          return "";
        }
     }
     else
     {
       return "";
     }
   }



  InitData() {

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.loadingLabels = true;
    this.errorLoadingLabels = false;

    var precio = this.BuildPrecios(this.reservation.idCategoriaHabitacion);

    var resumeFilterff =
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
      CategoriaCabina : this.selectedCabin.categoria,
      CantPasajeros:  this.reservation.pasajeros ? this.reservation.pasajeros.length.toString() : "2",
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipal.toString(),
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipal.toString(),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      NoCabina:this.selectedCabin.cabinNumber,
      SeguroIncluido:false,
      ListaPasajeros:this.pasajeros,
      PropinasIncluida:false,

      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      //PriceProgramId:this.BuildFilterBR(metaCategoria, precio.priceProgramId),
      PriceProgramId:this.selectedCabin.priceProgramId,

      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0'
    };


    var resumeFiltervf =
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
      CategoriaCabina : this.selectedCabin.categoria,
      CantPasajeros:  this.reservation.pasajeros ? this.reservation.pasajeros.length.toString() : "2",
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipal.toString(),
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipal.toString(),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      NoCabina:this.selectedCabin.cabinNumber,
      SeguroIncluido:true,
      ListaPasajeros:this.pasajeros,
      PropinasIncluida:false,

      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      //PriceProgramId:this.BuildFilterBR(metaCategoria, precio.priceProgramId),
      PriceProgramId:this.selectedCabin.priceProgramId,

      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0'
    };

    var resumeFiltervv =
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
      CategoriaCabina : this.selectedCabin.categoria,
      CantPasajeros:  this.reservation.pasajeros ? this.reservation.pasajeros.length.toString() : "2",
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipal.toString(),
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipal.toString(),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      NoCabina:this.selectedCabin.cabinNumber,
      SeguroIncluido:true,
      ListaPasajeros:this.pasajeros,
      PropinasIncluida:true,

      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      //PriceProgramId:this.BuildFilterBR(metaCategoria, precio.priceProgramId),
      PriceProgramId:this.selectedCabin.priceProgramId,

      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0'
    };

    var resumeFilterfv =
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
      CategoriaCabina : this.selectedCabin.categoria,
      CantPasajeros:  this.reservation.pasajeros ? this.reservation.pasajeros.length.toString() : "2",
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipal.toString(),
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipal.toString(),
      DestinoCode: this.itinerary.agrupacionZona.toString(),

      NoCabina:this.selectedCabin.cabinNumber,
      SeguroIncluido:false,
      ListaPasajeros:this.pasajeros,
      PropinasIncluida:true,

      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      //PriceProgramId:this.BuildFilterBR(metaCategoria, precio.priceProgramId),
      PriceProgramId:this.selectedCabin.priceProgramId,

      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0'
    };





    const sources = [
      this.adminService.GetScreenPaxDataLocale(),
      //this.adminService.GetListCountry(),
      //this.adminService.GetErrorMessage('0', 'ErrDatosObligIncompletos'),
     //this.adminService.GetErrorMessage('0', 'ErrFormatoEmailIncorrecto'),
      //this.adminService.GetScreenTarifaSelectionLocale(),
      this.adminService.GetScreenPaxSelectionLocale(),
      this.adminService.GetResumenCotizacion(resumeFilterff),
      this.adminService.GetResumenCotizacion(resumeFiltervf),
      this.adminService.GetResumenCotizacion(resumeFiltervv),
      this.adminService.GetResumenCotizacion(resumeFilterfv),

    ];

    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo,screenInfoPax,cotResumenff,cotResumenvf,cotResumenvv,cotResumenfv]: any[]) => {
          this.screenLangInfo = screenInfo;
          this.xcabinaxpasajero = this.screenLangInfo.lbl_PorCabinaXPasajeros;
    this.xcabinaxpasajero = this.xcabinaxpasajero.replace("[noPax]",this.cantidadPasajeros.toString());
 
          this.screenLangInfoPax = screenInfoPax;
          this.resumenPasajero = cotResumenff;
          this.resumenPasajeroff=cotResumenff;
          this.resumenPasajerovf=cotResumenvf;
          this.resumenPasajerovv=cotResumenvv;
          this.resumenPasajerofv=cotResumenfv;
          this.cotResume = this.resumenPasajero;
          this.finalprice = this.cotResume.totalReserva.precio.valorLocalString;
        //  this.nationalityInfo = natInfo;

         // if (errosDatos.value)
        //  {
         //   this.errorObligatorios = errosDatos.value; // Cambio de .Value;
        //  }

        //  if (errorformato.value)
        //  {
        //    this.errorFormatoCorreo = errorformato.value; // Cambio de .Value;
        //  }

         // this.InitPassenger();

          this.loadingLabels = false;
        },
        (error: HttpErrorResponse) => {
          this.loadingLabels = false;
          this.errorLoadingLabels = true;

       });

  }

  InitPassenger() {
    if (!this.reservation) {
      this.reservation = {};
    }

    if (this.reservation.pasajeros) {
      this.pasajeros = this.reservation.pasajeros;
    }
    else {
      for (let index = 0; index < 2; index++) {
        var current_passenger: any = {};
       current_passenger.edad = 0;

        this.pasajeros.push(current_passenger);
      }
    }

    for (let index = 0; index < this.pasajeros.length; index++) {
      var edad = this.pasajeros[index].edad;

      //Esto es q si no contiene titulo es la primera vez en esta pantalla
      //por lo tanto inicializo los pasajeros
      if (!this.pasajeros[index].titulo) {
        this.pasajeros[index] =
        {
          titulo: this.screenLangInfo.comboTitulo[0].id,
          nombre: "",
          apellido: "",
          fechaNacimiento: null,
          tipoDocumento: this.screenLangInfo.comboDocumento[0].id,
          numeroDocumento: "",
          nacionalidad: this.activeAgencia.AgenciaNombrePais && this.activeAgencia.AgenciaNombrePais != null && this.activeAgencia.AgenciaNombrePais != '' ? this.activeAgencia.AgenciaNombrePais : this.nationalityInfo[0].id,
          correo: "",
          edad: edad
        };
      }
    }
  }

  ChangePassData(e: any, campo: string, index: number) {
    if (campo == "Nombres")
      this.pasajeros[index].nombre = e.target.value;
    else if (campo == "Apellidos")
      this.pasajeros[index].apellido = e.target.value;
    else if (campo == "FechaNac")
      this.pasajeros[index].fechaNacimiento = e.target.value;
    else if (campo == "NumDoc")
      this.pasajeros[index].numeroDocumento = e.target.value;
    else if (campo == "Correo")
      this.pasajeros[index].correo = e.target.value;

  }



  ChangeSeguro(value: boolean)
  {
    this.seguro = value;
    this.userPreferences.setElement("SeguroIncluido",this.seguro);
    this.RevisarSeguroPropina(this.seguro,this.propina);
  }

  ChangePropina(value: boolean)
  {
    this.propina= value;
    this.userPreferences.setElement("PropinaIncluida",this.propina);
    this.RevisarSeguroPropina(this.seguro,this.propina);
  }

  ChangeTermAndConditions(Event){

  //alert(Event.currentTarget.checked);
  if(Event.currentTarget.checked==true){

     this.acceptTermConditions = true;
  } else {
    this.acceptTermConditions = false;
  }

  }

  
  RevisarSeguroPropina(seguroE,propinaE){

    if(seguroE==true && propinaE==true){
      this.resumenPasajero = this.resumenPasajerovv;
      this.cotResume = this.resumenPasajero;
      this.finalprice = this.cotResume.totalReserva.precio.valorLocalString;
  }

  if(seguroE==true && propinaE==false){
    this.resumenPasajero = this.resumenPasajerovf;
    this.cotResume = this.resumenPasajero;
    this.finalprice = this.cotResume.totalReserva.precio.valorLocalString;
    

}

if(seguroE==false && propinaE==true){
  this.resumenPasajero = this.resumenPasajerofv;
  this.cotResume = this.resumenPasajero;


}


if(seguroE==false && propinaE==false){
  this.resumenPasajero = this.resumenPasajeroff;
  this.cotResume = this.resumenPasajero;

}

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
      this.pasajeros[index].titulo = this.screenLangInfo.comboTitulo[selectIndex].id;
    else if (campo == "TipoDoc")
      this.pasajeros[index].tipoDocumento = this.screenLangInfo.comboDocumento[selectIndex].id;
    else if (campo == "Nacionalidad")
      this.pasajeros[index].nacionalidad = this.nationalityInfo[selectIndex].descripcion;
  }

  CheckRequiredData(): any {
  /*  var result: boolean = true;

    var pasajero: Pasajero = this.pasajeros[0];

    if (pasajero.nombre == null || pasajero.nombre == "" || pasajero.nombre.trim() == "") {
      result = false;
    }
    else if (pasajero.apellido == null || pasajero.apellido == "" || pasajero.apellido.trim() == "") {
      result = false;
    }
    else if (pasajero.correo == null || pasajero.correo == "" || pasajero.correo.trim() == "") {
      result = false;
    }*/
    return true;
  }

  CheckMail(): any {
    /*var result: boolean = true;

    this.pasajeros.forEach(pasajero => {

      if (pasajero.correo != null && pasajero.correo != "" && pasajero.correo.trim() != "") {
        var split: string[] = pasajero.correo.split("@");

        if (split && split.length != 2) {
          result = false;
        }
        else {
          if (split[0] == null || split[0] == "" || split[0].trim() == "") {
            result = false;
          }
          else if (split[1] == null || split[1] == "" || split[1].trim() == "") {
            result = false;
          }
          else {

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

    });*/
    return true;
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

  BuildFilterCabinas(metaCategoria: string): any {

    var precio = this.BuildPrecios(metaCategoria);


    this.selectedCabin = this.userPreferences.getElement('selectedCabin');
    

    var arreglosinloyalty=[]
    for(var key in this.reservation.pasajeros){
        arreglosinloyalty.push({
          "edad":this.reservation.pasajeros[key].edad,
          "loyaltyNumber":"",
          "codigoPromocional":""
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
      //Saildate: fechaSalida,
      SailDate:this.sailDate,
      Metacategoria: this.BuildMetaCategoria(metaCategoria),
      DestinoCode: this.itinerary.agrupacionZona.toString(),
      //PriceProgramId: this.BuildFilterBR(metaCategoria, precio.priceProgramId),
      CantPasajeros:this.cantPasajeros.toString(),
      ListaPasajeros:arreglosinloyalty,
      CategoriaCabina:this.selectedCabin.categoria,
      TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      //PriceProgramId:this.BuildFilterBR(metaCategoria, precio.priceProgramId),
      PriceProgramId:this.selectedCabin.priceProgramId,


    };
    return currentFilter;
  }

  

  transformStyle(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }

  SendMail() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    var precio = this.BuildPrecios(this.reservation.idCategoriaHabitacion);

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
      CantPasajeros: this.pasajeros ? this.pasajeros.length.toString() : "2",
      CorreoResumen: '',
      ListaPasajeros: this.pasajeros,
      TipoSubjectTarget: '1',


      //PriceProgramId: (this.reservation && this.reservation.rate && this.reservation.rate.priceProgramId
      //   && this.reservation.rate.priceProgramId.trim() != '') ? this.reservation.rate.priceProgramId : precio.priceProgramId,
      //PriceProgramId: (this.reservation && this.reservation.rate && this.reservation.rate.priceProgramId
      //    && this.reservation.rate.priceProgramId.trim() != '') ? this.reservation.rate.priceProgramId : this.selectedCabin.promo,
       
      PrecioCabina: this.selectedCabin.precioCabina.valorPrincipalString,
      PrecioTasasIncluidas: this.selectedCabin.precioTaxes.valorPrincipalString,
      AeropuertoId: (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '')
        ? this.selectedCabin.aeropuertoId : '0',
        ComponentCodeFlight:  (this.selectedCabin.aeropuertoId && this.selectedCabin.aeropuertoId.trim() != '') ? this.selectedCabin.aeropuertoCode : '',
        TransactionCode: this.selectedCabin.transaction,
      PackageId: this.selectedCabin.packageId,
      PriceProgramId:this.selectedCabin.priceProgramId,
      NoCabina:this.selectedCabin.cabinNumber,
      IsNRF:this.selectedCabin.esNRF,
      TooltipsNRF:''

        
    };


    const sources = [
      this.adminService.RegistrarCotizacion(mailData)
    ];

    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([mailResume]: any[]) => {

          if (mailResume && mailResume.value)
          {
            this.IdCotizacion = mailResume.value; // Cambio de .Value
          }

          this.UpdateReservation();

          
          this.router.navigate(['cruisebrowser', 'reservationsummary']);
        },
        (error: HttpErrorResponse) => {
        });

  }

  BuildSailDate() {

    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split("-");

      this.sailDate = split[2] + "-" + split[1] + "-" + split[0];
    }
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

}
