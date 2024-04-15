import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { forkJoin, from, Subscription } from 'rxjs';
import { FiltroBusqueda } from 'src/app/models/FiltroBusqueda.model';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { CachingService } from 'src/app/services/interceptors/caching/caching.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { ErrorWindowComponent } from '../error-window/error-window.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AgenciaService } from 'src/app/services/DataServices/agencia.service';
import { UtilitiesService } from 'src/app/services/UtilsFunc/utilities.service';
import { GoogleAnalyticsService } from 'src/app/services/Analytics/google-analytics.service';

@Component({
  selector: 'app-select-agency',
  templateUrl: './select-agency.component.html',
  styleUrls: ['./select-agency.component.scss']
})
export class SelectAgencyComponent implements OnInit, OnDestroy {
  messageValidate: any
  loadingLabels: boolean;
  errorLoadingLabels: boolean;
  dataSubscription: Subscription;
  queryParamSubscription: Subscription;
  modalSubscription: Subscription;
  items: any;
  selectedMarket: any;
  selectedAgency: any;
  urlId: string = "";
  urlShare: string = "";
  params: ParamMap;
  user: string;
  pass: string;
  searchScreen: string = "searcher";
  currentFilters: FiltroBusqueda;
  priceFilter: any;
  singInParams: any[] = [];
  IdItinerary: any;
  IdDate: any;
  categoryRoom: any;
  sailDate: any;
  orderBy: any;
  page: any;
  constructor(private modalService: NgbModal, private userPreferencesService: UserPreferencesService, private router: Router,
    private adminService: AdminUsersService, private utilities: UtilitiesService, private catchService: CachingService, private activatedRoute: ActivatedRoute, private _googleanalytics: GoogleAnalyticsService, private agenciaService: AgenciaService) { }

  ngOnInit() {
    this.queryParamSubscription = this.activatedRoute.queryParamMap.subscribe(params => {
      this.params = params;
      this.currentFilters =
      {
        destino: [],
        fecha: null,
        puerto: [],
        barco: null,
        companias: [],
        duracion: null,
        orderBy: 3,
        priceFilter: null
      };
      this.priceFilter =
      {
        minPrice: 0,
        maxPrice: 1000000
      }
    });
    if (this.params.keys.length > 0) {
      this.ProcessQueryParams();
    }
    this.ShowSearch();
    this.validationLocale();
  }

  validationLocale() {
    this.adminService.GetScreenValidationLocale().subscribe(next => {
      this.messageValidate = next
    })
  }

