import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ProjectService } from '../../services/project';
import { TaskService } from '../../services/task';
import { LoadingService } from '../../services/loading';

export const authGuard: CanActivateFn = () => {
  const auth     = inject(AuthService);
  const router   = inject(Router);
  const projects = inject(ProjectService);
  const tasks    = inject(TaskService);
  const loading  = inject(LoadingService);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Déjà chargé — pas de spinner
  if (projects.projects().length > 0) {
    return true;
  }

  // Démarre le spinner et charge en arrière-plan
  loading.start();

  projects.fetchAll().subscribe({
    next: () => {
      const list = projects.projects();
      const fetches = [
        tasks.fetchAssigned(),
        ...list.map(p => tasks.fetchTasks(p.id, p.title)),
      ];

      if (fetches.length === 0) {
        loading.stop();
        return;
      }

      let done = 0;
      fetches.forEach(obs =>
        obs.subscribe({
          complete: () => { if (++done === fetches.length) loading.stop(); },
          error:    () => { if (++done === fetches.length) loading.stop(); },
        })
      );
    },
    error: () => loading.stop(),
  });

  return true;
};