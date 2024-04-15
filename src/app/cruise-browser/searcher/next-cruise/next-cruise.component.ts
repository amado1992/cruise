import { Component, Input, OnInit } from '@angular/core';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
@Component({
  selector: 'app-next-cruise',
  templateUrl: './next-cruise.component.html',
  styleUrls: ['./next-cruise.component.scss']
})
export class NextCruiseComponent implements OnInit {
  @Input() screenLangInfo: any;
  @Input() urlShip: string;
  itinerary: any;
  selectedDate: any;
  reservation: any;
  cleanText: any;
  showArrow: boolean;
  showScroll: boolean;
  selectedCabin: any;
  constructor(private userPreferences: UserPreferencesService) { }
  ngOnInit() {
    this.showArrow = false;
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");
    // Show arrow to put visible the scroll bar
    if (this.selectedDate.recorrido.length > 6) {
      //this.showArrow = true;
      this.showScroll = true;
    }
    this.InitData();
  }
  //  Show scroll bar function
  showScrollBar() {
    this.showScroll = true;
    this.showArrow = false;
  }
  InitData() {
    for (let index = 0; index < this.selectedDate.recorrido.length; index++) {
      var element = this.selectedDate.recorrido[index];
      element.diaActividadString = this.BuildDate(element.diaActividad);
    }
  }
  BuildDate(fecha: string): any {
    var result = "";
    if (fecha) {
      var split: string[] = fecha.substring(0, 10).split("-");
      result = split[2] + "-" + split[1] + "-" + split[0];
    }
    return result;
  }
}
