import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {

  getUserLanguage(): string {
    return localStorage.getItem('CruiseBrowserlan');
  }

  setUserLanguage(lang: string) {
    localStorage['CruiseBrowserlan'] = lang;
  }

  getUrlConexion(): string {
    return localStorage.getItem('urlConexion');
  }

  setUrlConexion(urlConexion: string) {
    localStorage['urlConexion'] = urlConexion;
  }

  setCompany(company: string) {
    localStorage['company'] = company;
  }
  
  getCompany() {
    return localStorage['company'];
  }

  getUrlShareConexion(): string {
    return localStorage.getItem('urlShareConexion');
  }

  setUrlShareConexion(urlConexion: string) {
    localStorage['urlShareConexion'] = urlConexion;
  }

  getUsername(): string {
    return localStorage.getItem('username');
  }

  getUserImage(): string {
    return localStorage.getItem('userImage');
  }

  getItemsPerPage(): number {
    return 10;
  }

  getElement(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  setElement(key: string, value: any) {
    localStorage[key] = JSON.stringify(value);
  }
}
