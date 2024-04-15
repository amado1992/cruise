import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FiltroBusqueda } from 'src/app/models/FiltroBusqueda.model';
import { Filtros } from 'src/app/models/Filtros.model';
import { Agencia, AgenciaService } from 'src/app/services/DataServices/agencia.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss']
})
export class SearchFiltersComponent implements OnInit {
  @Input() propPriceFilter: any;//New line

  @Input() durationChecked: any;//New line

  @Input() filtersInfo: Filtros;

  @Input() screenLangInfo: any;

  @Output() Changefilters: EventEmitter<any> = new EventEmitter();

  collapse: boolean = true;

  defineMinMax: boolean = false;
  //New line
  changePriceRange: boolean = true;
  changePriceMax: boolean = false;
  //checkedDuration: any = "7-8"
  checkedDuration: any = ""
  //End new line

  priceMin: number = 1;
  //priceMax: number = 800;
  priceMax: number = 100000;//new value
  priceValue: number = 100000;//new value
  // priceValue: number = 300;

  haveChange: boolean = false;

  checkedDest: any[] = [];
  checkedNav: any[] = [];
  checkedPort: any[] = [];

  daysId: string;

  changePrice: boolean = false;

  currentFilters: FiltroBusqueda;

  callChange: boolean = false;

  checkedAllDest: boolean = false;
  checkedAllNav: boolean = false;
  checkedAllPort: boolean = false;
  activeAgencia: Agencia = <Agencia>{}; 

  loadTime: boolean = false;

  AgenciaMoneda: string = '';

  //Nuevas variables
  checkedAllNavOnly: boolean = false;
  checkedAllDestOnly: boolean = false;
  checkedAllPortOnly: boolean = false;
  //Nuevas variables
  someNumber: number = 1
  constructor(private userPreferences: UserPreferencesService,
    private agenciaService: AgenciaService) { }

  ngOnInit() {
    this.activeAgencia = this.agenciaService.getAgenciabyurl(this.userPreferences.getUrlConexion());
    this.AgenciaMoneda =this.activeAgencia.AgenciaMoneda;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.durationChecked.currentValue) {
      this.checkedDuration = changes.durationChecked.currentValue
      this.daysId = changes.durationChecked.currentValue

    }

