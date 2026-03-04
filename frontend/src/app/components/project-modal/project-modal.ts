import {
  Component, inject, signal, Output, EventEmitter, Input, OnInit
} from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { TaskService, Project, ProjectColor } from '../../services/task';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [NgClass, NgFor],
  templateUrl: './project-modal.html',
  styleUrl: './project-modal.css'
})
export class ProjectModalComponent implements OnInit {

  @Input()  editProject: Project | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Project>();

  svc = inject(TaskService);

  name        = signal('');
  description = signal('');
  color       = signal<ProjectColor>('teal');
  visible     = signal(false);

  readonly colors: ProjectColor[] = ['teal', 'blue', 'purple'];

  ngOnInit() {
    if (this.editProject) {
      this.name.set(this.editProject.name);
      this.description.set(this.editProject.description);
      this.color.set(this.editProject.color);
    }
    requestAnimationFrame(() => this.visible.set(true));
  }

  save() {
    if (!this.name().trim()) return;
    if (this.editProject) {
      this.svc.updateProject(this.editProject.id, {
        name:        this.name(),
        description: this.description(),
        color:       this.color(),
      });
      this.saved.emit(this.svc.getProject(this.editProject.id)!);
    } else {
      const p = this.svc.addProject(this.name(), this.description(), this.color());
      this.saved.emit(p);
    }
    this.dismiss();
  }

  dismiss() {
    this.visible.set(false);
    setTimeout(() => this.close.emit(), 280);
  }
}