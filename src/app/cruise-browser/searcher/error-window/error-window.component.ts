import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-error-window',
  templateUrl: './error-window.component.html',
  styleUrls: ['./error-window.component.scss']
})

export class ErrorWindowComponent implements OnInit {

  @Input() screenError: any;

  constructor(private activeModal: NgbActiveModal, private router: Router) {


  }

  ngOnInit() {
  }


  close() {
    this.activeModal.close();
    //New case
    var sendEmail = localStorage.getItem("SendEMail");
    if (sendEmail) {
      this.router.navigate(['cruisebrowser', 'summaryquotation'])
    }

    var printPdf = localStorage.getItem("PrintPdf");
    if (printPdf) {
      this.router.navigate(['cruisebrowser', 'summaryquotation'])
    }

    let reservaOnline = localStorage.getItem("reservaOnline");
    if (reservaOnline) {
      this.router.navigate(['cruisebrowser', 'selectionrates'])
    }

    //End new case

    if (!sendEmail && !reservaOnline && !printPdf) {


      let activeUrl = localStorage.getItem("activeUrl")

      if (activeUrl) {
        activeUrl = JSON.parse(activeUrl)

        if (activeUrl.length > 1) {

          if (activeUrl[activeUrl.length - 1] == "reservationsummary") {
            this.router.navigate(['cruisebrowser', 'searcher']);
          } else {

            let nav = (activeUrl.length - 1) - 1

            this.router.navigate(['cruisebrowser', activeUrl[nav]]);
          }
        }



        if (activeUrl.length == 1) {

          this.router.navigate(['cruisebrowser', 'searcher']);
        }
      }
    }
    localStorage.removeItem("reservaOnline")
    localStorage.removeItem("PrintPdf")
    
    localStorage.removeItem("SendEMail")

    /*if (activeUrl){
      activeUrl = JSON.parse(activeUrl)
      if (activeUrl.length == 1){
      
      this.router.navigate(['cruisebrowser', 'searcher']);}
    }*/


    /* this.router.navigate(['cruisebrowser', JSON.parse(activeUrl)]);
     this.router.navigate(['cruisebrowser', 'searcher']);*/
  }

}
