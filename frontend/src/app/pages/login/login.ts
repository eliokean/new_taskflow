import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  remember = false;
  showPassword = signal(false);
  loading = signal(false);
  success = signal(false);

  togglePassword() { this.showPassword.update(v => !v); }

  onSubmit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    setTimeout(() => { this.loading.set(false); this.success.set(true); }, 1400);
  }
}