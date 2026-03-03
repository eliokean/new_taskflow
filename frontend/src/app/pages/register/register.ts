import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  showPassword = signal(false);
  loading = signal(false);
  success = signal(false);

  strength = signal(0);
  strengthLabel = signal('');

  togglePassword() { this.showPassword.update(v => !v); }

  checkStrength() {
    let s = 0;
    if (this.password.length >= 8) s++;
    if (/[A-Z]/.test(this.password)) s++;
    if (/[0-9]/.test(this.password)) s++;
    if (/[^A-Za-z0-9]/.test(this.password)) s++;
    this.strength.set(s);
    this.strengthLabel.set(['', 'Weak', 'Fair', 'Good', 'Strong'][s]);
  }

  onSubmit() {
    if (!this.name || !this.email || !this.password) return;
    this.loading.set(true);
    setTimeout(() => { this.loading.set(false); this.success.set(true); }, 1400);
  }
}