import { Component, Input, OnInit } from '@angular/core';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';
@Component({
  selector: 'app-final-price',
  templateUrl: './final-price.component.html',
  styleUrls: ['./final-price.component.scss']
})
export class FinalPriceComponent implements OnInit {
  @Input() screenLangInfo: any;
  @Input() urlDesg: string;
  @Input() cotResume: any;
  dataPass: any[] = [];
  itinerary: any;
  selectedDate: any;
  reservation: any;
  selectedCabin: any;
  constructor(private userPreferences: UserPreferencesService) { }
  ngOnInit() {
    this.selectedDate = this.userPreferences.getElement("SelectedDate");
    this.itinerary = this.userPreferences.getElement("Itinerary");
    this.reservation = this.userPreferences.getElement("Reservation");
    this.selectedCabin = this.userPreferences.getElement("selectedCabin");
  }
  GetClass(object: any): any {
    if (object && object.color && object.color != null) {
      if (object.color.toString().indexOf("Gray") >= 0) {
        return "";
      }
      else if (object.color.toString().indexOf("Blue") >= 0) {
        return "text-primary";
      }
      else if (object.color.toString().indexOf("Red") >= 0) {
        return "text-danger";
      }
      else {
        return "";
      }
    }
    else {
      return "";
    }
  }
}
