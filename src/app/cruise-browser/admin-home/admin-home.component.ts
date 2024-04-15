import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {  Subscription } from 'rxjs';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit, OnDestroy {

  language: string;

  constructor(private router: Router, private route: ActivatedRoute, private translateService: TranslateService,
    private userPreferencesService: UserPreferencesService) { }

  ngOnInit() {
    //this.setLanguage();
  }

  ngOnDestroy() {

  }

  private setLanguage(): void {
    if (!this.translateService.currentLang) {
      const lang = this.userPreferencesService.getUserLanguage();
      const missingLang = lang ? !this.translateService.getLangs().find((value: string) => value === lang) : false;
      if (!lang || missingLang) {
        this.translateService.use('en');
      } else {
        this.translateService.use(lang);
      }
    }
    this.language = this.translateService.currentLang;
  }
}
