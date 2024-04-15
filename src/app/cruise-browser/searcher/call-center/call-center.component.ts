import { Component, EventEmitter, Input, OnDestroy, OnInit, Output,ViewChild,ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, Subscription } from 'rxjs';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { MessageService } from 'src/app/services/message.service';
import { GlobalConstants } from '../../../commons/global-constants';
import { AgenciaService } from 'src/app/services/DataServices/agencia.service';

@Component({
  selector: 'app-call-center',
  templateUrl: './call-center.component.html',
  styleUrls: ['./call-center.component.scss']
})
export class CallCenterComponent implements OnInit {

  @ViewChild('content') con:ElementRef;
  @ViewChild('email') email:ElementRef;
  thecontents={text:'',address:'',nombre:'', telefono:''};
  @Input() public screenInfoCallCenter;

  callCenterErrorGeneral: any = ""

  public getScreenWidth: any;
  public getScreenHeight: any;
  activeAgencia: any;

 constructor(private messageservice: MessageService, private activeModal: NgbActiveModal, private router: Router,
   private userPreferences: UserPreferencesService, private adminService: AdminUsersService,
    private sanitized: DomSanitizer,private agenciaService: AgenciaService) { }
  itinerary: any;
  selectedDate: any;
  reservation: any;
  selectedCategoryRoom: string;
  dataSubscription: Subscription;
  dataSubscriptionOtra: Subscription;
  modalSubscription: Subscription;
  listaCabinasxCubiertas: any;
  listaCabinas: any;
  listaImagenes: any;
  listaPlanos: any;
  loadingLabels:boolean;
  selectedCabin: any = null;
  selectedShowCabin: any = null;
  selectedCabinIndex: number = 0;
  selectedShowCabinIndex: number = 0;
  DateCabinsLoad: { [metaCategoria: string]: any; } = {};
  ShowDateCabins: any[] = [];
  sailDate: string;
  screenLangInfo:any;
  lbl_buttonEnviar: any
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
  direccionrespuesta:any;
  mensaje:any;
  captchavalue:any;
  enableSend:any;
  randomCaptchaString:any;
  terminoscondiciones:any;
  cleanText:any;
  acceptTermConditions:any;
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

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
  }
  
  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.activeAgencia = this.agenciaService.getAgenciabyurl(this.userPreferences.getUrlConexion());

    this.acceptTermConditions = false;
    this.loadingLabels=true;
    this.enableSend = false;
    this.selectedDate = this.userPreferences.getElement('SelectedDate');
    this.cantPasajeros = this.userPreferences.getElement('PaxTotal');
    this.reservation = this.userPreferences.getElement('Reservation');
    this.itinerary = this.userPreferences.getElement("Itinerary");
    
    this.terminoscondiciones = this.activeAgencia.TerminosCondiciones;
    this.traduccionesInit();
    this.screenLangInfo = this.screenInfoCallCenter;
    
      //  this.randomCaptchaString = this.randomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    this.BuildSailDate();
    this.getCaptcha(); 

      /*Nueva traduccion*/
    const sources = [
      this.adminService.GetErrorMessage('0', GlobalConstants.CallCenterErrorGeneral)];
    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([CallCenterErrorGeneral]: any[]) => {

          //Nuevos errores
          this.callCenterErrorGeneral = CallCenterErrorGeneral.value
          //Fin nuevos errores
        },
        (error: HttpErrorResponse) => {
                  
        });
  }

  ChangeTermAndConditions(Event) {
    //alert(Event.currentTarget.checked);
    if (Event.currentTarget.checked == true) {
      this.acceptTermConditions = true;
    } else {
      this.acceptTermConditions = false;
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
  

  traduccionesInit(){

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    const sources = [
      //this.adminService.SendEmailSupport(currentFilter),
      this.adminService.GetScreenCallCenterLocale(),
      // this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas('Exterior'), 1, 5),
      // this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas('Balcon'), 1, 5),
      // this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas('Suite'), 1, 5),
    ];

    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenLangInfo]: any[]) => {
        this.screenLangInfo = screenLangInfo;
         
          //this.activeModal.close();
          this.lbl_buttonEnviar = screenLangInfo.lbl_buttonEnviar

          this.loadingLabels = false;
          if (this.terminoscondiciones) {
            var enlace = this.screenLangInfo.lbl_TerminosConmetarios;
            var enlace_complete = "<a target='_blank' href='" + this.terminoscondiciones + "'>" + this.screenLangInfo.lbl_Terminos + "</a>";
            enlace = enlace + "&nbsp;" + enlace_complete;
            this.screenLangInfo.lbl_TerminosConmetarios = this.showHTML(enlace);
            //this.screenLangInfo. =
          } else {

            var hostComplete = window.location.protocol + "//" + window.location.host  + window.location.pathname;
            var n = hostComplete.lastIndexOf("\/");
            hostComplete = hostComplete.substring(0, n);
            var n1 = hostComplete.lastIndexOf("\/");
            hostComplete = hostComplete.substring(0, n1) + "/assets/error.html";
            var enlace = this.screenLangInfo.lbl_TerminosConmetarios;
            var caminoerror = hostComplete;
       
            var enlace_complete = "<a target='_blank' href='" + caminoerror + "'>" + this.screenLangInfo.lbl_Terminos + "</a>";
            enlace = enlace + "&nbsp;" + enlace_complete;
            this.screenLangInfo.lbl_TerminosConmetarios = this.showHTML(enlace);
            

          }
      
         
        },
        (error: HttpErrorResponse) => {
        });
  }

  reloadCaptcha(){
    this.randomCaptchaString = "";
 //   this.randomCaptchaString = this.randomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    
    this.getCaptcha(); 
    if(this.captchavalue===this.randomCaptchaString.replace(/\s/g, '')){
      if(this.CheckMail() && this.thecontents.text && this.thecontents.nombre && this.thecontents.telefono){
        this.enableSend = true;
      }else{  this.enableSend = false;}
    
    } else {
      this.enableSend = false;
    }

  }

  getCaptcha(){
    this.randomCaptchaString = "";
    const captcha = document.querySelector(".captcha");
    let allCharacters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
                     'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd',
                     'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
                     't', 'u', 'v', 'w', 'x', 'y', 'z', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];


    for (let i = 0; i < 4; i++) { //getting 6 random characters from the array
      let randomCharacter = allCharacters[Math.floor(Math.random() * allCharacters.length)];
      this.randomCaptchaString += ` ${randomCharacter}`; //passing 6 random characters inside captcha innerText
    }
  }


  randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }

  ChangeEmail(valor){

    this.thecontents.address = valor;
    if(this.captchavalue===this.randomCaptchaString.replace(/\s/g, '')){
      if(this.CheckMail() && this.thecontents.text && this.thecontents.nombre && this.thecontents.telefono){
        this.enableSend = true;
      }else{  
        //this.messageservice.generalMessage('error', "Error en email");
        this.enableSend = false;}
    
    } else {
      this.enableSend = false;
    }
  }

  ChangeName(valor){

    this.thecontents.nombre = valor;
    if(this.captchavalue===this.randomCaptchaString.replace(/\s/g, '')){
      if(this.CheckMail() && this.thecontents.text && this.thecontents.nombre && this.thecontents.telefono){
        this.enableSend = true;
      }else{  
       // this.messageservice.generalMessage('error', "Error en nombre");
        this.enableSend = false;}
    
    } else {
      this.enableSend = false;
    }
  }

  ChangeTelef(valor){

    this.thecontents.telefono = valor;
    if(this.captchavalue===this.randomCaptchaString.replace(/\s/g, '')){
      if(this.CheckMail() && this.thecontents.text && this.thecontents.nombre && this.thecontents.telefono){
        this.enableSend = true;
      }else{  
        //this.messageservice.generalMessage('error', "Error en teléfono");
        this.enableSend = false;}
    
    } else {
      
      this.enableSend = false;
    }
  }



  CheckMail(): any {
    var result: boolean = true;
    //var phonere = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{3,4})$/;
    //var phonere =/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    var phonere = /^[\+]?[1234567890\ ]*$/;
    
    if   (!phonere.test(this.thecontents.telefono)){
      //this.messageservice.generalMessage('error', "Error en número de teléfono");
      result =  false;
    }
    
    if((/^[1234567890]*$/.test(this.thecontents.nombre))) {
    //if(!(/^(?! )[A-ZÉéÁáÍíÓóÚúa-z\s]*$/.test(this.thecontents.nombre))) {
      //this.messageservice.generalMessage('error', "Error en nombre y apellidos");
          
      result =  false;
    
    }
    
    if (  this.thecontents.address  != null && this.thecontents.address  != "" && this.thecontents.address .trim() != "") {
        var split: string[] = this.thecontents.address .split("@");
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
        if(result==false){
        //  this.messageservice.generalMessage('error', "Error en correo electrónico");
        }
      }   
    return result;
  }

  ChangeCaptcha(valor){


    if(valor===this.randomCaptchaString.replace(/\s/g, '')){
      if(this.CheckMail() && this.thecontents.text && this.thecontents.nombre && this.thecontents.telefono){
        this.enableSend = true;
      }else{  
        
       // this.messageservice.generalMessage('error', "Rectifique no haya números en nombre, el teléfono esté en formato solicitado y el correo esté correcto");
       this.messageservice.generalMessage('error', this.callCenterErrorGeneral);
        this.enableSend = false;
      
      }
    
    } else {
     // this.messageservice.generalMessage('error', "Error en captcha");
      this.enableSend = false;
    }
    this.captchavalue = valor;

    
  }


  EmailText(data) {

    

    this.con.nativeElement.value=data;
    this.thecontents.text = data;
    if(this.captchavalue===this.randomCaptchaString.replace(/\s/g, '')){
      if(this.CheckMail() && this.thecontents.text && this.thecontents.nombre && this.thecontents.telefono){
        this.enableSend = true;
      }else{  this.enableSend = false;}
    
    } else {
      
      this.enableSend = false;
    }
  
}






  BuildSailDate() {
    if (this.selectedDate.fechaSalida) {
      var split: string[] = this.selectedDate.fechaSalida.substring(0, 10).split('-');
      this.sailDate = split[0] + '-' + split[1] + '-' + split[2];
    }
  }
  close() {
    this.activeModal.close();
  }
 
  BuildFilterCabinas(metaCategoria: string): any {
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
      PriceProgramId: this.priceprogramid
    };
    return currentFilter;
  }

  

  SendEmailSupport(){


    var nnoches = this.itinerary.nnoches;
    var currentFilter = {
      ClientName:this.thecontents.nombre,
      ClientPhone:this.thecontents.telefono,
      EmailMessage: this.thecontents.text,
      ClientEmail: this.thecontents.address,
      ItinerarioCode: this.itinerary.itinerarioCode,
      MonedaMercado: this.itinerary.mercadoMonedaPrincipal,
      Mercado: this.itinerary.mercado,
      Nnoches: nnoches.toString(),
      Company: this.itinerary.company,
      ShipCode: this.itinerary.shipCode,
      PuertoSalidaCode:this.itinerary.departurePortCode,
      Saildate:this.sailDate,
      CantPasajeros:this.cantPasajeros.toString()
   
    }

    const sourcescabins = [
      //this.adminService.SendEmailSupport(currentFilter),
      this.adminService.SendEmailSupport(currentFilter),
      // this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas('Exterior'), 1, 5),
      // this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas('Balcon'), 1, 5),
      // this.adminService.VerCabinasXCategorias(this.BuildFilterCabinas('Suite'), 1, 5),
    ];

    this.dataSubscription = forkJoin(sourcescabins)
      .subscribe(
        ([mailResume]: any[]) => {
          if (mailResume && mailResume.Estate) {
            if (mailResume.Estate == 'Correct') {
              this.messageservice.generalMessage('success', mailResume.NotificationMsg);
              // this.messageService.generalMessage('success', this.initSearch ? this.initSearch : 'Puede realizar nuevas búsquedas de itinerarios.');
            }
            else if (mailResume.Estate == 'Error') {
              this.messageservice.generalMessage('error', mailResume.NotificationMsg);
            }
            else if (mailResume.Estate == 'Warning') {
              this.messageservice.generalMessage('warning', mailResume.NotificationMsg);
            }
            else if (mailResume.Estate == 'In Process') {
              this.messageservice.generalMessage('info', mailResume.NotificationMsg);
            }
          }         
          this.activeModal.close();
        },
        (error: HttpErrorResponse) => {
        });
  }
}
