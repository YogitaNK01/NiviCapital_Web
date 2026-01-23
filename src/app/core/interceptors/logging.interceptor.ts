import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone request with credentials for cookie-based token
    request = request.clone({
      withCredentials: true
    });

    const startTime = Date.now();

    console.log(`[HTTP Request] ${request.method} ${request.url}`);
    if (request.body) {
      console.log('Request Body:', request.body);
    }

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            const elapsedTime = Date.now() - startTime;
            console.log(
              `[HTTP Response] ${request.method} ${request.url} - Status: ${event.status} (${elapsedTime}ms)`
            );
            if (event.body) {
              console.log('Response Body:', event.body);
            }
          }
        },
        (error: any) => {
          const elapsedTime = Date.now() - startTime;
          console.error(
            `[HTTP Error] ${request.method} ${request.url} - Status: ${error.status} (${elapsedTime}ms)`
          );
          console.error('Error:', error);
        }
      )
    );
  }
}
