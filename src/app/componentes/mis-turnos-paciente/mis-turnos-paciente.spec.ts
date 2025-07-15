import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisTurnosPaciente } from './mis-turnos-paciente';

describe('MisTurnosPaciente', () => {
  let component: MisTurnosPaciente;
  let fixture: ComponentFixture<MisTurnosPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisTurnosPaciente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisTurnosPaciente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