    if (changes.propPriceFilter.currentValue != undefined) {
      this.priceMin = changes.propPriceFilter.currentValue.minPrice
      this.priceValue = changes.propPriceFilter.currentValue.maxPrice

    }
    let maxPrice = localStorage.getItem("maxPrice")
    if (maxPrice) {
      this.priceMax = parseInt(maxPrice)
    }
  }

  ChangeShowFilter() {


    this.collapse = !this.collapse;

    this.callChange = true;

    if (this.collapse) {
      this.haveChange = false;
      this.changePrice = false;

      this.loadTime = false;
    }
    else {
      this.InitData();
    }
  }

  ChangeDefineMinMax(value: boolean) {
    this.defineMinMax = value;
  }

  changePort(e: any, destino: any) {

    if (e.target.checked == true) {
      this.checkedAllDestOnly = false;
      this.checkedDest.push({ id: destino.id, descripcion: destino.descripcion });
    }
    else {
      this.checkedDest.splice(this.checkedDest.findIndex(current_element => current_element.id == destino.id), 1);
      this.checkedAllDest = false;
      //Nueva linia
      this.checkedAllDestOnly = false;
      //Fin nueva linia
    }

    this.haveChange = true;
  }

  changeNav(e: any, compania: any) {
    if (e.target.checked == true) {
      this.checkedAllNavOnly = false;//Nueva solucion
      this.checkedNav.push({ id: compania.id, descripcion: compania.descripcion });
    }
    else {
      this.checkedNav.splice(this.checkedNav.findIndex(current_element => current_element.id == compania.id), 1);
      this.checkedAllNav = false;
      this.checkedAllNavOnly = false;//Nueva solucion
    }

    this.haveChange = true;
  }

  changeDays(duration: any) {
    this.daysId = duration.id;
    this.haveChange = true;
  }

  changePortSail(e: any, puerto: any) {
    if (e.target.checked == true) {
      this.checkedAllPortOnly = false;
      this.checkedPort.push({ id: puerto.id, descripcion: puerto.descripcion });
    }
    else {
      this.checkedPort.splice(this.checkedPort.findIndex(current_element => current_element.id == puerto.id), 1);
      this.checkedAllPort = false;
      //Nueva linia
      this.checkedAllPortOnly = false;
      //Fin nueva linia
    }

    this.haveChange = true;
  }

  ChangePriceValue(event) {
    this.priceValue = event.target.value;
    this.haveChange = true;
    this.changePrice = true;

    //New line
    this.changePriceRange = true
    this.changePriceMax = false
    //End new line
  }

  ChangeMinPriceValue(event) {
    this.priceMin = event.target.value;
    this.haveChange = true;
    this.changePrice = true;
  }

  ChangeMaxPriceValue(event) {
    this.priceMax = event.target.value;
    this.haveChange = true;
    this.changePrice = true;

    //New line
    this.changePriceMax = true
    this.changePriceRange = false
    this.priceValue = event.target.value;
    //End new line

    //New line
    localStorage.setItem("maxPrice", this.priceMax.toString())
    //End new line
  }

  Search() {
    /* if (this.haveChange) {
       this.BuildCurrentFilter();
     }
     else {
       this.collapse = true;
     }*/

    //New solution
    if (this.priceMax >= this.priceMin) {
      this.BuildCurrentFilter();

      this.collapse = true;
      //this.collapse = false;//Nuevo valor
    }
    //End new solution
  }

  clickOutsideMenu() {
    if (!this.callChange) {
      this.collapse = true;
      //this.collapse = false;//Nuevo value
    }
    else {
      this.callChange = false;
      //this.collapse = false;//Nuevo value
    }
  }

  InitData() {

    this.currentFilters = this.userPreferences.getElement("SearchFilters");

    this.checkedDest = [];
    this.checkedNav = [];
    this.checkedPort = [];

    this.InitCheckAll();

    if (this.filtersInfo) {
      if (this.filtersInfo.destinos && this.filtersInfo.destinos.length > 0) {
        for (let index = 1; index < this.filtersInfo.destinos.length; index++) {
          var destino = this.filtersInfo.destinos[index];

          if (destino.hijos && destino.hijos.length > 0) {
            for (let h = 0; h < destino.hijos.length; h++) {
              var hijo = destino.hijos[h];

              if (this.ExistElement('destino', hijo.id)) {
                this.checkedDest.push({ id: hijo.id, descripcion: hijo.descripcion });
              }
            }
          }
          else {

            if (this.ExistElement('destino', destino.id)) {
              this.checkedDest.push({ id: destino.id, descripcion: destino.descripcion });
            }
          }
        }
      }

      if (this.filtersInfo.companias && this.filtersInfo.companias.length > 0) {
        for (let index = 1; index < this.filtersInfo.companias.length; index++) {
          var compania = this.filtersInfo.companias[index];

          if (this.ExistElement('compania', compania.id)) {
            this.checkedNav.push({ id: compania.id, descripcion: compania.descripcion });
          }
        }
      }

      if (this.filtersInfo.puertos && this.filtersInfo.puertos.length > 0) {
        for (let index = 1; index < this.filtersInfo.puertos.length; index++) {
          var puerto = this.filtersInfo.puertos[index];

          if (this.ExistElement('puerto', puerto.id)) {
            this.checkedPort.push({ id: puerto.id, descripcion: puerto.descripcion });
          }
        }
      }
    }

    setTimeout(() => {
      this.loadTime = true;
    }, 300);
  }

  InitCheckAll() {
    if (this.currentFilters) {
      if (this.currentFilters.destino && this.currentFilters.destino.length > 0) {
        if (this.currentFilters.destino.length == 1 && this.currentFilters.destino[0] == "0") {
          this.checkedAllDest = true;
          //Nueva linia
          this.checkedAllDestOnly = true;
          //Fin nueva linia
        }
      }
      else {
        this.checkedAllDest = true;
        //Nueva linia
        this.checkedAllDestOnly = true;
        //Fin nueva linia
      }

      if (this.currentFilters.companias && this.currentFilters.companias.length > 0) {
        if (this.currentFilters.companias.length == 1 && this.currentFilters.companias[0] == "0") {
          this.checkedAllNav = true;
          this.checkedAllNavOnly = true;//Nueva solucion
        }
      }
      else {
        this.checkedAllNav = true;

        this.checkedAllNavOnly = true;//Nueva solucion
      }

      if (this.currentFilters.puerto && this.currentFilters.puerto.length > 0) {
        if (this.currentFilters.puerto.length == 1 && this.currentFilters.puerto[0] == "0:0") {
          this.checkedAllPort = true;
          //Nueva linia
          this.checkedAllPortOnly = true;
          //Fin nueva linia
        }
      }
      else {
        this.checkedAllPort = true;
        //Nueva linia
        this.checkedAllPortOnly = true;
        //Fin nueva linia
      }
    }

  }

  BuildCurrentFilter() {
    var listDest: string[] = [];
    var listNav: string[] = [];
    var listPort: string[] = [];

    // Cuando estan seleccionadas todas mando el elemento todos sino solo las seleccionadas
    /*if (this.checkedAllDest) {
      listDest.push("0");
    }*/
    //Nueva solucion
    if (this.checkedAllDestOnly) {
      listDest.push("0");
    }
    else {
      this.checkedDest.forEach(destino => { listDest.push(destino.id); });
    }

    /*if (this.checkedAllNav) {
      listNav.push("0");
    }*/

    //Nueva solucion
    if (this.checkedAllNavOnly) {
      listNav.push("0");
    }
    else {
      this.checkedNav.forEach(compania => { listNav.push(compania.id); });
    }

    /*if (this.checkedAllPort) {
      listPort.push("0:0");
    }*/
    //Nueva solucion
    if (this.checkedAllPortOnly) {
      listPort.push("0:0");
    }
    else {
      this.checkedPort.forEach(puerto => { listPort.push(puerto.id); });
    }

    //Ejecucar por defeto, nueva solucion
    this.changePrice = true
    //Fin ejecucar por defeto, nueva solucion
    var currentFilters =
    {
      destino: listDest,
      puerto: listPort,
      companias: listNav,
      duracion: this.daysId ? this.daysId : null,
      /* priceFilter: this.changePrice == true ?
        {
          minPrice: +this.priceMin,
          maxPrice: this.defineMinMax ? +this.priceMax : +this.priceValue
        }
         : null*/

      priceFilter:
      {
        minPrice: +this.priceMin,
        maxPrice: this.changePriceRange ? +this.priceValue : +this.priceMax
      }

    };
    // parseInt(currentFilters.priceFilter.maxPrice.toString())

    //New line
    /* if (this.defineMinMax) {
      localStorage.setItem("maxPrice", this.priceMax.toString())
     }*/
    //End new line

    this.haveChange = false;
    this.changePrice = false;
    this.Changefilters.emit(currentFilters);
  }

  ExistElement(type, elementid): any {
    if (!this.currentFilters) {
      return false;
    }
    else {
      if (type == 'destino') {
        if (this.currentFilters.destino && this.currentFilters.destino.length > 0) {
          if (this.currentFilters.destino.length == 1 && this.currentFilters.destino[0] == "0") {
            return true;
          }

          var found: boolean = false;
          this.currentFilters.destino.forEach(element => {
            if (element == elementid) {
              found = true;
            }
          });
          return found;
        }
        else {
          return true;
        }
      }
      else if (type == 'compania') {
        if (this.currentFilters.companias && this.currentFilters.companias.length > 0) {
          if (this.currentFilters.companias.length == 1 && this.currentFilters.companias[0] == "0") {
            return true;
          }

          var found: boolean = false;
          this.currentFilters.companias.forEach(element => {
            if (element == elementid) {
              found = true;
            }
          });
          return found;
        }
        else {
          return true;
        }
      }
      else if (type == 'puerto') {
        if (this.currentFilters.puerto && this.currentFilters.puerto.length > 0) {
          if (this.currentFilters.puerto.length == 1 && this.currentFilters.puerto[0] == "0:0") {
            return true;
          }

          var found: boolean = false;
          this.currentFilters.puerto.forEach(element => {
            if (element.indexOf(elementid) >= 0) {
              found = true;
            }
          });
          return found;
        }
        else {
          return true;
        }
      }
    }
  }

  CheckedElement(type, elementid): any {
    if (!this.currentFilters) {
      return false;
    }
    else {
      if (type == 'destino') {
        // if (this.currentFilters.destino && this.currentFilters.destino.length > 0) {
        // if (this.currentFilters.destino.length == 1 && this.currentFilters.destino[0] == "0") {
        //   return true;
        // }

        var foundIndex = this.checkedDest.findIndex(current_element => current_element.id == elementid);

        return foundIndex >= 0;
        // }
        // else {
        //   return true;
        // }
      }
      else if (type == 'compania') {
        // if (this.currentFilters.companias && this.currentFilters.companias.length > 0) {
        // if (this.currentFilters.companias.length == 1 && this.currentFilters.companias[0] == "0") {
        //   return true;
        // }

        var foundIndex = this.checkedNav.findIndex(current_element => current_element.id == elementid);

        return foundIndex >= 0;
        // }
        // else {
        //   return true;
        // }
      }
      else if (type == 'puerto') {
        // if (this.currentFilters.puerto && this.currentFilters.puerto.length > 0) {
        // if (this.currentFilters.puerto.length == 1 && this.currentFilters.puerto[0] == "0:0") {
        //   return true;
        // }

        var foundIndex = this.checkedPort.findIndex(current_element => current_element.id == elementid);

        return foundIndex >= 0;
        // }
        // else {
        //   return true;
        // }
      }
    }
  }

  CheckedAllElement(type, elementid): any {
    if (!this.currentFilters) {
      return false;
    }
    else {
      if (type == 'destino') {
        return this.checkedAllDest;
      }
      else if (type == 'compania') {
        return this.checkedAllNav;
      }
      else if (type == 'puerto') {
        return this.checkedAllPort;
      }
    }
  }

  changeAllPortSail(e: any) {
    if (this.filtersInfo) {
      this.checkedPort = [];
      if (e.target.checked == true) {
        this.checkedAllPort = true;
        //Nueva linia
        this.checkedAllPortOnly = false;
        //Fin nueva linia
        if (this.filtersInfo.puertos && this.filtersInfo.puertos.length > 0) {
          for (let index = 1; index < this.filtersInfo.puertos.length; index++) {
            var puerto = this.filtersInfo.puertos[index];

            this.checkedPort.push({ id: puerto.id, descripcion: puerto.descripcion });
          }
        }
      }
      else {
        this.checkedAllPort = false;
        //Nueva linia
        this.checkedAllPortOnly = true;
        //Fin nueva linia
      }

      this.haveChange = true;
    }
  }

  changeAllNav(e: any) {
    if (this.filtersInfo) {
      this.checkedNav = [];
      if (e.target.checked == true) {
        this.checkedAllNav = true;

        //Nueva linia
        this.checkedAllNavOnly = false;
        //Fin nueva linia
        if (this.filtersInfo.companias && this.filtersInfo.companias.length > 0) {
          for (let index = 1; index < this.filtersInfo.companias.length; index++) {
            var compania = this.filtersInfo.companias[index];

            this.checkedNav.push({ id: compania.id, descripcion: compania.descripcion });
          }
        }
      }
      else {

        this.checkedAllNav = false;
        //Nueva linia
        this.checkedAllNavOnly = true;
        //Fin nueva linia
      }

      this.haveChange = true;
    }
  }

  changeAllPort(e: any) {

    if (this.filtersInfo) {
      this.checkedDest = [];
      if (e.target.checked == true) {
        this.checkedAllDest = true;
        //Nueva linia
        this.checkedAllDestOnly = false;
        //Fin nueva linia
        if (this.filtersInfo.destinos && this.filtersInfo.destinos.length > 0) {
          for (let index = 1; index < this.filtersInfo.destinos.length; index++) {
            var destino = this.filtersInfo.destinos[index];

            if (destino.hijos && destino.hijos.length > 0) {
              for (let h = 0; h < destino.hijos.length; h++) {
                var hijo = destino.hijos[h];

                this.checkedDest.push({ id: hijo.id, descripcion: hijo.descripcion });
              }
            }
            else {

              this.checkedDest.push({ id: destino.id, descripcion: destino.descripcion });
            }
          }
        }
      }
      else {
        this.checkedAllDest = false;
        //Nueva linia
        this.checkedAllDestOnly = true;
        //Fin nueva linia
      }

      this.haveChange = true;
    }
  }

}
