import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';


@Injectable()

export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private router: Router, private http: HttpClient,) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const request = req.clone({ withCredentials: true });
                                                                                                         
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error)
        if (error.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;

          return this.http.post('/nivicapsit/api/auth/refresh', {}, { withCredentials: true }).pipe(
            switchMap((res: any) => {
              this.isRefreshing = false;


              return next.handle(request);
            }),
            catchError(err => {
              this.isRefreshing = false;
              this.router.navigate(['/login']);
              return throwError(() => err);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }

  

}



