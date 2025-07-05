import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
    AppFloatingConfigurator
  ],
  providers: [MessageService],
  template: `
    <app-floating-configurator />

    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
      <div class="flex flex-col items-center justify-center">
        <div style="border-radius:56px; padding:0.3rem; background:linear-gradient(180deg, var(--primary-color) 10%, rgba(33,150,243,0) 30%)">
          <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius:53px">
            <div class="text-center mb-8">
              <!-- SVG logo omitted for brevity -->
              <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
                Welcome to PrimeLand!
              </div>
              <span class="text-muted-color font-medium">Sign in to continue</span>
            </div>

            <form (ngSubmit)="onSubmit()" class="space-y-6">
              <label for="email1" class="block text-xl font-medium mb-2">Email</label>
              <input
                pInputText
                id="email1"
                type="email"
                name="email"
                [(ngModel)]="email"
                placeholder="Email address"
                required
                class="w-full md:w-[30rem] mb-4"
              />

              <label for="password1" class="block text-xl font-medium mb-2">Password</label>
              <p-password
                id="password1"
                name="password"
                [(ngModel)]="password"
                placeholder="Password"
                [toggleMask]="true"
                [feedback]="false"
                class="w-full md:w-[30rem] mb-4"
              ></p-password>

              <div class="flex items-center justify-between mb-8">
                <div class="flex items-center">
                  <p-checkbox
                    [(ngModel)]="checked"
                    name="remember"
                    binary
                    class="mr-2"
                  ></p-checkbox>
                  <label for="rememberme1">Remember me</label>
                </div>
                <a class="font-medium text-primary cursor-pointer">Forgot password?</a>
              </div>

              <button
                pButton
                type="submit"
                label="Sign In"
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
  email: string = '';
  password: string = '';
  checked: boolean = false;

  private auth = inject(AuthService);
  private router = inject(Router);
  private msg = inject(MessageService);

  ngOnInit() {}

  onSubmit() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/app']);
      },
      error: (err: any) => {
        this.msg.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: err.error?.message || 'Invalid email or password'
        });
      }
    });
  }
}

// so `import { Login } from './login'` still works
export { LoginComponent as Login };
