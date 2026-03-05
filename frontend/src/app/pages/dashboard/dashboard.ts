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

  showTaskModal    = signal(false);
  showProjectModal = signal(false);
  taskToEdit         = signal<Task | null>(null);
  projectToEdit      = signal<KanbanProject | null>(null);
  preselectedProject = signal<string | null>(null);

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

  openCreateProject() {
    this.projectToEdit.set(null);
    this.showProjectModal.set(true);
  }

  openEditProject(project: KanbanProject) {
    this.projectToEdit.set(project);
    this.showProjectModal.set(true);
  }
}