import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearcherComponent } from '../searcher/searcher/searcher.component';
import { ItineraryinfoComponent } from '../searcher/itineraryinfo/itineraryinfo.component';
import { PassengersNumberComponent } from '../searcher/passengers-number/passengers-number.component';
import { RatesComponent } from '../searcher/rates/rates.component';
import { SummaryQuotationComponent } from '../searcher/summary-quotation/summary-quotation.component';
import { ReservationSummaryComponent } from '../searcher/reservation-summary/reservation-summary.component';
import { StateroomChoiceComponent } from '../searcher/stateroom-choice/stateroom-choice.component';
import { PassengerDataReservationComponent } from '../searcher/passenger-data-reservation/passenger-data-reservation.component';
import { ReserveConfirmationComponent } from '../searcher/reserve-confirmation/reserve-confirmation.component';
import { SearchMiniComponent } from '../searcher/search-mini/search-mini.component';
import { SelectAgencyComponent } from '../searcher/select-agency/select-agency.component';
import { SearchMiniOfferComponent } from '../searcher/search-mini-offer/search-mini-offer.component';
import { SearchBannerComponent } from '../searcher/search-banner/search-banner.component';
import { TaxFoodComponent } from '../searcher/tax-food/tax-food.component';
import { CotizationSelectionComponent } from '../searcher/cotization-selection/cotization-selection.component';
import { TaxCreditComponent } from '../searcher/tax-credit/tax-credit.component';
import { PassengerDataSummaryComponent } from '../searcher/passenger-data-summary/passenger-data-summary.component';
import { CruiseGuard } from 'src/app/cruise.guard';

const administrationRoutes: Routes = [
    { path: '', redirectTo: '/cruisebrowser/selectagency', pathMatch: 'full'},
    { path: 'selectagency', component: SelectAgencyComponent, canActivate: [CruiseGuard]},
    { path: 'searcher', component: SearcherComponent, canActivate: [CruiseGuard]},
    { path: 'passengersnumber', component: PassengersNumberComponent, canActivate: [CruiseGuard]},
    { path: 'selectionrates', component: RatesComponent, canActivate: [CruiseGuard]},
    { path: 'summaryquotation', component: SummaryQuotationComponent, canActivate: [CruiseGuard]},
    { path: 'reservationsummary', component: ReservationSummaryComponent, canActivate: [CruiseGuard]},
    { path: 'stateroomchoice', component: StateroomChoiceComponent, canActivate: [CruiseGuard]},
    { path: 'passengerdatareservation', component: PassengerDataReservationComponent, canActivate: [CruiseGuard]},
    { path: 'reserveconfirmation', component: ReserveConfirmationComponent, canActivate: [CruiseGuard]},
    { path: 'searchermini', component: SearchMiniComponent, canActivate: [CruiseGuard]},
    { path: 'searcherminioffer', component: SearchMiniOfferComponent, canActivate: [CruiseGuard]},
    { path: 'searcherbanner', component: SearchBannerComponent, canActivate: [CruiseGuard]},
    { path: 'taxfood', component: TaxFoodComponent, canActivate: [CruiseGuard]},
    { path: 'cotizationselection', component: CotizationSelectionComponent, canActivate: [CruiseGuard]},
    { path: 'taxcredit', component: TaxCreditComponent, canActivate: [CruiseGuard]},
    { path: 'passengerdatasummary', component: PassengerDataSummaryComponent, canActivate: [CruiseGuard]},

];

@NgModule({
  imports: [
    RouterModule.forChild(administrationRoutes)
  ],
  exports: [
    RouterModule
  ],
})
export class AdministrationRoutingModule { }
