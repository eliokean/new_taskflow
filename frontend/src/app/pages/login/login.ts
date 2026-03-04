import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email    = '';
  password = '';
  remember = false;

  showPassword = signal(false);
  loading      = signal(false);
  success      = signal(false);
  errorMsg     = signal('');

  constructor(private auth: AuthService) {}

  togglePassword() { this.showPassword.update(v => !v); }

  onSubmit() {
    if (!this.email || !this.password) return;

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.success.set(true);
        // La redirection vers /dashboard est gérée dans AuthService
      },
      error: (e) => {
        this.loading.set(false);
        this.errorMsg.set(e.error?.message ?? 'Identifiants incorrects.');
      },
    });
  }

  loginWithGoogle() { this.auth.loginWithProvider('google'); }
  loginWithGithub() { this.auth.loginWithProvider('github'); }
}