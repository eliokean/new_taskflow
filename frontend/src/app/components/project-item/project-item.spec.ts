import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectItem } from './project-item';

describe('ProjectItem', () => {
  let component: ProjectItem;
  let fixture: ComponentFixture<ProjectItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
