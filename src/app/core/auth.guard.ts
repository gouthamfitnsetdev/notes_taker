import { Injector, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take, timeout, catchError } from 'rxjs';
import { of } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const injector = inject(Injector);

  if (!auth.loading()) {
    return auth.user() ? true : router.createUrlTree(['/login']);
  }

  return toObservable(auth.loading, { injector }).pipe(
    filter(loading => !loading),
    take(1),
    timeout(5000),
    map(() => (auth.user() ? true : router.createUrlTree(['/login']))),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
