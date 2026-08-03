import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';



@Injectable()

export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);
  private baseUrl = environment.apiBaseUrl;
  constructor(private router: Router, private http: HttpClient,) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const request = req.clone({ withCredentials: true });

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error)
        // if (error.status === 401 && !this.isRefreshing) {

        if (error.status !== 401) {
          return throwError(() => error);
        }


        if (this.isRefreshing) {
          return this.refreshTokenSubject.pipe(
            filter(result => result != null),
            take(1),
            switchMap(() => next.handle(request))
          );
        }
        this.isRefreshing = true;
        this.refreshTokenSubject.next(null);
        let url = `${this.baseUrl}/auth/refresh`;
        return this.http.post(url,
          {}, { withCredentials: true }).pipe(
            switchMap((res: any) => {
              console.log('Refresh Success');
              this.isRefreshing = false;
              this.refreshTokenSubject.next(true);

              return next.handle(request);
            }),
            catchError(err => {
              this.isRefreshing = false;
              console.log('Refresh Failed', err);
              this.router.navigate(['/login']);
              return throwError(() => err);
            })
          );
        // }

        // return throwError(() => error);
      })
    );
  }



}



