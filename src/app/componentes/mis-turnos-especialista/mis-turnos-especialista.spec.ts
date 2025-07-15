import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisTurnosEspecialista } from './mis-turnos-especialista';

describe('MisTurnosEspecialista', () => {
  let component: MisTurnosEspecialista;
  let fixture: ComponentFixture<MisTurnosEspecialista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisTurnosEspecialista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisTurnosEspecialista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
