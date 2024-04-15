import { Component, OnInit, OnDestroy, HostListener, ElementRef, AfterViewInit, ViewChild, ChangeDetectorRef, AfterContentInit, Renderer2 } from '@angular/core';
import { FiltroBusqueda } from 'src/app/models/FiltroBusqueda.model';
import { Subscription, from, forkJoin, Subject } from 'rxjs';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Filtros } from 'src/app/models/Filtros.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ErrorWindowComponent } from '../error-window/error-window.component'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResizeService, SCREEN_SIZE } from 'src/app/services/resize.service';
import { MatIconRegistry, MatSidenav } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { MediaMatcher } from '@angular/cdk/layout';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { GoogleAnalyticsService } from 'src/app/services/Analytics/google-analytics.service';
@Component({
  selector: 'app-searcher',
  templateUrl: './searcher.component.html',
  styleUrls: ['./searcher.component.scss']
})
export class SearcherComponent implements OnInit, OnDestroy, AfterContentInit {
  posInPage: any = false
  showItinerary: any = true
  messageValidate:any

  propPriceFilter: any;//guarda los precios
  durationChecked: any = ""//New line
  sizeResponsive: SCREEN_SIZE;//Nueva linea
  innerWidth: any
  collapse: boolean = true;
  @ViewChild('snav') sidenav: MatSidenav;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  @ViewChild('menu') menu: ElementRef;
  //openedSubject: Subject<boolean>;
  openedSubject = new Subject<boolean>();
  isMenuOpen = false;

  public getScreenWidth: any;
  public getScreenHeight: any;

  //@ViewChild('sidenav') sidenav: MatSidenav;
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;

  mobileQuery: MediaQueryList;

  fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);

  fillerContent = Array.from({length: 50}, () =>
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);

  private _mobileQueryListener: () => void;
  shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some(h => h.test(window.location.host));


  prefix = 'is-';
  sizes = [
    {
      id: SCREEN_SIZE.XS, name: 'xs',
      css: `d-block d-sm-none`
    },
    {
      id: SCREEN_SIZE.SM, name: 'sm',
      css: `d-none d-sm-block d-md-none`
    },
    {
      id: SCREEN_SIZE.MD, name: 'md',
      css: `d-none d-md-block d-lg-none`
    },
    {
      id: SCREEN_SIZE.LG, name: 'lg',
      css: `d-none d-lg-block d-xl-none`
    },
    {
      id: SCREEN_SIZE.XL, name: 'xl',
      css: `d-none d-xl-block`
    },
  ];

  dropDest: string = "";
  destId: string = null;

  selectionDest: { [row: number]: boolean; };

  dropDate: string = "";
  dateId: string = null;

  dropNav: string = "";
  navId: string = null;

  dropBoat: string = "";
  boatId: string = null;

  dropDays: string = "";
  daysId: string = null;

  checkedNav: any[] = [];

  dropPort: string = "";
  portId: string = null;

  currentFilters: FiltroBusqueda;

  filtersInfo: Filtros;

  loadingData: boolean;
  errorLoadingData: boolean;

  dataSubscription: Subscription;
  modalSubscription: Subscription;

  itinerarySubscription: Subscription;

  screenLangInfo: any = null;
  screenLangInfoBuscarCrucero: any = null;

  itineraryTotalCount: number = 0;
  datesTotalCount: number = 0;

  showAdvSearch: boolean = false;

  loadingLabels: boolean;
  errorLoadingLabels: boolean;

  navHaveChange: boolean = false;

  firstCall: boolean = false;

  page: number = 1;
  itemsPerPage = 5;
  totalPages: number = 1;

  ItineraryList: any[] = [];

  elementIni: number;
  elementFin: number;

  orderBy: string;
  orderByDesc: string;

  loadFilters: boolean = false;

  params: ParamMap;

  queryParamSubscription: Subscription;

  priceFilter: any;

  filterPage: boolean = false;

  flagFilterSide: boolean = false; //Nueva variable

  constructor(private modalService: NgbModal, private userPreferencesService: UserPreferencesService, private adminService: AdminUsersService,
    private userPreferences: UserPreferencesService, private activatedRoute: ActivatedRoute, private resizeSvc: ResizeService, private elementRef: ElementRef
    ,iconRegistry: MatIconRegistry, sanitizer: DomSanitizer,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private renderer: Renderer2, private cdRef : ChangeDetectorRef,
    private _analytics: GoogleAnalyticsService) {
     this.resizeSvc.onResize$.subscribe(x => {
       this.sizeResponsive = x;
     });
     this.mobileQuery = media.matchMedia('(max-width: 768px)');
     //this.mobileQuery = media.matchMedia('(max-width: 600px)');
     this._mobileQueryListener = () => changeDetectorRef.detectChanges();
     this.mobileQuery.addListener(this._mobileQueryListener);

     iconRegistry.addSvgIcon(
      'thumbs-up',
      sanitizer.bypassSecurityTrustResourceUrl('assets/images/menu.svg'));

       /**
     * This events get called by all clicks on the page
     */
    //this.renderer.listen('window', 'click',(e:Event)=>{
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */

      /* if(e.target != this.toggleButton.nativeElement && e.target != this.menu.nativeElement){
       this.isMenuOpen=false;
      this.openedSubject.next(false);
    }
     /*if(e.target != this.toggleButton.nativeElement){
      this.openedSubject.next(false);
     }*/
 //});
  }
  /*@HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }*/
  /*@HostListener('window:resize', ['$event'])
onResize(event) {
 this.innerWidth = window.innerWidth;
}*/
@HostListener('window:resize', ['$event'])
onWindowResize() {
  this.getScreenWidth = window.innerWidth;
  this.getScreenHeight = window.innerHeight;
}

  /*ngAfterViewInit() {
    //this.detectScreenSize();
  }*/
  ngAfterContentInit() {

    this.openedSubject.subscribe(
      keepOpen => this.sidenav[keepOpen ? 'open' : 'close']()
    );
  }

  /*private detectScreenSize() {
    const currentSize = this.sizes.find(x => {
      const el = this.elementRef.nativeElement.querySelector(`.${this.prefix}${x.id}`);
      const isVisible = window.getComputedStyle(el).display != 'none';

      return isVisible;
    });

    this.resizeSvc.onResize(currentSize.id);
  }*/

  showError(errorValue) {

    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
    const modalRef = this.modalService.open(ErrorWindowComponent, { size: 'lg', centered: true });
    //modalRef.componentInstance.screenInfoCallCenter = this.screenInfoCallCenter;
    modalRef.componentInstance.screenError = errorValue;
    this.modalSubscription = from(modalRef.result).subscribe();

  }

  ngOnInit() {
    this.userPreferences.setElement("backReservationSummary", false);

    this.userPreferences.setElement("SeguroIncluido", false)
    this.userPreferences.setElement("PropinaIncluida", false)

    let aeropuertoId = this.userPreferences.getElement("AeropuertoId");
    if (aeropuertoId != null || aeropuertoId != ""){
      localStorage.removeItem("AeropuertoId")
    }

    let paxTotal = this.userPreferences.getElement("PaxTotal")
    if (paxTotal  != null || paxTotal != ""){
      localStorage.removeItem("PaxTotal")
    }

    this.getScreenWidth = window.innerWidth;
      this.getScreenHeight = window.innerHeight;


    this.userPreferences.setElement("Reservation", {});
    this.userPreferences.setElement("AgentesDeViaje", {});
    this.userPreferences.setElement("rateList", {});
    this.userPreferences.setElement("selectedCabin", {});
    this.userPreferences.setElement("rates", "");
    this.userPreferences.setElement("priceProgramId", "");
    this.userPreferences.setElement("selectedShowCabin", {});
    //New line
    let maxPrice = localStorage.getItem("maxPrice")
    if (maxPrice) {
      localStorage.removeItem("maxPrice")
    }
    //New line
    this.itemsPerPage = this.userPreferences.getItemsPerPage();

    this.orderBy = '0';

    this.queryParamSubscription = this.activatedRoute.queryParamMap.subscribe(params => {
      this.params = params;
    });

    if (this.params.keys.length > 0) {

      this.currentFilters =
      {
        destino: [],
        fecha: null,
        puerto: [],
        barco: null,
        companias: [],
        duracion: null,
        orderBy: 3,
        //priceFilter: null
        //New line
        priceFilter:
        {
          minPrice: 1,
          maxPrice: 100000
        }
        //New line
      };

      /* this.priceFilter =
       {
         minPrice: 0,
         maxPrice: 1000000
       }*/
      //New line
      this.priceFilter =
      {
        minPrice: 1,
        maxPrice: 100000
      }
      //New line
      this.ProcessQueryParams();

    }
    else {
      this.currentFilters = this.userPreferences.getElement("SearchFilters");
      //New line
      this.currentFilters.priceFilter =
      {
        minPrice: 1,
        maxPrice: 100000
      }
      //New line
    }

    if (this.currentFilters)
      this.loadFilters = true;

    this.elementIni = 1;
    this.elementFin = this.itemsPerPage;

    this.firstCall = true;

    this.InitData();
    this.initSelectionStatus();
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    if (this.itinerarySubscription) {
      this.itinerarySubscription.unsubscribe();
    }

    if (this.queryParamSubscription) {
      this.queryParamSubscription.unsubscribe();
    }

  }

  changeDest(value: any) {

    if (value.id != this.destId) {
      this.dropDest = value.descripcion;
      this.destId = value.id;

      this.BuildCurrentFilter();
    }
  }

  changeDate(value: any) {

    if (value.id != this.dateId) {
      this.dropDate = value.descripcion;
      this.dateId = value.id;

      this.BuildCurrentFilter();
    }
  }

  changePort(value: any) {

    if (value.id != this.portId) {
      this.dropPort = value.descripcion;
      this.portId = value.id;

      this.BuildCurrentFilter();
    }
  }

  changeBoat(value: any) {

    if (value.id != this.boatId) {
      this.dropBoat = value.descripcion;
      this.boatId = value.id;

      this.BuildCurrentFilter();
    }
  }

  changeDays(value: any) {

    if (value.id != this.daysId) {
      this.dropDays = value.descripcion;
      this.daysId = value.id;

      this.BuildCurrentFilter();
    }
  }

  InitData() {

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.loadingLabels = true;
    this.errorLoadingLabels = false;

    const sources = [
      this.adminService.GetScreenSearchLocale(),
      this.adminService.GetScreenPaxDataLocale(),
      this.adminService.GetScreenValidationLocale()
    ];

    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo, screenInfoPax, messageValidate]: any[]) => {
          this.screenLangInfo = screenInfo;
          this.loadingLabels = false;
          this.messageValidate = messageValidate
          this.screenLangInfoBuscarCrucero = screenInfo.lbl_BuscarCrucero

          if (!this.currentFilters) {
            this.currentFilters =
            {
              destino: null,
              fecha: null,
              puerto: [],
              barco: null,
              companias: [],
              duracion: null,
              orderBy: +this.orderBy,
              // priceFilter: null
              //New line
              priceFilter:
              {
                minPrice: 1,
                maxPrice: 100000
              }
              //New line
            };
          }
          else {
            if(this.isEmptyFilter(this.currentFilters)){      
              this.currentFilters.destino = null;
            }
            if (this.currentFilters.orderBy)
              this.orderBy = this.currentFilters.orderBy.toString();
            
          }
          this.loadCombosFilter(false);
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
  private isEmptyFilter(currentFilters: any) {
     return this.currentFilters.fecha == null 
     && this.currentFilters.barco == null
     && this.currentFilters.duracion == null
  }
  private loadCombosFilter(searchData: boolean) {

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.loadingData = true;
    this.errorLoadingData = false;

    var sources = [];

    if (searchData) {
      sources = [
        this.adminService.ItineraryCount(this.currentFilters)
      ];

      this.dataSubscription = forkJoin(sources)
        .subscribe(
          ([totalCount]: any[]) => {
            this.datesTotalCount = totalCount;

            if (this.ItineraryList) {
              this.SearchItinerary(true);
            }
           // this._analytics.trackEvent({eventName:"Search_Action", eventCategory:"Search_Action", eventAction:"GET", eventLabel :"Search_Action", eventValue :"OK"});     
            this.loadingData = false;
          },
          (error: HttpErrorResponse) => {            
            this.loadingData = false;
            this.errorLoadingData = true;

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
    else {
      sources = [
        this.adminService.getFiltersCombos(this.currentFilters),
        this.adminService.ItineraryCount(this.currentFilters)
      ];

      this.dataSubscription = forkJoin(sources)
        .subscribe(
          ([filtros, totalCount]: any[]) => {
            this.filtersInfo = filtros;
            this.datesTotalCount = totalCount;
            this.buildCheckNewNav(this.filtersInfo.companias);

            if (this.firstCall == true) {


              if (this.loadFilters) {
                this.LoadCombosValues();

                this.SearchItinerary(true);
              }
              else {
                this.FirstCombosValues();
              }

              this.firstCall = false;
            }
            else if (this.ItineraryList) {
              this.SearchItinerary(true);
            }
            //this._analytics.trackEvent({eventName:"Search_Action", eventCategory:"Search_Action", eventAction:"GET", eventLabel :"Search_Action", eventValue :"OK"});     
 
            this.loadingData = false;
          },
          (error: HttpErrorResponse) => {
            this.loadingData = false;
            this.errorLoadingData = true;

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

  onSelect(index) {
    var value = this.selectionDest[index];
    this.initSelectionStatus();
    if (value)
      this.selectionDest[index] = false;
    else
      this.selectionDest[index] = true;
  }

  private initSelectionStatus() {
    this.selectionDest = {};
  }

  disabled(): boolean {
    return this.loadingData || this.errorLoadingData;
  }

  onCheckNav(e: any, compañia: any) {

    this.navHaveChange = true;

    if (e.target.checked == true) {
      if (compañia.id == "0") {
        this.checkedNav = [];
      }
      //Si contiene todos lo quito y pongo el nuevo
      if (this.checkedNav.findIndex(current_element => current_element.id == "0") >= 0) {
        this.checkedNav = [];
      }

      this.checkedNav.push({ id: compañia.id, descripcion: compañia.descripcion });

      this.dropNav = compañia.descripcion;
      this.navId = compañia.id;
    }
    else {
      if (compañia.id == "0") {
        this.checkedNav = [];
      }
      this.checkedNav.splice(this.checkedNav.findIndex(current_element => current_element.id == compañia.id), 1);
      if (this.checkedNav.length > 0) {
        //poner como valor la ultima compañia insertada
        this.dropNav = this.checkedNav[0].descripcion;
        this.navId = this.checkedNav[0].id;
      }
      else {
        //poner valor por defecto en el combo de navieras cuando no esta ninguna seleccionada
        if (this.filtersInfo.companias.length > 0) {
          this.dropNav = this.filtersInfo.companias[0].descripcion;
          this.navId = this.filtersInfo.companias[0].id;

          this.checkedNav.push({ id: this.navId, descripcion: this.dropNav });
        }
      }
    }
  }

  isCheckNav(compañia: any) {

    if (this.checkedNav) {
      return this.checkedNav.findIndex(current_element => current_element.id == compañia.id) >= 0;
    }
    else {
      return false;
    }
  }

  buildCheckNewNav(compañias: any[]) {
    if (compañias.length > 0) {
      var checkedNavNew: any[] = [];
      compañias.forEach(newNav => {
        if (this.isCheckNav(newNav)) {
          checkedNavNew.push({ id: newNav.id, descripcion: newNav.descripcion });
        }
      });
      this.checkedNav = checkedNavNew;
    }
    else {
      this.checkedNav = [];
    }
  }

  changeAdvanceSearch() {
    this.showAdvSearch = !this.showAdvSearch;
  }

  BuildCurrentFilter() {
    this.flagFilterSide = false;//Nueva variable

    let priceFilterChild = this.currentFilters.priceFilter//agregar esto para validar
    this.currentFilters =
    {
      destino: [this.destId],
      fecha: this.dateId,
      puerto: [this.portId],
      barco: this.boatId,
      companias: this.buildCheckNav(),
      duracion: this.daysId,
      orderBy: +this.orderBy,
      // priceFilter: null
      //New line
      /* priceFilter: priceFilterChild == null ?
       {
         minPrice: 1,
         maxPrice: 100000
       }
       : priceFilterChild*/
      //End new line

      //New line
      priceFilter:
      {
        minPrice: 1,
        maxPrice: 100000
      }
      //End new line
    };

    //News lines
    this.propPriceFilter = this.currentFilters.priceFilter
    localStorage.setItem('maxPrice', "100000")
    this.durationChecked = this.currentFilters.duracion
    //News lines

    this.loadCombosFilter(false);
  }

  buildCheckNav() {
    var result: string[] = [];

    if (this.checkedNav && this.checkedNav.length > 0) {
      this.checkedNav.forEach(nav => {
        result.push(nav.id);
      });
    }

    return result;
  }

  clickOutsideMenu() {
    if (this.navHaveChange) {
      this.BuildCurrentFilter();
      this.navHaveChange = false;
    }
  }

  FirstCombosValues() {

    if (this.filtersInfo) {
      if (this.filtersInfo.destinos.length > 0) {
        this.dropDest = this.filtersInfo.destinos[0].descripcion;
        this.destId = this.filtersInfo.destinos[0].id;
      }

      if (this.filtersInfo.fechas.length > 0) {
        this.dropDate = this.filtersInfo.fechas[0].descripcion;
        this.dateId = this.filtersInfo.fechas[0].id;
      }

      if (this.filtersInfo.companias.length > 0) {
        this.dropNav = this.filtersInfo.companias[0].descripcion;
        this.navId = this.filtersInfo.companias[0].id;

        this.checkedNav = [];

        this.checkedNav.push({ id: this.navId, descripcion: this.dropNav });
      }

      if (this.filtersInfo.barcos.length > 0) {
        this.dropBoat = this.filtersInfo.barcos[0].descripcion;
        this.boatId = this.filtersInfo.barcos[0].id;
      }

      if (this.filtersInfo.duraciones.length > 0) {
        this.dropDays = this.filtersInfo.duraciones[0].descripcion;
        this.daysId = this.filtersInfo.duraciones[0].id;
      }

      if (this.filtersInfo.puertos.length > 0) {
        this.dropPort = this.filtersInfo.puertos[0].descripcion;
        this.portId = this.filtersInfo.puertos[0].id;
      }

      if (this.filtersInfo.orderBy.length > 0) {
        this.orderBy = this.filtersInfo.orderBy[0].id;
        this.orderByDesc = this.filtersInfo.orderBy[0].descripcion;

      }
    }
  }

  ResetCombos() {

    if (this.filtersInfo) {
      if (this.filtersInfo.destinos.length > 0) {
        this.dropDest = this.filtersInfo.destinos[0].descripcion;
        this.destId = this.filtersInfo.destinos[0].id;
      }

      if (this.filtersInfo.fechas.length > 0) {
        this.dropDate = this.filtersInfo.fechas[0].descripcion;
        this.dateId = this.filtersInfo.fechas[0].id;
      }

      if (this.filtersInfo.companias.length > 0) {
        this.dropNav = this.filtersInfo.companias[0].descripcion;
        this.navId = this.filtersInfo.companias[0].id;

        this.checkedNav = [];

        this.checkedNav.push({ id: this.navId, descripcion: this.dropNav });
      }

      if (this.filtersInfo.barcos.length > 0) {
        this.dropBoat = this.filtersInfo.barcos[0].descripcion;
        this.boatId = this.filtersInfo.barcos[0].id;
      }

      if (this.filtersInfo.duraciones.length > 0) {
        this.dropDays = this.filtersInfo.duraciones[0].descripcion;
        this.daysId = this.filtersInfo.duraciones[0].id;
      }

      if (this.filtersInfo.puertos.length > 0) {
        this.dropPort = this.filtersInfo.puertos[0].descripcion;
        this.portId = this.filtersInfo.puertos[0].id;
      }

      this.BuildCurrentFilter();
    }
  }

  SearchItinerary(resetPage: boolean) {

    //News lines
    /*this.currentFilters.priceFilter =
          {
            minPrice: 1,
            maxPrice: 100000
          }
    this.propPriceFilter = this.currentFilters.priceFilter
    localStorage.setItem("maxPrice", "100000")*/
    //End new lines

    if (this.filterPage) // si viene la pagina en el queryparam comienzo con esa pagina inicialmente
    {
      this.filterPage = false;
    }
    else {
      if (resetPage) {
        this.page = 1;
      }
    }

    if (this.itinerarySubscription) {
      this.itinerarySubscription.unsubscribe();
    }

    this.loadingData = true;
    this.errorLoadingData = false;

    const sources = [
      this.adminService.GetListItinerario(this.currentFilters, this.page, this.itemsPerPage)
    ]


    this.itinerarySubscription = forkJoin(sources)
      .subscribe(
        ([itinerarios]: any[]) => {
          this.ItineraryList = itinerarios.data;
          this.totalPages = itinerarios.totalPages;
          this.itineraryTotalCount = itinerarios.totalRecords;

          this.elementIni = this.itemsPerPage * (this.page - 1) + 1;
          this.elementFin = this.itemsPerPage * (this.page);

          if (this.elementFin > this.itineraryTotalCount)
            this.elementFin = this.itineraryTotalCount;

          if (!this.flagFilterSide) {
            this.UpdateFilter();
          }

          window.scroll(0, 0);

          this.loadingData = false;
        },
        (error: HttpErrorResponse) => {
          this.loadingData = false;

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

  PageChange() {
    this.SearchItinerary(false);
  }

  ChangeOrderOption(order) {

    this.orderBy = order.id;
    this.orderByDesc = order.descripcion;

    this.currentFilters.orderBy = +this.orderBy;

    if (this.itineraryTotalCount > 0)
      this.SearchItinerary(true);
  }

  ChangefiltersData(filter) {
    this.flagFilterSide = true;

    this.currentFilters.destino = filter.destino;
    this.currentFilters.companias = filter.companias;
    this.currentFilters.puerto = filter.puerto;
    this.currentFilters.duracion = filter.duracion;
    this.currentFilters.companias = filter.companias;
    this.currentFilters.priceFilter = filter.priceFilter;

    //News lines
    /*this.currentFilters.priceFilter =
        {
          minPrice: 1,
          maxPrice: 100000
        }*/
    this.propPriceFilter = this.currentFilters.priceFilter;//guardar precios para enviar al hijo
    this.durationChecked = this.currentFilters.duracion
    //this.durationChecked = filter.duracion
    //this.currentFilters.duracion = null

    //End news lines
    this.loadCombosFilter(true);

  }

  UpdateFilter() {

    this.userPreferences.setElement("SearchFilters", this.currentFilters);
  }

  LoadCombosValues() {

    if (this.filtersInfo) {
      if (this.filtersInfo.destinos.length > 0) {
        if (this.currentFilters.destino && this.currentFilters.destino.length > 0) {
          var found: boolean = false;

          var idDestion = this.currentFilters.destino[0];
          for (let index = 0; index < this.filtersInfo.destinos.length; index++) {
            var destino = this.filtersInfo.destinos[index];

            if (destino.hijos && destino.hijos.length > 0) {
              for (let indexHijo = 0; indexHijo < destino.hijos.length; indexHijo++) {
                var hijo = destino.hijos[indexHijo];
                if (hijo.id == idDestion) {
                  this.dropDest = hijo.descripcion;
                  this.destId = hijo.id;
                  found = true;
                  break;
                }
              }
            }
            else {
              if (destino.id == idDestion) {
                this.dropDest = destino.descripcion;
                this.destId = destino.id;
                found = true;
              }
            }

            if (found) {
              break;
            }
          }
        }
        else {
          if (this.filtersInfo.destinos[0].hijos && this.filtersInfo.destinos[0].hijos.length > 0) {
            this.dropDest = this.filtersInfo.destinos[0].hijos[0].descripcion;
            this.destId = this.filtersInfo.destinos[0].hijos[0].id;
          }
          else {
            this.dropDest = this.filtersInfo.destinos[0].descripcion;
            this.destId = this.filtersInfo.destinos[0].id;
          }
        }
      }

      if (this.filtersInfo.fechas.length > 0) {
        if (this.currentFilters.fecha && this.filtersInfo.fechas.length > 1 ) {
          for (let index = 0; index < this.filtersInfo.fechas.length; index++) {
            var fecha = this.filtersInfo.fechas[index];
            if (fecha.id == this.currentFilters.fecha) {
              this.dropDate = fecha.descripcion;
              this.dateId = fecha.id;              
              break;
            }
          }
        }        
        else {
          this.dropDate = this.filtersInfo.fechas[0].descripcion;
          this.dateId = this.filtersInfo.fechas[0].id;
        }
      }

      if (this.filtersInfo.companias.length > 0) {
        this.checkedNav = [];
        if (this.currentFilters.companias && this.currentFilters.companias.length > 0 && this.filtersInfo.companias.length > 1) {
          for (let indexFilter = 0; indexFilter < this.currentFilters.companias.length; indexFilter++) {
            var idCompania = this.currentFilters.companias[indexFilter];
            for (let index = 0; index < this.filtersInfo.companias.length; index++) {
              var compania = this.filtersInfo.companias[index];
              if (compania.id == idCompania) {
                this.dropNav = compania.descripcion;
                this.navId = compania.id;
                this.checkedNav.push({ id: this.navId, descripcion: this.dropNav });

                break;
              }
            }
          }
        }
        else {
          this.dropNav = this.filtersInfo.companias[0].descripcion;
          this.navId = this.filtersInfo.companias[0].id;

          this.checkedNav.push({ id: this.navId, descripcion: this.dropNav });
        }
      }

      if (this.filtersInfo.barcos.length > 0) {

        if (this.currentFilters.barco  && this.filtersInfo.barcos.length > 1) {
          for (let index = 0; index < this.filtersInfo.barcos.length; index++) {
            var barco = this.filtersInfo.barcos[index];
            if (barco.id == this.currentFilters.barco) {
              this.dropBoat = barco.descripcion;
              this.boatId = barco.id;
              break;
            }
          }
        }
        else {
          this.dropBoat = this.filtersInfo.barcos[0].descripcion;
          this.boatId = this.filtersInfo.barcos[0].id;
        }
      }

      if (this.filtersInfo.duraciones.length > 0) {

        if (this.currentFilters.duracion && this.filtersInfo.duraciones.length > 1) {
          for (let index = 0; index < this.filtersInfo.duraciones.length; index++) {
            var duracion = this.filtersInfo.duraciones[index];
            if (duracion.id == this.currentFilters.duracion) {
              this.dropDays = duracion.descripcion;
              this.daysId = duracion.id;
              break;
            }
          }
        }
        else {
          this.dropDays = this.filtersInfo.duraciones[0].descripcion;
          this.daysId = this.filtersInfo.duraciones[0].id;
        }
      }

      if (this.filtersInfo.puertos.length > 0) {
        if (this.currentFilters.puerto && this.currentFilters.puerto.length > 0  && this.filtersInfo.puertos.length > 1) {
          var idPuerto = this.currentFilters.puerto[0];
          for (let index = 0; index < this.filtersInfo.puertos.length; index++) {
            var puerto = this.filtersInfo.puertos[index];
            if (idPuerto.indexOf(puerto.id) >= 0) {
              this.dropPort = puerto.descripcion;
              this.portId = puerto.id;
              break;
            }
          }
        }
        else {
          this.dropPort = this.filtersInfo.puertos[0].descripcion;
          this.portId = this.filtersInfo.puertos[0].id;
        }
      }

      if (this.filtersInfo.orderBy.length > 0) {

        if (this.currentFilters.orderBy) {
          this.orderBy = this.currentFilters.orderBy.toString();
          this.filtersInfo.orderBy.forEach(element => {
            if (element.id == this.currentFilters.orderBy) {
              this.orderByDesc = element.descripcion;
            }
          });
        }
        else {
          this.orderBy = this.filtersInfo.orderBy[0].id;
          this.orderByDesc = this.filtersInfo.orderBy[0].descripcion;
        }
      }
    }
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
              this.priceFilter.minPrice = +values[0].trim();
              this.currentFilters.priceFilter = this.priceFilter;
            }
            break;
          case 'preMax':
            {
              this.priceFilter.maxPrice = +values[0].trim();
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
          case 'page':
            {
              if (values[0].trim() != '') {
                this.page = +values[0].trim();
                this.filterPage = true;
              }
            }
            break;
          case 'orderBy':
            {
              if (values[0].trim() != '') {
                this.orderBy = values[0].trim();
                this.currentFilters.orderBy = +this.orderBy;
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

  SearchItineraryCopy(flag: boolean) {
    this.flagFilterSide = false;//Nueva variable
    this.propPriceFilter = {
      minPrice: 1,
      maxPrice: 100000
    }
    localStorage.setItem('maxPrice', "100000")
    this.currentFilters.priceFilter = this.propPriceFilter
    this.currentFilters.duracion = this.daysId
    this.SearchItinerary(flag);

    this.durationChecked = this.currentFilters.duracion

  }

  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  clickOutsideMenuMobil() {

  }
  toggleMenu(): void {
    //event.stopPropagation();
   // this.collapse = !this.collapse;
   this.openedSubject.next(!this.sidenav.opened);
   //this.collapse = false

  }

  validateLoadItineraryDates(itinerary): boolean {
    let existPost = true
    let currentPage = itinerary.paginationCenterElemt.pageNumber
    let pageSize = 5
        var currentFilter =
        {
          PackageId: '',
          TarifaPromoId: '',
          PriceProgramId: '',
          ItinerarioCode: itinerary.itinerarioCode,
          MonedaMercado: itinerary.mercadoMonedaPrincipal,
          Mercado: itinerary.mercado,
          Company: itinerary.company,
          ShipCode: itinerary.shipCode,
          Nnoches: itinerary.nnoches.toString(),
          PuertoSalidaCode: itinerary.departurePortCode,
          FechaDesde: (itinerary && itinerary.rangofechas && itinerary.rangofechas.fechaInicio)
            ? itinerary.rangofechas.fechaInicio.substring(0, 10) : null,
          FechaHasta: (itinerary && itinerary.rangofechas && itinerary.rangofechas.fechaFin)
            ? itinerary.rangofechas.fechaFin.substring(0, 10) : null,
          DestinoCode: itinerary.agrupacionZona.toString()
        };
        const sources = [
          this.adminService.GetSalidasXItinerario(currentFilter, currentPage, pageSize)
        ];
        this.dataSubscription = forkJoin(sources)
          .subscribe(
            ([dates]: any[]) => {
              let indexBestDate

              if (dates.data.length > 0) {
                if (itinerary.paginationCenterElemt.posInPage < dates.data.length){

                  indexBestDate = itinerary.paginationCenterElemt.posInPage
                  if (dates.data[indexBestDate]){
                    existPost = true
                  }else {
                    existPost = false
                  }
              }
            }

            },
            (error: HttpErrorResponse) => {
            });

            return existPost

  }

  ChangePosInPage(value) {

    this.posInPage = value.posInPage
    this.showItinerary = value.showItinerary
    }
}
