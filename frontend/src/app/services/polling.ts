import { Injectable, inject, OnDestroy } from '@angular/core';
import { ProjectService } from './project';
import { TaskService } from './task';

@Injectable({ providedIn: 'root' })
export class PollingService implements OnDestroy {

  private projectSvc = inject(ProjectService);
  private taskSvc    = inject(TaskService);
  private timer: any = null;
  private readonly INTERVAL = 30_000; // 30 secondes

  start() {
    if (this.timer) return; // déjà en cours
    this.timer = setInterval(() => this.refresh(), this.INTERVAL);
  }

  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  // Rafraîchit projets + tâches silencieusement (sans spinner)
  refresh() {
    this.projectSvc.fetchAll().subscribe({
      next: () => {
        const list = this.projectSvc.projects();
        this.taskSvc.fetchAssigned().subscribe();
        list.forEach(p => this.taskSvc.fetchTasks(p.id, p.title).subscribe());
      },
    });
  }

  ngOnDestroy() { this.stop(); }
}