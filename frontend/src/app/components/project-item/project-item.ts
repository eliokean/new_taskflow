import { Component, Input } from '@angular/core';
import { KanbanProject } from '../../services/project';

@Component({
  selector: 'app-project-item',
  standalone: true,
  imports: [],
  templateUrl: './project-item.html',
  styleUrl: './project-item.css'
})
export class ProjectItemComponent {
  @Input() project!: KanbanProject;

  get taskCount(): number {
    return this.project.tasks.length;
  }

  get progress(): number {
    const total = this.project.tasks.length;
    if (total === 0) return 0;
    const done = this.project.tasks.filter(t => t.status === 'completed').length;
    return Math.round((done / total) * 100);
  }
}