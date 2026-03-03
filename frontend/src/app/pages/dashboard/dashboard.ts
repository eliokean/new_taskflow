import { Component, inject } from '@angular/core';
import { TaskService } from '../../services/task'; 
import { StatCardComponent } from '../../components/stat-card/stat-card';
import { ProjectItemComponent } from '../../components/project-item/project-item';
import { TaskItemComponent } from '../../components/task-item/task-item';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCardComponent, ProjectItemComponent, TaskItemComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  taskService = inject(TaskService);

  onToggle(id: number) {
    this.taskService.toggleTask(id);
  }
}