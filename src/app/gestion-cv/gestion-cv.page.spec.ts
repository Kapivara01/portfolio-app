import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionCvPage } from './gestion-cv.page';

describe('GestionCvPage', () => {
  let component: GestionCvPage;
  let fixture: ComponentFixture<GestionCvPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionCvPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
