import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
@Component({
  selector: 'app-show-cabin',
  templateUrl: './show-cabin.component.html',
  styleUrls: ['./show-cabin.component.scss']
})
export class ShowCabinComponent implements OnInit {
  selectedCabin: any;
  width: any;
  plano:any;
  height: any;
  ModoReservacion: any;
  @Input() screenLangInfo: any;
  constructor(private activeModal: NgbActiveModal,
    private userPreferences: UserPreferencesService) { }
  ngOnInit() {
    this.ModoReservacion = this.userPreferences.getElement('ModoReservacion');
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");
    this.plano= this.selectedCabin.deckProfileImg.url;
    this.plano = this.plano.includes("Default_Cabina");
     
  }
  close() {
    this.activeModal.close();
  }
  zoomIn(event: any) {
    var pre = document.getElementById("preview");
    //var zoom = document.getElementById("zoom");
    // se comentan codigos de la lupa
    //zoom.style.visibility = "visible";
    var posX = event.offsetX;
    var posY = event.offsetY;
    if (pre) {
      var valor = pre.clientHeight >= 500 ? 3 : 5;
      //var valory = pre.clientHeight >= 280 ? 4 : 6;
      //var valorx = pre.clientWidth >= 300 ? 1 : 2;
      pre.style.backgroundPosition = 0 + "px " + (-posY * valor) + "px";
      //zoom.style.backgroundPosition = (-posX * valorx) + "px " + (-posY * valory) + "px";
    }
    // if (zoom)
    // {
    //   zoom.style.backgroundPosition = (-posX) + "px " + (-posY * 4) + "px";
    // }
  }
  zoomOut() {
    // var zoom = document.getElementById("zoom");
    // zoom.style.backgroundPosition = (0) + "px " + (0) + "px";
  }
}