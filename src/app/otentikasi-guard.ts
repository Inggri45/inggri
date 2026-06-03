import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AUTH_COOKIE_USER_ID, decryptUserId } from './auth-crypto';

export const otentikasiGuard: CanActivateFn = (route, state) => {
  console.log('Otentikasi dimulai');

  const encryptedUserId = inject(CookieService).get(AUTH_COOKIE_USER_ID);
  const userId = decryptUserId(encryptedUserId);

  if (userId) {
    console.log('userId valid:', userId);
    return true;
  }

  inject(CookieService).delete(AUTH_COOKIE_USER_ID);
  inject(Router).navigate(['/login']);
  return false;
};
