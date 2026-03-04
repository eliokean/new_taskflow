import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  name     = '';
  email    = '';
  password = '';

  showPassword = signal(false);
  loading      = signal(false);
  success      = signal(false);
  errorMsg     = signal('');
  strength     = signal(0);
  strengthLabel = signal('');

  constructor(private auth: AuthService) {}

  togglePassword() { this.showPassword.update(v => !v); }

  checkStrength() {
    let s = 0;
    if (this.password.length >= 8)       s++;
    if (/[A-Z]/.test(this.password))     s++;
    if (/[0-9]/.test(this.password))     s++;
    if (/[^A-Za-z0-9]/.test(this.password)) s++;
    this.strength.set(s);
    this.strengthLabel.set(['', 'Faible', 'Moyen', 'Bien', 'Fort'][s]);
  }

  onSubmit() {
    if (!this.name || !this.email || !this.password) return;

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.success.set(true);
        // La redirection vers /dashboard est gérée dans AuthService
      },
      error: (e) => {
        this.loading.set(false);

        // Gérer les erreurs de validation Laravel (422)
        if (e.error?.errors) {
          const first = Object.values(e.error.errors)[0] as string[];
          this.errorMsg.set(first[0]);
        } else {
          this.errorMsg.set(e.error?.message ?? 'Une erreur est survenue.');
        }
      },
    });
  }

  loginWithGoogle() { this.auth.loginWithProvider('google'); }
}