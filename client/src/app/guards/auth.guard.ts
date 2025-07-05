// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanMatch, Router, UrlTree } from '@angular/router';
import { AuthService } from '../pages/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanMatch {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canMatch(): boolean | UrlTree {
    return this.auth.isLoggedIn()
      ? true
      : this.router.parseUrl('/auth/login');
  }
}
