import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { ProjectService, KanbanProject, KanbanTask } from '../../services/project';
import { ProjectModalComponent } from '../../components/project-modal/project-modal';
import { TaskModalComponent }    from '../../components/task-modal/task-modal';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgClass, ProjectModalComponent, TaskModalComponent],
  templateUrl: './project.html',
  styleUrl: './project.css'
})
export class ProjectsComponent implements OnInit {
  projectService = inject(ProjectService);

  showProjectModal = signal(false);
  showTaskModal    = signal(false);

  projectToEdit  = signal<KanbanProject | null>(null);
  activeProject  = signal<KanbanProject | null>(null);

  ngOnInit() {
    if (this.projectService.projects().length === 0) {
      this.projectService.fetchAll().subscribe();
    }
  }

  getTasksByStatus(project: KanbanProject, status: string): KanbanTask[] {
    return project.tasks.filter(t => t.status === status);
  }

  // ── Projet ──────────────────────────────────────────────────────
  openNewProject() {
    this.projectToEdit.set(null);
    this.showProjectModal.set(true);
  }

  openEditProject(project: KanbanProject) {
    this.projectToEdit.set(project);
    this.showProjectModal.set(true);
  }

  deleteProject(id: number, event: Event) {
    event.stopPropagation();
    this.projectService.deleteProject(id).subscribe({
      error: (e) => console.error('Erreur suppression:', e),
    });
  }

  // ── Tâche ───────────────────────────────────────────────────────
  openAddTask(project: KanbanProject, event: Event) {
    event.stopPropagation();
    this.activeProject.set(project);
    this.showTaskModal.set(true);
  }
}