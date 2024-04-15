import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CruiseGuard implements CanActivate {
  constructor(private router: Router) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (next.url[0].path == "searcher") {
      localStorage.removeItem("reservaOnline")
      localStorage.removeItem("PrintPdf")
      localStorage.removeItem("SendEMail")  

      localStorage.removeItem('activeUrl');
      localStorage.removeItem('InvalidNotifierQuotation')
      localStorage.removeItem('InvalidNotifier')

      localStorage.removeItem("BookingMode")
      localStorage.removeItem("QuotationMode")
      localStorage.removeItem('SoloCotizacionOnline')
    }
    var a = [];
    // Parse the serialized data back into an aray of objects
    if (localStorage.getItem('activeUrl')) {
      a = JSON.parse(localStorage.getItem('activeUrl'))
    } else {
      a = [];
    }
    // a = JSON.parse(localStorage.getItem('activeUrl')) || [];

    // Push the new data (whether it be an object or anything else) onto the array
    if (a.indexOf(next.url[0].path) == -1) {
      a.push(next.url[0].path);
    }


    // Re-serialize the array back into a string and store it in localStorage
    localStorage.setItem('activeUrl', JSON.stringify(a));

    //Solo se puede entrar reservationsummary si back es true 
    let back = localStorage.getItem("backReservationSummary")
    if (back) {
      if (back == 'false' && next.url[0].path == "reservationsummary") {

        this.router.navigate(['cruisebrowser', 'searcher']);
      }
    } else {
      localStorage.setItem("backReservationSummary", JSON.stringify(false));
    }
     //Fin solo se puede entrar reservationsummary si back es true

    /* if (next.url[0].path == "reservationsummary") {
       if (back) {
         if (back == 'false') {
           this.router.navigate(['cruisebrowser', 'searcher']);
         }
       } else {
         localStorage.setItem("backReservationSummary", JSON.stringify(false));
       }
     }*/



    // localStorage.setItem("activeUrl", JSON.stringify(next.url[0].path))
    return true;
  }
}
