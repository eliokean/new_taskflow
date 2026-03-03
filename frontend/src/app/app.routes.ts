import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { TasksComponent } from './pages/tasks/tasks';
import { CalendarComponent } from './pages/calendar/calendar';
import { TeamComponent } from './pages/team/team';
import { ProjectsComponent } from './pages/project/project';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent }   from './pages/login/login';
import { RegisterComponent } from './pages/register/register';


export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '',   component: LandingComponent },
      { path: 'login',     component: LoginComponent },
      { path: 'register',  component: RegisterComponent },
      { path: 'dashboard', component: Dashboard },
      { path: 'tasks', component: TasksComponent },    // Enable tasks page
      { path: 'calendar', component: CalendarComponent },
      { path: 'team', component: TeamComponent },
      { path: 'projects', component: ProjectsComponent },
      // { path: 'calendar', component: CalendarComponent },
    ]
  }
];