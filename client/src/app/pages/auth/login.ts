// src/app/pages/auth/login.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }               from '@angular/common';               // for *ngIf
import { FormsModule }                from '@angular/forms';
import { RouterModule, Router }       from '@angular/router';
import { ButtonModule }               from 'primeng/button';
import { CheckboxModule }             from 'primeng/checkbox';
import { InputTextModule }            from 'primeng/inputtext';
import { PasswordModule }             from 'primeng/password';
import { RippleModule }               from 'primeng/ripple';
import { MessageService }             from 'primeng/api';
import { AppFloatingConfigurator }    from '../../layout/component/app.floatingconfigurator';
import { AuthService }                from '../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    RippleModule,
    AppFloatingConfigurator
  ],
  providers: [ MessageService ],
  template: `
    <app-floating-configurator />

    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
      <div class="flex flex-col items-center justify-center">
        <div
          style="border-radius:56px; padding:0.3rem; background:linear-gradient(180deg, var(--primary-color) 10%, rgba(33,150,243,0) 30%)"
        >
          <div
            class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20"
            style="border-radius:53px"
          >
            <div class="text-center mb-8">
              <!-- logo and heading SVG omitted for brevity -->
              <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
                Welcome to PrimeLand!
              </div>
              <span class="text-muted-color font-medium">Sign in to continue</span>
            </div>

            <form (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Step 1: credentials -->
              <ng-container *ngIf="step === 1">
                <div>
                  <label for="email" class="block text-xl font-medium mb-2">Email</label>
                  <input
                    id="email"
                    pInputText
                    type="email"
                    name="email"
                    [(ngModel)]="email"
                    placeholder="Email address"
                    required
                    class="w-full md:w-[30rem] mb-4"
                  />
                </div>
                <div>
                  <label for="password" class="block text-xl font-medium mb-2">Password</label>
                  <p-password
                    id="password"
                    name="password"
                    [(ngModel)]="password"
                    placeholder="Password"
                    [toggleMask]="true"
                    [feedback]="false"
                    class="w-full md:w-[30rem] mb-4"
                  ></p-password>
                </div>
              </ng-container>

              <!-- Step 2: 2FA code -->
              <ng-container *ngIf="step === 2">
                <div>
                  <label for="totp" class="block text-xl font-medium mb-2">2FA Code</label>
                  <input
                    id="totp"
                    pInputText
                    type="text"
                    name="totp"
                    [(ngModel)]="totp"
                    maxlength="6"
                    placeholder="Enter authentication code"
                    required
                    class="w-full md:w-[30rem] mb-4"
                  />
                </div>
              </ng-container>

              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <p-checkbox
                    [(ngModel)]="remember"
                    name="remember"
                    binary
                    class="mr-2"
                  ></p-checkbox>
                  <label for="remember">Remember me</label>
                </div>
                <a class="font-medium text-primary cursor-pointer">Forgot password?</a>
              </div>

              <button
                pButton
                type="submit"
                label="{{ step === 1 ? 'Sign In' : 'Verify 2FA' }}"
                class="w-full"
              ></button>
            </form>

          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private msg    = inject(MessageService);

  email     = '';
  password  = '';
  totp      = '';
  remember  = false;
  step      = 1; // 1 = credentials, 2 = 2FA

  ngOnInit() {}

  onSubmit() {
    if (this.step === 1) {
      this.auth.login(this.email, this.password).subscribe({
        next: res => {
          if (res.requires2FA) {
            this.step = 2;
            this.msg.add({
              severity: 'info',
              summary: '2FA Required',
              detail: 'Enter the code from your authenticator app'
            });
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err: unknown) => {
          const e = err as any;
          this.msg.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: e.error?.message || 'Invalid email or password'
          });
        }
      });
    } else {
      this.auth.verify2FA(this.email, this.totp).subscribe({
        next: () => this.router.navigate(['/']),
        error: () => {
          this.msg.add({
            severity: 'error',
            summary: '2FA Verification Failed',
            detail: 'The code you entered is incorrect'
          });
        }
      });
    }
  }
}

// this export makes `import { Login } from './login'` work:
export { LoginComponent as Login };
