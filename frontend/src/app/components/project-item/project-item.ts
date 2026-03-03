import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { Project } from '../../services/task';

@Component({
  selector: 'app-project-item',
  standalone: true,
  imports: [NgClass],
  templateUrl: './project-item.html',
  styleUrl: './project-item.css'
})
export class ProjectItemComponent {
  @Input() project!: Project;
}