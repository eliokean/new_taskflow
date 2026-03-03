import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, KanbanProject, KanbanTask } from '../../services/project';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './project.html',
  styleUrl: './project.css'
})
export class ProjectsComponent {
  projectService = inject(ProjectService);

  showNewProjectModal = signal(false);
  showNewTaskModal = signal(false);
  activeProjectId = signal<number | null>(null);

  newProjectTitle = '';
  newProjectDescription = '';
  newProjectColor = '#22c55e';

  newTaskTitle = '';
  newTaskPriority: 'High' | 'Medium' | 'Low' | null = 'High';
  newTaskStatus: 'to-do' | 'in-progress' | 'completed' = 'to-do';

  projectColors = ['#22c55e', '#f97316', '#6366f1', '#06b6d4', '#ec4899', '#a855f7', '#eab308'];

  getTasksByStatus(project: KanbanProject, status: string): KanbanTask[] {
    return project.tasks.filter(t => t.status === status);
  }

  openAddTask(projectId: number) {
    this.activeProjectId.set(projectId);
    this.newTaskTitle = '';
    this.newTaskPriority = 'High';
    this.newTaskStatus = 'to-do';
    this.showNewTaskModal.set(true);
  }

  openNewProject() {
    this.newProjectTitle = '';
    this.newProjectDescription = '';
    this.newProjectColor = '#22c55e';
    this.showNewProjectModal.set(true);
  }

  submitProject() {
    if (!this.newProjectTitle.trim()) return;
    this.projectService.addProject({
      title: this.newProjectTitle.trim(),
      description: this.newProjectDescription.trim(),
      color: this.newProjectColor,
    });
    this.showNewProjectModal.set(false);
  }

  submitTask() {
    if (!this.newTaskTitle.trim() || this.activeProjectId() === null) return;
    this.projectService.addTask(this.activeProjectId()!, {
      title: this.newTaskTitle.trim(),
      status: this.newTaskStatus,
      priority: this.newTaskPriority,
      assignee: { initials: 'ME', color: '#6366f1' },
    });
    this.showNewTaskModal.set(false);
  }

  deleteProject(id: number) {
    this.projectService.deleteProject(id);
  }
}