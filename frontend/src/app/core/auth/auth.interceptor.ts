import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token  = localStorage.getItem('token');

  // Cloner la requête et injecter le token Bearer
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization:  `Bearer ${token}`,
          Accept:         'application/json',
          'Content-Type': 'application/json',
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token expiré ou invalide → rediriger vers login
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};