import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CachingService } from './caching.service';



@Injectable()
export class CachingInterceptorService implements HttpInterceptor {

  constructor(private cachingService: CachingService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== 'GET' || !this.cachingService.canBeCached(request.url)) {
      return next.handle(request);
    }

    if (request.headers.get('reset-cache')) {
      this.cachingService.clearCachedData(request.urlWithParams);
    }

    const cachedData = this.cachingService.getCachedData(request.urlWithParams);
    if (cachedData) {
      return (cachedData instanceof Observable) ? cachedData : of(new HttpResponse({ ...cachedData }));
    }

    const handler = next.handle(request).pipe(
      tap(
        event => {
          if (event instanceof HttpResponse) {
            this.cachingService.cache(request.urlWithParams, { ...event });
          }
        }
      )
    );

    this.cachingService.cache(request.urlWithParams, handler);
    return handler;
  }
}
