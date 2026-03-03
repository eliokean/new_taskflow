import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  private observer!: IntersectionObserver;
  private rafId = 0;
  private mx = 0; private my = 0;

  stats = [
    { num: '12k+', label: 'Teams active' },
    { num: '98%',  label: 'Satisfaction' },
    { num: '3x',   label: 'Faster delivery' },
    { num: '4.9★', label: 'App Store' },
  ];

  features = [
    { icon: 'team',     color: 'purple', title: 'Team Collaboration', desc: 'Assign tasks, mention teammates and keep everyone in sync with instant notifications.' },
    { icon: 'calendar', color: 'orange', title: 'Smart Calendar',     desc: 'Never miss a deadline. Get intelligent scheduling suggestions based on your workload.' },
    { icon: 'chart',    color: 'blue',   title: 'Analytics',          desc: 'Understand your team velocity with burndown charts and custom dashboards.' },
    { icon: 'shield',   color: 'green',  title: 'Enterprise Security', desc: 'SOC2 compliant with end-to-end encryption, SSO, and granular permission controls.' },
  ];

  ngAfterViewInit() {
    this.initReveal();
    this.initCursor();
  }

  private initReveal() {
    this.observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => this.observer.observe(el));
  }

  private initCursor() {
    let rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { this.mx = e.clientX; this.my = e.clientY; });
    const ring = document.getElementById('c-ring');
    const dot  = document.getElementById('c-dot');
    const loop = () => {
      if (dot)  { dot.style.left = this.mx + 'px'; dot.style.top = this.my + 'px'; }
      if (ring) { rx += (this.mx - rx) * 0.12; ry += (this.my - ry) * 0.12; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll('a,button').forEach(el => {
      el.addEventListener('mouseenter', () => { if (dot) dot.style.transform = 'translate(-50%,-50%) scale(3)'; });
      el.addEventListener('mouseleave', () => { if (dot) dot.style.transform = 'translate(-50%,-50%) scale(1)'; });
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    cancelAnimationFrame(this.rafId);
  }
}