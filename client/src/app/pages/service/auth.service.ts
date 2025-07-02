// src/app/services/auth.service.ts

import { Injectable }    from '@angular/core';
import { HttpClient }    from '@angular/common/http';
import { Observable }    from 'rxjs';

interface LoginResponse {
  requires2FA: boolean;
  // ...any other fields your API returns
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password });
  }

  verify2FA(email: string, code: string): Observable<void> {
    return this.http.post<void>('/api/auth/verify-2fa', { email, code });
  }
}
