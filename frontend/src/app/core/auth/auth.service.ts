import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  provider?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8000/api'; // ← adapte à ton URL

  // Signals réactifs
  currentUser = signal<User | null>(this.loadUserFromStorage());
  isLoggedIn  = signal<boolean>(!!localStorage.getItem('token'));

  constructor(private http: HttpClient, private router: Router) {}

  // ──────────────────────────────────────────────
  // REGISTER
  // ──────────────────────────────────────────────
  register(data: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/register`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  // ──────────────────────────────────────────────
  // LOGIN
  // ──────────────────────────────────────────────
  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  // ──────────────────────────────────────────────
  // LOGOUT
  // ──────────────────────────────────────────────
  logout(): void {
    this.http.post(`${this.API}/auth/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error:    () => this.clearSession(), // nettoyer même si erreur réseau
    });
  }

  // ──────────────────────────────────────────────
  // OAUTH — demander l'URL et rediriger le navigateur
  // ──────────────────────────────────────────────
  loginWithProvider(provider: 'google' | 'github'): void {
    this.http.get<{ url: string }>(`${this.API}/auth/oauth/${provider}/redirect`).subscribe({
      next: ({ url }) => window.location.href = url,
    });
  }

  // ──────────────────────────────────────────────
  // OAUTH — gérer le callback (appelé depuis OAuthCallbackComponent)
  // ──────────────────────────────────────────────
  handleOAuthCallback(provider: string): Observable<AuthResponse> {
    // Laravel redirige vers /oauth/callback?provider=google&code=...
    // Angular relit les query params et envoie au backend
    const params = new URLSearchParams(window.location.search);
    const code  = params.get('code')  ?? '';
    const state = params.get('state') ?? '';

    return this.http
      .get<AuthResponse>(`${this.API}/auth/oauth/${provider}/callback?code=${code}&state=${state}`)
      .pipe(tap(res => this.handleAuthSuccess(res)));
  }

  // ──────────────────────────────────────────────
  // ME
  // ──────────────────────────────────────────────
  fetchMe(): Observable<User> {
    return this.http.get<User>(`${this.API}/auth/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  // ──────────────────────────────────────────────
  // Helpers privés
  // ──────────────────────────────────────────────
  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user',  JSON.stringify(res.user));
    this.currentUser.set(res.user);
    this.isLoggedIn.set(true);
    this.router.navigate(['/dashboard']);
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  private loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}