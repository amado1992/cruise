import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, Input, OnDestroy, ViewChild, HostListener } from "@angular/core";
import { NgbActiveModal, NgbCarousel } from "@ng-bootstrap/ng-bootstrap";
import { forkJoin, Subscription } from "rxjs";
import { AdminUsersService } from "src/app/services/admin-users.service";
import { UserPreferencesService } from "src/app/services/user-preferences.service";
import { MouseEvent } from '@agm/core';
@Component({
  selector: "app-itineraryinfo",
  templateUrl: "./itineraryinfo.component.html",
  styleUrls: ["./itineraryinfo.component.scss"],
})
export class ItineraryinfoComponent implements OnInit, OnDestroy {
  public getScreenWidth: any;
  public getScreenHeight: any;
  
  @Input() tabItinerary: boolean = true;
  loadingLabels: boolean;
  errorLoadingLabels: boolean;
  dataSubscription: Subscription;
  barcodataSubscription: Subscription;
  screenLangInfo: any = null;
  showArrow: boolean;
  showScroll: boolean;
  selectedCategoryImages: any[] = [];
  selectedCategoryName: string = "";
  barcosImagesInfo: any = null;
  loadingBarcoInfo: boolean;
  errorLoadingBarcoInfo: boolean;
  itinerary: any;
  selectedDate: any;
  slideInfo: any;
  // google maps zoom level
  zoom: number = 3;
  // initial center position for the map
  lat: number = 0;
  lng: number = 0;
  markers: marker[];
  @ViewChild('myCarousel') myCarousel: NgbCarousel;
  constructor(
    private activeModal: NgbActiveModal,
    private adminService: AdminUsersService,
    private userPreferences: UserPreferencesService,
  ) { }

  @HostListener('window:resize', ['$event'])
onWindowResize() {
  this.getScreenWidth = window.innerWidth;
  this.getScreenHeight = window.innerHeight;
}
  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    // Show arrow to put visible the scroll bar
    if (this.selectedDate.recorrido.length > 6) {
      this.showScroll = true;
    }
    this.BuildMarkers();
    this.InitData();
  }
  //  Show scroll bar function
  /*showScrollBar(){
   this.showScroll = true;
   this.showArrow = false;
 }*/
  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.barcodataSubscription) {
      this.barcodataSubscription.unsubscribe();
    }
  }
  changeItinerary(value: boolean) {
    this.tabItinerary = value;
  }
  close() {
    this.activeModal.close();
  }
  InitData() {
    if (this.itinerary && this.itinerary.mostrarBarco == true) {
      this.InitDataBarco();
    }
    this.InitDataItinerario();
  }
  InitDataItinerario() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.loadingLabels = true;
    this.errorLoadingLabels = false;
    const sources = [
      this.adminService.GetScreenBarcoItinerarioLocale()
    ];
    this.dataSubscription = forkJoin(sources).subscribe(
      ([screenInfo]: any[]) => {
        this.screenLangInfo = screenInfo;
        if(this.itinerary.nnoches == '1' && this.screenLangInfo.lbl_nochesEnEl){
          var noche = this.screenLangInfo.lbl_nochesEnEl;
          this.screenLangInfo.lbl_nochesEnEl = noche.replace('noches','noche');
        
        }
        this.loadingLabels = false;
      },
      (error: HttpErrorResponse) => {
        this.loadingLabels = false;
        this.errorLoadingLabels = true;
      }
    );
  }
  InitDataBarco() {
    if (this.barcodataSubscription) {
      this.barcodataSubscription.unsubscribe();
    }
    this.loadingBarcoInfo = true;
    this.errorLoadingBarcoInfo = false;
    var currentFilters = {
      ShipCode: this.itinerary.shipCode,
      ShipName: this.itinerary.shipName,
      Company: this.itinerary.company,
      Mercado: this.itinerary.mercado,
      ItinerarioCode: this.itinerary.itinerarioCode
    };
    const sources = [
      this.adminService.ImagenesVerBarco(currentFilters),
    ];
    this.barcodataSubscription = forkJoin(sources).subscribe(
      ([barcosImages]: any[]) => {
        this.barcosImagesInfo = barcosImages;
        this.selectedCategoryImages = this.barcosImagesInfo.serviciosList;
        this.slideInfo = this.selectedCategoryImages[0];
        this.selectedCategoryName = "servicios";
        this.loadingBarcoInfo = false;
      },
      (error: HttpErrorResponse) => {
        this.loadingBarcoInfo = false;
        this.errorLoadingBarcoInfo = true;
      }
    );
  }
  ChangeCategory(category: string) {
    this.selectedCategoryName = "servicios";
    switch (category) {
      case "servicios":
        this.selectedCategoryImages = this.barcosImagesInfo.serviciosList;
        break;
      case "restaurantes":
        this.selectedCategoryImages = this.barcosImagesInfo.restaurantesList;
        this.selectedCategoryName = "restaurantes";
        break;
      case "deportes":
        this.selectedCategoryImages = this.barcosImagesInfo.listaDeportes;
        this.selectedCategoryName = "deportes";
        break;
      case "ocio":
        this.selectedCategoryImages = this.barcosImagesInfo.listaOcio;
        this.selectedCategoryName = "ocio";
        break;
      default:
        this.selectedCategoryImages = this.barcosImagesInfo.serviciosList;
        break;
    }
    this.slideInfo = this.selectedCategoryImages[0];
  }
  BuildMarkers() {
    this.markers = [];
    var loadLatLng = true;
    if (this.selectedDate && this.selectedDate.recorrido && this.selectedDate.recorrido.length > 0) {
      var ptsInclude: string[] = [];
      for (let index = 0; index < this.selectedDate.recorrido.length; index++) {
        var element = this.selectedDate.recorrido[index];
        element.diaActividadString = this.BuildDate(element.diaActividad);
        if (element.gpsCoord != null && element.gpsCoord != "") {
          if (ptsInclude.indexOf(element.gpsCoord.toString()) == -1) {
            var split: string[] = element.gpsCoord.split(",");
            if (split != null && split.length == 2) {
              try {
                var currentMarker =
                {
                  lat: +(split[0].substring(1, split[0].length)),
                  lng: +(split[1].substring(0, split[1].length - 1)),
                  label: (index + 1).toString(),
                  info: element.nombre,
                  iconUrl: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|E8B641"
                };
                if (index == 0) {
                  currentMarker.iconUrl = "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|0000FF"
                }
                else if (index == this.selectedDate.recorrido.length - 1) {
                  currentMarker.iconUrl = "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000"
                }
                if (loadLatLng) {
                  this.lat = currentMarker.lat;
                  this.lng = currentMarker.lng;
                  loadLatLng = false;
                }
                this.markers.push(currentMarker);
                ptsInclude.push(element.gpsCoord.toString());
              }
              catch (error) {

              }
            }
          }
        }
      }
    }
  }
  clickedMarker(label: string, index: number) {
  }
  BuildDate(fecha: string): any {
    var result = "";
    if (fecha) {
      var split: string[] = fecha.substring(0, 10).split("-");
      result = split[2] + "-" + split[1] + "-" + split[0];
    }
    return result;
  }
  ChangeSlide($event) {
    if (this.selectedCategoryImages && this.selectedCategoryImages.length > 0) {
      this.slideInfo = this.selectedCategoryImages[+$event.current];
    }
  }
}
// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  label?: string;
  info?: string;
  iconUrl?: string;
}
