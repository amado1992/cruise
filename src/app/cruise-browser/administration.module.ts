 import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdministrationRoutingModule } from './administration-routing/administration-routing.module';
import {CommonsModule} from '../commons/commons.module';
import { AppNgbModule } from '../ngb/app-ngb.module';
import { NgbTooltipModule, NgbDropdownModule, NgbCarouselModule, NgbPaginationModule,
   NgbPopoverModule, NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import { NotifierModule } from 'angular-notifier';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { SearcherComponent } from './searcher/searcher/searcher.component';
import { ItineraryinfoComponent } from './searcher/itineraryinfo/itineraryinfo.component';
import { RatesComponent } from './searcher/rates/rates.component';
import { PassengersNumberComponent } from './searcher/passengers-number/passengers-number.component';
import { SummaryQuotationComponent } from './searcher/summary-quotation/summary-quotation.component';
import { NextCruiseComponent } from './searcher/next-cruise/next-cruise.component';
import { FinalPriceComponent } from './searcher/final-price/final-price.component';
import { ChoiceCabinComponent } from './searcher/choice-cabin/choice-cabin.component';
import { EnterPassengerDataComponent } from './searcher/enter-passenger-data/enter-passenger-data.component';
import { ReservationSummaryComponent } from './searcher/reservation-summary/reservation-summary.component';
import { StateroomChoiceComponent } from './searcher/stateroom-choice/stateroom-choice.component';
import { PassengerDataReservationComponent } from './searcher/passenger-data-reservation/passenger-data-reservation.component';
import { ReserveConfirmationComponent } from './searcher/reserve-confirmation/reserve-confirmation.component';
import { CategorycabinselectionComponent } from './searcher/categorycabinselection/categorycabinselection.component';
import { CabinsAvailableComponent } from './searcher/cabins-available/cabins-available.component';
import { ItineraryElementComponent } from './searcher/itinerary-element/itinerary-element.component';
import { RateElementComponent } from './searcher/rate-element/rate-element.component';
import { SearchFiltersComponent } from './searcher/search-filters/search-filters.component';
import { AgmCoreModule } from '@agm/core';
import {MatButtonModule, MatDialogModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule} from '@angular/material';
import { SearchMiniComponent } from './searcher/search-mini/search-mini.component';
import { SelectAgencyComponent } from './searcher/select-agency/select-agency.component';
import { SearchMiniOfferComponent } from './searcher/search-mini-offer/search-mini-offer.component';
import { ShowCabinComponent } from './searcher/show-cabin/show-cabin.component';
import { SearchBannerComponent } from './searcher/search-banner/search-banner.component';
import { StateroomRateComponent } from './searcher/stateroom-rate/stateroom-rate.component';
import { TaxFoodComponent } from './searcher/tax-food/tax-food.component';
import { TaxCreditComponent } from './searcher/tax-credit/tax-credit.component';
import { PassengerDataSummaryComponent } from './searcher/passenger-data-summary/passenger-data-summary.component';
import { CotizationSelectionComponent } from './searcher/cotization-selection/cotization-selection.component';
import { CallCenterComponent } from './searcher/call-center/call-center.component';
import { ErrorWindowComponent } from './searcher/error-window/error-window.component';
import { ResizeService } from '../services/resize.service';
import { DialogDate } from './dialog-date/dialog-date';
import { BtGototopComponent } from './searcher/bt-gototop/bt-gototop.component';
import { InfoHeaderComponent } from './searcher/info-header/info-header.component';
@NgModule({
  imports: [
    CommonModule,
    AppNgbModule,
    AdministrationRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonsModule,
    NgbTooltipModule,
    NgbPopoverModule,
    NgbDropdownModule,
    NgbCarouselModule,
    NgbPaginationModule,
    NgbAccordionModule,
    MatSidenavModule,
    AgmCoreModule.forRoot({
      //  apiKey: 'AIzaSyDAoVQt3adZmHi4P_NmwuCFHIjn0eP_f-0',
      // apiKey: 'AIzaSyD-9v7nHcb7echGdlTFF3k8gflOe9kfw2A',
      apiKey: 'AIzaSyCjU2CjE43eFsWwKaQpZwo1zOtf0Ip7rbk',
    }),
    NotifierModule.withConfig({
      position: {
        horizontal: {
          position: 'right',
          distance: 12
        },
        vertical: {
          position: 'bottom',
          distance: 60,
          gap: 10
        }
      },
      behaviour: {
        autoHide: 1500,
        onClick: 'hide',
        onMouseover: 'pauseAutoHide',
        showDismissButton: true,
        stacking: 4
      }
    }),
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule
  ],
  declarations: [
    AdminHomeComponent,
    SearcherComponent,
    ItineraryinfoComponent,
    PassengersNumberComponent,
    RatesComponent,
    SummaryQuotationComponent,
    NextCruiseComponent,
    FinalPriceComponent,
    TaxFoodComponent,
    ChoiceCabinComponent,
    EnterPassengerDataComponent,
    ReservationSummaryComponent,
    StateroomChoiceComponent,
    PassengerDataReservationComponent,
    ReserveConfirmationComponent,
    CategorycabinselectionComponent,
    CabinsAvailableComponent,
    ItineraryElementComponent,
    RateElementComponent,
    SearchFiltersComponent,
    SearchMiniComponent,
    SelectAgencyComponent,
    SearchMiniOfferComponent,
    ShowCabinComponent,
    SearchBannerComponent,
    StateroomRateComponent,
    TaxCreditComponent,
    PassengerDataSummaryComponent,
    CotizationSelectionComponent,
    CallCenterComponent,
    ErrorWindowComponent,
    DialogDate,
    BtGototopComponent,
    InfoHeaderComponent
  ],
  entryComponents: [
    ItineraryinfoComponent,
    ChoiceCabinComponent,
    ShowCabinComponent,
    CallCenterComponent,
    ErrorWindowComponent,
    DialogDate
  ],
  providers: [
    ResizeService
  ]
})
export class AdministrationModule { }
