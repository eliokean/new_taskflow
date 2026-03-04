import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { TasksComponent } from './pages/tasks/tasks';
import { CalendarComponent } from './pages/calendar/calendar';
import { TeamComponent } from './pages/team/team';
import { ProjectsComponent } from './pages/project/project';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { OAuthCallbackComponent } from './pages/oauth-callback/oauth-callback.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // ── Pages publiques (sans sidebar) ──────────────────────────────
  { path: '',         component: LandingComponent },
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // ── Callback OAuth (Google / GitHub redirigent ici) ─────────────
  { path: 'oauth/callback/:provider', component: OAuthCallbackComponent },

  // ── Pages protégées (avec sidebar + authGuard) ───────────────────
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'tasks',     component: TasksComponent },
      { path: 'calendar',  component: CalendarComponent },
      { path: 'team',      component: TeamComponent },
      { path: 'projects',  component: ProjectsComponent },
    ],
  },

  { path: '**', redirectTo: '' },
];