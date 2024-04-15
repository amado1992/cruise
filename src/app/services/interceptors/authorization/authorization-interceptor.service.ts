import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { UserPreferencesService } from '../../user-preferences.service';



@Injectable()
export class AuthorizationInterceptorService implements HttpInterceptor {

  constructor(private router: Router, private userPreferencesService: UserPreferencesService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     const urlConexion = this.userPreferencesService.getUrlConexion();

     if (urlConexion)
     {
      request = request.clone({
        setHeaders: {
          "urlConexion": urlConexion
        }
      });
    }

    return next.handle(request).pipe(
      tap(
        event => {},
        error => {}
      )
    );
  }


}