  showError(errorValue) {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ErrorWindowComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.screenError = errorValue;
    this.modalSubscription = from(modalRef.result).subscribe();

  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.queryParamSubscription) {
      this.queryParamSubscription.unsubscribe();
    }
  }
  ShowSearch() {
    if (this.urlId && this.urlId != null && this.urlId != '') {
      this.catchService.clearCache();
      this.userPreferencesService.setUrlConexion(this.urlId);
      this.SignIn();
    }
  } 
  SignIn() {
    this.loadingLabels = true;
    this.errorLoadingLabels = false;
    var singFilter =
    {
      urlConexion: this.urlId,
      queryparams: this.singInParams
    };
    const sources = [
      this.adminService.SignIn(singFilter),
      // this.adminService.SignInWidget()
    ];
    this.dataSubscription = forkJoin(sources)
      .subscribe(([response/*, urlShare*/]: any[]) => {
        var UrlcssExternoBuscadorMini = response.find(element=> element.key == "UrlcssExternoBuscadorMini")
        var UrlcssExterno = response.find(element=> element.key == "UrlcssExterno")
        console.log("HOLA MUNDO ", UrlcssExterno)

        var signData = response;
        if (signData != null && signData.length > 0) {          
          var agecnia = this.agenciaService.createAgencia(this.urlId,response);
                this.userPreferencesService.setUserLanguage(agecnia.CultureInfo);
          var ids = this.agenciaService.getAnalyticsIdsArray(agecnia);  
          this._googleanalytics.init(ids); 
          this._googleanalytics.trackPageViews().subscribe();     
          this.InitLocalStorage();
          this.UpdateFilter();       
          this.ProcessScreen();
        }
        this.loadingLabels = false;
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

  InitLocalStorage() {
    this.userPreferencesService.setElement("enews", false);
    this.userPreferencesService.setUrlShareConexion(this.urlId);
    this.userPreferencesService.setElement("SearchFilters", null);
    this.userPreferencesService.setElement("Reservation", null);
    this.userPreferencesService.setElement("AgentesDeViaje", null);
    this.userPreferencesService.setElement("SelectedDate", null);
    this.userPreferencesService.setElement("Itinerary", null);
  }
  ProcessQueryParams() {
    this.params.keys.forEach(key => {
      var values = this.params.getAll(key);
      if (values && values.length > 0) {
        switch (key) {
          case 'destination':
          case 'port':
          case 'company':
            {
              this.ProcessFilters(key, values);
            }
            break;
          case 'date':
            {
              this.currentFilters.fecha = values[0].trim();
            }
            break;
          case 'preMin':
            {
              this.priceFilter.minPrice = values[0].trim();
              this.currentFilters.priceFilter = this.priceFilter;
            }
            break;
          case 'preMax':
            {
              this.priceFilter.maxPrice = values[0].trim();
              this.currentFilters.priceFilter = this.priceFilter;
            }
            break;
          case 'duration':
            {
              this.currentFilters.duracion = values[0].trim();
            }
            break;
          case 'ship':
            {
              this.currentFilters.barco = values[0].trim();
            }
            break;
          case 'url':
          case 'urlConexion':
          case 'urlConnection':
            this.urlId = values[0].trim();
            break;
          case 'MiniSearcherV':
          case 'MiniSearcherH':
          case 'MiniOfferH':
          case 'MiniOfferV':
          case 'MiniOfferB':
          case 'SearcherBanner':
          case 'SelectionRates':
            {
              if (values[0].trim() == 'Y') {
                this.searchScreen = key;
              }
            }
            break;
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
          case 'page':
            {
              if (values[0].trim() != '') {
                this.page = values[0].trim();
              }
            }
            break;
          case 'orderBy':
            {
              if (values[0].trim() != '') {
                this.orderBy = values[0].trim();
              }
            }
            break;
          default:
            {
              var pair: string = key;
              pair += "&&&";
              pair += values[0].trim();
              this.singInParams.push(pair);
            }
            break;
        }
      }
    });
  }
  UpdateFilter() {
    this.userPreferencesService.setElement("SearchFilters", this.currentFilters);
  }
  ProcessFilters(key: string, values: string[]) {
    // Recorrer valores verificando si vienen separados por , o por ||
    values.forEach(element => {
      var split1: string[] = element.split(',');
      var split2: string[] = element.split('||');
      if (split1 && split1.length > 1) {
        split1.forEach(split1element => {
          if (key == 'destination') {
            this.currentFilters.destino.push(split1element.trim());
          }
          else if (key == 'port') {
            this.currentFilters.puerto.push(split1element.trim());
          }
          else if (key == 'company') {
            this.currentFilters.companias.push(split1element.trim());
          }
          'port'
        });
      }
      else if (split2 && split2.length > 1) {
        split2.forEach(split2element => {
          if (key == 'destination') {
            this.currentFilters.destino.push(split2element.trim());
          }
          else if (key == 'port') {
            this.currentFilters.puerto.push(split2element.trim());
          }
          else if (key == 'company') {
            this.currentFilters.companias.push(split2element.trim());
          }
        });
      }
      else {
        if (key == 'destination') {
          this.currentFilters.destino.push(element.trim());
        }
        else if (key == 'port') {
          this.currentFilters.puerto.push(element.trim());
        }
        else if (key == 'company') {
          this.currentFilters.companias.push(element.trim());
        }
      }
    });
  }
  ProcessScreen() {
    if (this.searchScreen == 'MiniSearcherV') {
      this.router.navigate(['cruisebrowser', 'searchermini']);
    }
    else if (this.searchScreen == 'MiniSearcherH') {
      this.router.navigate(['cruisebrowser', 'searchermini']);
    }
    else if (this.searchScreen == 'MiniOfferV') {
      this.router.navigate(['cruisebrowser', 'searcherminioffer']);
    }
    else if (this.searchScreen == 'MiniOfferH') {
      this.router.navigate(['cruisebrowser', 'searcherminioffer']);
    }
    else if (this.searchScreen == 'MiniOfferB') {
      this.router.navigate(['cruisebrowser', 'searcherminioffer']);
    }
    else if (this.searchScreen == 'SearcherBanner') {
      this.router.navigate(['cruisebrowser', 'searcherbanner']);
    }
    else if (this.searchScreen == 'SelectionRates') {
      this.router.navigate(['cruisebrowser', 'selectionrates'], { queryParams: this.BuildRatesQueryParams() });
    }
    else {
      this.router.navigate(['cruisebrowser', 'searcher'], { queryParams: this.BuildQueryParams() });
    }
  }
  BuildQueryParams(): any {
    var result = {
      destination: null, date: null, company: null, port: null, duration: null,
      ship: null, page: null, orderBy: null,priceFilter:null
    };
    if (this.currentFilters.destino != null && this.currentFilters.destino.length > 0) {
      var destino = '';
      for (let index = 0; index < this.currentFilters.destino.length; index++) {
        const element = this.currentFilters.destino[index];
        destino += element.trim();
        if (index != this.currentFilters.destino.length - 1) {
          destino += ',';
        }
      }
      if (destino != '0' && destino != 'null') {
        result.destination = destino;
      }
    }
    if (this.currentFilters.puerto != null && this.currentFilters.puerto.length > 0) {
      var puerto = '';
      for (let index = 0; index < this.currentFilters.puerto.length; index++) {
        const element = this.currentFilters.puerto[index];
        puerto += element.trim();
        if (index != this.currentFilters.puerto.length - 1) {
          puerto += ',';
        }
      }
      if (puerto != '0:0' && puerto != 'null') {
        result.port = puerto;
      }
    }
    if (this.currentFilters.companias != null && this.currentFilters.companias.length > 0) {
      var companias = '';
      for (let index = 0; index < this.currentFilters.companias.length; index++) {
        const element = this.currentFilters.companias[index];
        companias += element.trim();
        if (index != this.currentFilters.companias.length - 1) {
          companias += ',';
        }
      }
      if (companias != '0' && companias != 'null') {
        result.company = companias;
      }
    }
    if (this.currentFilters.fecha != null && this.currentFilters.fecha != '0-0' && this.currentFilters.fecha != 'null') {
      result.date = this.currentFilters.fecha;
    }
    if (this.currentFilters.barco != null && this.currentFilters.barco != '0:0' && this.currentFilters.barco != 'null') {
      result.ship = this.currentFilters.barco;
    }
    if (this.currentFilters.duracion != null && this.currentFilters.duracion != '0' && this.currentFilters.duracion != 'null') {
      result.duration = this.currentFilters.duracion;
    }
    if (this.page != null) {
      result.page = this.page;
    }
    if (this.orderBy != null) {
      result.orderBy = this.orderBy;
      this.currentFilters.orderBy = this.orderBy;
    }
    if (this.priceFilter != null) {
      result.priceFilter = this.priceFilter;
      this.currentFilters.priceFilter = this.priceFilter;
    }   
  }

  BuildRatesQueryParams(): any {
    var result = { IdItinerary: null, IdDate: null, categoryRoom: null, sailDate: null, company: null };
    if (this.IdItinerary != null) {
      result.IdItinerary = this.IdItinerary;
    }
    if (this.IdDate != null) {
      result.IdDate = this.IdDate;
    }
    if (this.categoryRoom != null) {
      result.categoryRoom = this.categoryRoom;
    }
    if (this.sailDate != null) {
      result.sailDate = this.sailDate;
    }
    if (this.currentFilters.companias != null && this.currentFilters.companias.length > 0) {
      var companias = '';
      const element = this.currentFilters.companias[0];
      companias += element.trim();
      result.company = companias;
    }
    return result;
  }
}
