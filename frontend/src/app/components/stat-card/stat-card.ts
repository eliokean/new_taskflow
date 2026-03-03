import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = 0;
  @Input() color: 'purple' | 'teal' | 'orange' = 'purple';
  @Input() icon: 'tasks' | 'check' | 'alert' = 'tasks';
}