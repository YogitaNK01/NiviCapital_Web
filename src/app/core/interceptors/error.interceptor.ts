import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  // Timeout in milliseconds (30 seconds)
  private readonly REQUEST_TIMEOUT = 30000;
  // Number of retries for failed requests
  private readonly RETRY_ATTEMPTS = 1;

  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone request with credentials for cookie-based token
    request = request.clone({
      withCredentials: true
    });

    return next.handle(request).pipe(
      // Add timeout to requests
      timeout(this.REQUEST_TIMEOUT),
      // Retry failed requests (except 4xx and 5xx errors)
      retry({
        count: this.RETRY_ATTEMPTS,
        delay: (error: any) => {
          // Only retry on network errors, not HTTP errors
          if (error instanceof HttpErrorResponse) {
            return throwError(() => error);
          }
          return throwError(() => error);
        },
      }),
      // Handle errors
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
          console.error('Client-side error:', error.error);
        } else {
          // Server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          console.error('Server-side error:', error);

          // Handle specific error codes
          switch (error.status) {
            case 0:
              errorMessage = 'Network error. Please check your internet connection.';
              break;
            case 400:
              errorMessage = error.error?.message || 'Bad Request';
              break;
            case 401:
              errorMessage = 'Unauthorized. Please login again.';
              // Clear auth tokens on 401
              sessionStorage.removeItem('authToken');
              localStorage.removeItem('authToken');
              // Redirect to login if needed
              window.location.href = '/login';
              break;
            case 403:
              errorMessage = 'Forbidden. You do not have access to this resource.';
              break;
            case 404:
              errorMessage = 'Resource not found.';
              break;
            case 408:
              errorMessage = 'Request timeout. Please try again.';
              break;
            case 500:
              errorMessage = 'Internal server error. Please try again later.';
              break;
            case 503:
              errorMessage = 'Service unavailable. Please try again later.';
              break;
          }
        }

        // Log the error (you can integrate with a logging service)
        console.error(errorMessage);

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
