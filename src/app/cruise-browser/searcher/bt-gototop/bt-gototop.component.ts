import { Component, OnInit ,HostListener, Inject, } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-bt-gototop',
  templateUrl: './bt-gototop.component.html',
  styleUrls: ['./bt-gototop.component.scss']
})
export class BtGototopComponent implements OnInit {

  windowScrolled: boolean;
  constructor(@Inject(DOCUMENT) private document: Document) {}
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
      if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) {
          this.windowScrolled = true;
      }
     else if (this.windowScrolled && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 10) {
          this.windowScrolled = false;
      }
  }
  scrollToTop(): void {
      (function smoothscroll(): void {
          const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
          if (currentScroll > 0) {
              window.requestAnimationFrame(smoothscroll);
              window.scrollTo(0, currentScroll - (currentScroll / 8));
          }
      })();
  }

  ngOnInit(): void {
  }

}
