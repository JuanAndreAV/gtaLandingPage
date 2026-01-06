import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  standalone: true
})
export class LoginPageComponent {
  private router = inject(Router);
  fb = inject(FormBuilder);
  hasError = signal(false);
  isPosting = signal(false);
  errorMessage= signal('Por favor verifica la información ingresada');

  authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['',[Validators.required, Validators.email]],
    password: ['',[Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 3000);
      return;
    }
    const { email = '', password = '' } = this.loginForm.value;
    this.authService.login(email!, password!).subscribe(isAuthenticated => {
      //console.log(isAuthenticated);
      if (isAuthenticated) {
          this.router.navigateByUrl('/admin');
          return;
      } else {
        this.hasError.set(true);
      }
    })
  }


}
