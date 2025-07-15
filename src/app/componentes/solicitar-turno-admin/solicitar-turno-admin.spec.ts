import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarTurnoAdmin } from './solicitar-turno-admin';

describe('SolicitarTurnoAdmin', () => {
  let component: SolicitarTurnoAdmin;
  let fixture: ComponentFixture<SolicitarTurnoAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarTurnoAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitarTurnoAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
