import { Component, inject, signal } from '@angular/core';
import { TaskService, Task } from '../../services/task';
import { ProjectService, KanbanProject } from '../../services/project';
import { StatCardComponent }     from '../../components/stat-card/stat-card';
import { ProjectItemComponent }  from '../../components/project-item/project-item';
import { TaskItemComponent }     from '../../components/task-item/task-item';
import { TaskModalComponent }    from '../../components/task-modal/task-modal';
import { ProjectModalComponent } from '../../components/project-modal/project-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    StatCardComponent, ProjectItemComponent, TaskItemComponent,
    TaskModalComponent, ProjectModalComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  taskService    = inject(TaskService);
  projectService = inject(ProjectService);

  // ── état des modals ──────────────────────────────────────────────
  showTaskModal    = signal(false);
  showProjectModal = signal(false);
  taskToEdit         = signal<Task | null>(null);
  projectToEdit      = signal<KanbanProject | null>(null);  // ← KanbanProject
  preselectedProject = signal<string | null>(null);

  // ── tâches ───────────────────────────────────────────────────────
  onToggle(id: number) { this.taskService.toggleTask(id); }

  openCreateTask() {
    this.taskToEdit.set(null);
    this.preselectedProject.set(null);
    this.showTaskModal.set(true);
  }

  openEditTask(task: Task) {
    this.taskToEdit.set(task);
    this.preselectedProject.set(null);
    this.showTaskModal.set(true);
  }

  // ── projets ──────────────────────────────────────────────────────
  openCreateProject() {
    this.projectToEdit.set(null);
    this.showProjectModal.set(true);
  }

  // Convertit un Project (TaskService) en KanbanProject pour le modal
  openEditProject(project: any) {
    const kanban: KanbanProject = {
      id:          project.id,
      title:       project.name,
      description: project.description ?? '',
      color:       project.color ?? '#22c55e',
      members:     [],
      tasks:       [],
    };
    this.projectToEdit.set(kanban);
    this.showProjectModal.set(true);
  }
}