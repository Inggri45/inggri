import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';
import { otentikasiGuard } from './otentikasi-guard';
import { AUTH_COOKIE_USER_ID, AUTH_COOKIE_KEY } from './auth-crypto';

class MockRouter {
  navigate(commands: unknown[]): void {
    return;
  }
}

describe('otentikasiGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => otentikasiGuard(...guardParameters));

  let cookieService: CookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [CookieService, { provide: Router, useClass: MockRouter }],
    });
    cookieService = TestBed.inject(CookieService);
    cookieService.deleteAll();
  });

  it('should return false when the auth cookie is missing', () => {
    cookieService.delete(AUTH_COOKIE_USER_ID);
    expect(executeGuard()).toBeFalse();
  });

  it('should return true when the auth cookie decrypts successfully', () => {
    const encryptedUserId = CryptoJS.AES.encrypt('testUser', AUTH_COOKIE_KEY).toString();
    cookieService.set(AUTH_COOKIE_USER_ID, encryptedUserId);
    expect(executeGuard()).toBeTrue();
  });
});
