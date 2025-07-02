// src/app/guards/auth.guard.ts

import { CanMatchFn, UrlTree, Router } from '@angular/router';
import { inject }                      from '@angular/core';
import { AuthService }                 from '../pages/service/auth.service';  // ← updated path
import { map, catchError }             from 'rxjs/operators';
import { of, Observable }              from 'rxjs';

export const authGuard: CanMatchFn = (
  route,
  segments
): Observable<boolean | UrlTree> => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  return auth.status().pipe(
    map(res => res.authenticated
      ? true
      : router.createUrlTree(['/auth','login'])
    ),
    catchError(() => of(router.createUrlTree(['/auth','login'])))
  );
};
