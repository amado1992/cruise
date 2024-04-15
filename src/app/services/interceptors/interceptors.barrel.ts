/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthorizationInterceptorService } from './authorization/authorization-interceptor.service';
import { CachingInterceptorService } from './caching/caching-interceptor.service';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationInterceptorService, multi: true }
];
