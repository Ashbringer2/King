// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
  success?: boolean;
  requires2FA?: boolean;  // if you ever re-enable
}

interface StatusResponse {
  authenticated: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      '/api/auth/login',
      { email, password },
      { withCredentials: true }
    );
  }

  // New: check if session is alive
  status(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>('/api/auth/status', { withCredentials: true });
  }
}
