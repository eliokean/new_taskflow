import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { LoadingService } from '../../services/loading';
import { PollingService } from '../../services/polling';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  loading = inject(LoadingService);
  polling = inject(PollingService);

  ngOnInit()    { this.polling.start(); }
  ngOnDestroy() { this.polling.stop();  }
}