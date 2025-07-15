import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriasClinicasEspecialista } from './historias-clinicas-especialista';

describe('HistoriasClinicasEspecialista', () => {
  let component: HistoriasClinicasEspecialista;
  let fixture: ComponentFixture<HistoriasClinicasEspecialista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriasClinicasEspecialista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriasClinicasEspecialista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
