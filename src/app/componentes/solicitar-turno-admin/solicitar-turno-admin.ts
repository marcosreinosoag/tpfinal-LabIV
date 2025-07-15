import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Supabase } from '../../servicios/supabase';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitar-turno-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './solicitar-turno-admin.html',
  styleUrls: ['./solicitar-turno-admin.scss']
})
export class SolicitarTurnoAdmin implements OnInit {
  formTurno!: FormGroup;
  especialistas: any[] = [];
  pacientes: any[] = [];
  especialidades: string[] = [];
  disponibilidadAgrupada: { [fecha: string]: string[] } = {};
  especialistaSeleccionado: any = null;
  Object = Object;

  constructor(
    private fb: FormBuilder,
    private supabase: Supabase,
    private router: Router
  ) {}

  async ngOnInit() {
    this.formTurno = this.fb.group({
      pacienteId: ['', Validators.required],
      especialistaId: ['', Validators.required],
      especialidad: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });

    const { data: especialistas } = await this.supabase.supabase
      .from('usuarios')
      .select('id, nombre, apellido, mail, especialidades, fotoPerfil, estado')
      .eq('rol', 'Especialista')
      .eq('estado', 'activo');
    this.especialistas = especialistas || [];

    const { data: pacientes } = await this.supabase.supabase
      .from('usuarios')
      .select('id, nombre, apellido, mail')
      .eq('rol', 'Paciente')
    this.pacientes = pacientes || [];
  }

  onEspecialistaChange() {
    const id = this.formTurno.value.especialistaId;
    this.especialistaSeleccionado = this.especialistas.find(e => e.id === id);
    const raw = this.especialistaSeleccionado?.especialidades;

    try {
      if (Array.isArray(raw)) {
        this.especialidades = raw;
      } else if (typeof raw === 'string' && raw.trim().startsWith('[')) {
        this.especialidades = JSON.parse(raw);
      } else if (typeof raw === 'string') {
        this.especialidades = raw.split(',').map(e => e.trim());
      } else {
        this.especialidades = [];
      }
    } catch {
      this.especialidades = [];
    }

    this.formTurno.patchValue({ especialidad: '', fecha: '', hora: '' });
    this.disponibilidadAgrupada = {};
  }

  async cargarDisponibilidadAgrupada() {
    const { especialistaId, especialidad } = this.formTurno.value;
    if (!especialistaId || !especialidad) return;

    const espLimpia = typeof especialidad === 'string' && especialidad.startsWith('[')
      ? JSON.parse(especialidad)[0]
      : especialidad;

    const { data, error } = await this.supabase.supabase
      .from('disponibilidad')
      .select('fecha, inicio')
      .eq('especialista_id', especialistaId)
      .ilike('especialidad', `%${espLimpia}%`)
      .eq('estado', 'disponible');

    if (error) {
      console.error('Error al cargar disponibilidad agrupada:', error);
      return;
    }

    const agrupado: { [fecha: string]: string[] } = {};
    for (const item of data || []) {
      if (!agrupado[item.fecha]) agrupado[item.fecha] = [];
      agrupado[item.fecha].push(item.inicio);
    }

    for (const key in agrupado) {
      agrupado[key].sort((a, b) => a.localeCompare(b));
    }

    this.disponibilidadAgrupada = agrupado;
  }

 async solicitarTurno() {
  if (this.formTurno.invalid || !this.especialistaSeleccionado) return;

  const { pacienteId, especialistaId, especialidad, fecha, hora } = this.formTurno.value;
  const dia = this.obtenerNombreDia(fecha);

  const especialidadLimpia = typeof especialidad === 'string' && especialidad.startsWith('[')
    ? JSON.parse(especialidad)[0]
    : especialidad;

  // Buscar disponibilidad
  const { data: disponibilidadData, error: errorSelect } = await this.supabase.supabase
    .from('disponibilidad')
    .select('id')
    .eq('especialista_id', especialistaId)
    .ilike('especialidad', `%${especialidadLimpia}%`)
    .eq('dia', dia)
    .eq('inicio', hora)
    .eq('estado', 'disponible')
    .limit(1)
    .single();

  if (!disponibilidadData || errorSelect) {
    Swal.fire('Error', 'El horario ya fue reservado o no existe.', 'error');
    return;
  }

  const disponibilidadId = disponibilidadData.id;

  // Paso 1: Marcar como ocupado y asignar paciente_id en disponibilidad
  const { error: errorUpdate } = await this.supabase.supabase
    .from('disponibilidad')
    .update({ estado: 'ocupado', paciente_id: pacienteId })
    .eq('id', disponibilidadId);

  if (errorUpdate) {
    Swal.fire('Error', 'No se pudo actualizar la disponibilidad.', 'error');
    return;
  }

  // Paso 2: Insertar en la tabla turnos
  const { error: errorInsert } = await this.supabase.supabase
    .from('turnos')
    .insert({
      paciente: pacienteId,
      especialista: this.especialistaSeleccionado.mail,
      especialidad: especialidadLimpia,
      fecha,
      hora,
      estado: 'pendiente'
    });

  if (errorInsert) {
    Swal.fire('Error', 'No se pudo guardar el turno.', 'error');
    return;
  }

  // OK
  Swal.fire('Turno asignado', 'El turno fue reservado correctamente.', 'success');
  this.formTurno.reset();
  this.especialidades = [];
  this.disponibilidadAgrupada = {};
  this.especialistaSeleccionado = null;
}

  obtenerNombreDia(fechaISO: string): string {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const [y, m, d] = fechaISO.split('-').map(Number);
    return dias[new Date(y, m - 1, d).getDay()];
  }

  getIconoEspecialidad(especialidad: string): string {
    const nombre = especialidad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `assets/images/${nombre}.png`;
  }

  imgDefault(event: any) {
    event.target.src = 'assets/images/default.png';
  }

  logout() {
    this.supabase.supabase.auth.signOut();
    location.href = '/bienvenida';
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
