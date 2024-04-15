import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { FiltroBusqueda } from 'src/app/models/FiltroBusqueda.model';
import { Filtros } from 'src/app/models/Filtros.model';
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';

@Component({
  selector: 'app-search-banner',
  templateUrl: './search-banner.component.html',
  styleUrls: ['./search-banner.component.scss']
})
export class SearchBannerComponent implements OnInit, OnDestroy {

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

  itinerarySubscription: Subscription;

  screenLangInfo: any = null;

  itineraryTotalCount: number = 0;
  datesTotalCount: number = 0;

  showAdvSearch: boolean = false;

  loadingLabels: boolean;
  errorLoadingLabels: boolean;

  navHaveChange: boolean = false;

  firstCall: boolean = false;

  orderBy: string;
  orderByDesc: string;

  loadFilters: boolean = false;

  urlRedireccion: string = "";

  constructor(private adminService: AdminUsersService, private userPreferences: UserPreferencesService, private router: Router) { }

  ngOnInit() {
    this.currentFilters = this.userPreferences.getElement("SearchFilters");

    if (this.currentFilters) {
      this.loadFilters = true;
    }
    this.firstCall = true;

    this.InitData();
    this.initSelectionStatus();
  }

  ngOnDestroy() {

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  ShowSearch() {
    this.UpdateFilter();
    this.dataSubscription = this.adminService.SignInWidget()
      .subscribe(([response]: any[]) => {
        var signData = response;
        if (signData != null) {
          if (signData.key.indexOf("urlRedireccion") >= 0) {
            var redireccionar = new URL(signData.value);
            var mySearchParams = new URLSearchParams(this.BuildQueryParams());
            for (const [key, value] of mySearchParams.entries()) {
              redireccionar.searchParams.set(key, value);
            }
            window.open(redireccionar.href);
          }
        }
      });
  }

  UpdateFilter() {

    this.userPreferences.setElement("SearchFilters", this.currentFilters);
  }

  disabled(): boolean {
    return this.loadingData || this.errorLoadingData;
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

  BuildCurrentFilter() {
    this.currentFilters =
    {
      destino: [this.destId],
      fecha: this.dateId,
      puerto: [this.portId],
      barco: this.boatId,
      companias: this.buildCheckNav(),
      duracion: this.daysId,
      orderBy: +this.orderBy,
      priceFilter:
      {
        minPrice: 1,
        maxPrice: 100000
      }
    };

    this.loadCombosFilter();
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
        if (this.currentFilters.fecha) {
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
        if (this.currentFilters.companias && this.currentFilters.companias.length > 0) {
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

        if (this.currentFilters.barco) {
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

        if (this.currentFilters.duracion) {
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

        if (this.currentFilters.puerto && this.currentFilters.puerto.length > 0) {
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
      this.adminService.GetScreenSearchLocale()
    ];

    this.dataSubscription = forkJoin(sources)
      .subscribe(
        ([screenInfo]: any[]) => {
          this.screenLangInfo = screenInfo;
          this.loadingLabels = false;

          this.orderBy = "0";

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
              priceFilter:
              {
                minPrice: 1,
                maxPrice: 100000
              }
            };
          }
          else {
            if (this.currentFilters.orderBy) {
              this.orderBy = this.currentFilters.orderBy.toString();
            }
            this.currentFilters.priceFilter =
            {
              minPrice: 1,
              maxPrice: 100000
            }
          }         
          this.loadCombosFilter();
        },
        (error: HttpErrorResponse) => {
          this.loadingLabels = false;
          this.errorLoadingLabels = true;
        });

  }

  private loadCombosFilter() {

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.loadingData = true;
    this.errorLoadingData = false;
    var sources = [
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
            }
            else {
              this.FirstCombosValues();
            }

            this.firstCall = false;
          }

          this.loadingData = false;
        },
        (error: HttpErrorResponse) => {
          this.loadingData = false;
          this.errorLoadingData = true;
        });
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

  BuildQueryParams(): any {
    var result = '';

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
        result += 'destination=' + destino + '&';
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
        result += 'port=' + puerto + '&';
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
        result += 'company=' + companias + '&';
      }
    }

    if (this.currentFilters.fecha != null && this.currentFilters.fecha != '0-0' && this.currentFilters.fecha != 'null') {
      result += 'date=' + this.currentFilters.fecha + '&';
    }

    if (this.currentFilters.barco != null && this.currentFilters.barco != '0:0' && this.currentFilters.barco != 'null') {
      result += 'ship=' + this.currentFilters.barco + '&';
    }

    if (this.currentFilters.duracion != null && this.currentFilters.duracion != '0' && this.currentFilters.duracion != 'null') {
      result += 'duration=' + this.currentFilters.duracion + '&';
    }
/*
    if (this.currentFilters.priceFilter != null) {
      result += 'priceFilter=' + this.currentFilters.priceFilter;
    }
*/
    if (result.trim() != '') {
      result = '?' + result.substring(0, result.length - 1);
    }

    return result;
  }

}
