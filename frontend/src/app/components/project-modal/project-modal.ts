import {
  Component, inject, signal, Output, EventEmitter, Input, OnInit
} from '@angular/core';
import { NgClass } from '@angular/common';
import { ProjectService, KanbanProject } from '../../services/project';

export type ProjectColor = 'teal' | 'blue' | 'purple' | 'pink' | 'orange' | 'red';

const COLOR_MAP: Record<ProjectColor, string> = {
  teal:   '#00e5a0',
  blue:   '#3b82f6',
  purple: '#a855f7',
  pink:   '#ec4899',
  orange: '#f97316',
  red:    '#ef4444',
};

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [NgClass],
  templateUrl: './project-modal.html',
  styleUrl: './project-modal.css'
})
export class ProjectModalComponent implements OnInit {

  @Input()  editProject: KanbanProject | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<KanbanProject>();

  svc = inject(ProjectService);

  name        = signal('');
  description = signal('');
  color       = signal<ProjectColor>('teal');
  visible     = signal(false);
  saving      = signal(false);
  errorMsg    = signal('');

  readonly colors: ProjectColor[] = ['teal', 'blue', 'purple', 'pink', 'orange', 'red'];

  // Méthode appelée dans le HTML pour obtenir le hex d'une couleur
  colorHex(c: ProjectColor): string {
    return COLOR_MAP[c];
  }

  ngOnInit() {
    if (this.editProject) {
      this.name.set(this.editProject.title);
      this.description.set(this.editProject.description);
      const entry = Object.entries(COLOR_MAP).find(([, v]) => v === this.editProject!.color);
      if (entry) this.color.set(entry[0] as ProjectColor);
    }
    requestAnimationFrame(() => this.visible.set(true));
  }

  save() {
    if (!this.name().trim()) return;

    const data = {
      title:       this.name().trim(),
      description: this.description().trim(),
      color:       COLOR_MAP[this.color()],
    };

    this.saving.set(true);
    this.errorMsg.set('');

    if (this.editProject) {
      this.svc.updateProject(this.editProject.id, data).subscribe({
        next: (updated: KanbanProject) => { this.saved.emit(updated); this.dismiss(); },
        error: (e: { error?: { message?: string } }) => {
          this.saving.set(false);
          this.errorMsg.set(e.error?.message ?? 'Erreur lors de la mise à jour.');
        },
      });
    } else {
      this.svc.addProject(data).subscribe({
        next: (project: KanbanProject) => { this.saved.emit(project); this.dismiss(); },
        error: (e: { error?: { message?: string } }) => {
          this.saving.set(false);
          this.errorMsg.set(e.error?.message ?? 'Erreur lors de la création.');
        },
      });
    }
  }

  dismiss() {
    this.visible.set(false);
    setTimeout(() => this.close.emit(), 280);
  }
}