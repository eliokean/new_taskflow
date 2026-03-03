import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar';
import { TaskService } from './services/task';
import { Dashboard } from './pages/dashboard/dashboard';



@Component({
  selector: 'app-root',
  imports: [SidebarComponent, Dashboard, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
