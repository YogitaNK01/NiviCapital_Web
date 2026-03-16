import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';


@Injectable()

export class AuthInterceptor implements HttpInterceptor {
constructor(private router: Router) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const request = req.clone({ withCredentials: true });

    // return next.handle(
    //   req.clone({
    //     withCredentials: true
    //   })
    // );

     return next.handle(request).pipe(
    catchError((error) => {
      if (error.status === 401) {
        this.router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  )
  }

 
}
