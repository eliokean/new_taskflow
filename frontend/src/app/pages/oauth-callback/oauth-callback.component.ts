import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#080a0f;color:#e8edf5;font-family:sans-serif;flex-direction:column;gap:16px">
      <div class="spinner" style="width:32px;height:32px;border:3px solid rgba(255,255,255,.1);border-top-color:#00e5a0;border-radius:50%;animation:spin .7s linear infinite"></div>
      <p style="color:#5a6478">Connexion en cours...</p>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>
  `,
})
export class OAuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const provider = this.route.snapshot.paramMap.get('provider') ?? 'google';

    this.auth.handleOAuthCallback(provider).subscribe({
      error: () => {
        // En cas d'erreur, rediriger vers login
        window.location.href = '/login';
      },
    });
  }
}