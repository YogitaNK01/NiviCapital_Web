import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { Authservice } from '../service/authservice';
import { catchError, map, of } from 'rxjs';


const checkAuth = (state: any) => {
  const router = inject(Router);
  const authService = inject(Authservice);

  return authService.checkLogin().pipe(
    map(() => true),
    catchError(() => {
      return of(router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      }));
    })
  );
};


export const authguardGuard: CanActivateFn = (route, state) => {
  return checkAuth(state);
};

export const authguardChildGuard: CanActivateChildFn = (route, state) => {
  return checkAuth(state);
};
