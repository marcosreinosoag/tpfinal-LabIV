import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Supabase } from '../../servicios/supabase';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './historia-clinica.html',
  styleUrls: ['./historia-clinica.scss']
})
export class HistoriaClinica implements OnInit {
  formHistoria: FormGroup;
  mostrarFormulario: boolean = false;
  turno: any;
  turnoId: string = '';

  constructor(
    private fb: FormBuilder,
    private supabase: Supabase,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formHistoria = this.fb.group({
      altura: ['', [Validators.required]],
      peso: ['', [Validators.required]],
      temperatura: ['', [Validators.required]],
      presion: ['', [Validators.required]],
      rangoDinamico: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      valorNumerico: ['', [Validators.required]],
      switchSiNo: [false, [Validators.required]],
      datosExtra: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.turnoId = this.route.snapshot.paramMap.get('id') || '';
    if (this.turnoId) {
      this.cargarTurno(this.turnoId);
    }
  }

  get datosExtra(): FormArray {
    return this.formHistoria.get('datosExtra') as FormArray;
  }

  agregarDatoExtra() {
    if (this.datosExtra.length < 3) {
      this.datosExtra.push(this.fb.group({
        clave: ['', Validators.required],
        valor: ['', Validators.required]
      }));
    }
  }

  eliminarDatoExtra(index: number) {
    this.datosExtra.removeAt(index);
  }

  async cargarTurno(turnoId: string) {
    const { data, error } = await this.supabase.supabase
      .from('turnos')
      .select('*')
      .eq('id', turnoId)
      .single();

    if (error || !data) {
      console.error('Error al cargar el turno:', error);
      return;
    }

    this.turno = data;

    if (data.estado === 'realizado') {
      // Verificar si ya hay historia clínica cargada
      const { data: historiaExistente } = await this.supabase.supabase
        .from('historia_clinica')
        .select('id')
        .eq('turno_id', this.turnoId)
        .single();


      if (historiaExistente) {
        this.mostrarFormulario = false;
        Swal.fire({
          icon: 'info',
          title: 'Historia clínica existente',
          text: 'Ya se ha cargado la historia clínica de este paciente.',
          confirmButtonText: 'Aceptar'
        });
      } else {
        this.mostrarFormulario = true;
      }
    }
  }

  async guardarHistoria() {
    if (!this.turno || !this.formHistoria.valid) {
      console.warn('Turno no cargado o formulario inválido');
      return;
    }

    const valores = this.formHistoria.value;

  // Combinar los 3 campos dinámicos con los datos extra opcionales
  const datosDinamicos = {
    rangoDinamico: valores.rangoDinamico,
    valorNumerico: parseFloat(String(valores.valorNumerico).replace(',', '.')) || 0,
    switchSiNo: valores.switchSiNo ? 'Si' : 'No',
    ...this.transformarExtras(valores.datosExtra)
  };

  const historia = {
    turno_id: this.turno.id,
    paciente_id: this.turno.paciente,
    especialista_id: this.turno.especialista,
    fecha: new Date().toISOString(),
    altura: parseFloat(String(valores.altura).replace(',', '.')),
    peso: parseFloat(String(valores.peso).replace(',', '.')),
    temperatura: parseFloat(String(valores.temperatura).replace(',', '.')),
    presion: parseFloat(String(valores.presion).replace(',', '.')),
    datos_extra: datosDinamicos
  };

    const { error } = await this.supabase.supabase
      .from('historia_clinica')
      .insert(historia);

    if (error) {
      console.error('❌ Error al guardar historia clínica:', error);
      Swal.fire('Error', 'No se pudo guardar la historia clínica.', 'error');
    } else {
      Swal.fire('Guardado', '✅ Historia clínica guardada con éxito.', 'success');
      this.formHistoria.reset();
      this.datosExtra.clear();
      this.mostrarFormulario = false;
       this.router.navigate(['/mis-turnos-especialista']);
    }
  }

  transformarExtras(extras: any[]): Record<string, string> {
    const resultado: any = {};
    for (let item of extras) {
      resultado[item.clave] = item.valor;
    }
    return resultado;
  }

    goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
