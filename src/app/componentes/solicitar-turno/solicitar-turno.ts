import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Supabase } from '../../servicios/supabase';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './solicitar-turno.html',
  styleUrls: ['./solicitar-turno.scss']
})
export class SolicitarTurno implements OnInit {
  especialistas: any[] = [];
  especialidades: string[] = [];
  especialistaSeleccionado: any = null;
  horariosDelDia: any[] = [];
  diasDisponibles: string[] = [];
  formTurno!: FormGroup;
  userId: string | null = null;
  disponibilidadAgrupada: { [fecha: string]: string[] } = {};
   Object = Object; 

  constructor(private fb: FormBuilder, private supabase: Supabase, private router: Router) {}

  async ngOnInit() {
    const session = await this.supabase.supabase.auth.getUser();
    this.userId = session.data.user?.id || null;

    this.formTurno = this.fb.group({
      especialistaId: ['', Validators.required],
      especialidad: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });

    const { data } = await this.supabase.supabase
  .from('usuarios')
  .select('id, nombre, apellido, mail, especialidades, fotoPerfil, estado')
  .eq('rol', 'Especialista')
  .eq('estado', 'activo');

if (data) this.especialistas = data;

    console.log(' Supabase Auth UID:', session.data.user?.id);

  }

  onEspecialistaChange() {
    const idSeleccionado = this.formTurno.value.especialistaId;
    this.especialistaSeleccionado = this.especialistas.find(e => e.id === idSeleccionado);

    const espRaw = this.especialistaSeleccionado?.especialidades;
    try {
      if (Array.isArray(espRaw)) {
        this.especialidades = espRaw;
      } else if (typeof espRaw === 'string' && espRaw.trim().startsWith('[')) {
        this.especialidades = JSON.parse(espRaw);
      } else if (typeof espRaw === 'string') {
        this.especialidades = espRaw.split(',').map(e => e.trim());
      } else {
        this.especialidades = [];
      }
    } catch {
      this.especialidades = [];
    }

    this.formTurno.patchValue({ especialidad: '', fecha: '', hora: '' });
    this.horariosDelDia = [];
    this.diasDisponibles = [];
  }

obtenerNombreDia(fechaISO: string): string {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const [year, month, day] = fechaISO.split('-').map(Number);
  const fechaLocal = new Date(year, month - 1, day); // mes empieza desde 0
  return dias[fechaLocal.getDay()];
}


  async onFechaChange() {
    const { especialistaId, especialidad, fecha } = this.formTurno.value;
    const dia = this.obtenerNombreDia(fecha);

    console.log('📅 Día obtenido:', dia);
    console.log('🔍 Buscando disponibilidad para:');
    console.log('Especialista ID:', especialistaId);
    console.log('Especialidad:', especialidad);
    console.log('Fecha seleccionada:', fecha);

    const especialidadLimpia = typeof especialidad === 'string' && especialidad.startsWith('[')
      ? JSON.parse(especialidad)[0]
      : especialidad;

    const { data, error } = await this.supabase.supabase
      .from('disponibilidad')
      .select('id, inicio')
      .eq('especialista_id', especialistaId)
      .ilike('especialidad', `%${especialidadLimpia}%`)
      .eq('dia', dia)
      .eq('estado', 'disponible');

    if (error) {
      console.error('❌ Error al obtener horarios disponibles:', error);
      return;
    }

    if (data) {
      const horariosUnicos = data.filter(
        (item, index, self) => index === self.findIndex(t => t.inicio === item.inicio)
      ).sort((a, b) => a.inicio.localeCompare(b.inicio));

      console.log('🟢 Horarios disponibles encontrados:', horariosUnicos);
      this.horariosDelDia = horariosUnicos.map(h => h.inicio);
    }
  }

  async solicitarTurno() {
    if (this.formTurno.invalid || !this.userId || !this.especialistaSeleccionado) return;

    const { especialistaId, especialidad, fecha, hora } = this.formTurno.value;
    const dia = this.obtenerNombreDia(fecha);

    const especialidadLimpia = typeof especialidad === 'string' && especialidad.startsWith('[')
      ? JSON.parse(especialidad)[0]
      : especialidad;

    console.log('🟡 Solicitando turno...');
    console.log('Paciente ID:', this.userId);
    console.log('Especialista ID:', especialistaId);
    console.log('Especialidad:', especialidadLimpia);
    console.log('Día:', dia);
    console.log('Fecha:', fecha);
    console.log('Hora:', hora);

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

    if (errorSelect || !disponibilidadData) {
      console.error('❌ No se encontró disponibilidad:', errorSelect);
      Swal.fire('Error', 'El horario ya fue reservado o no existe.', 'error');
      return;
    }

    console.log('✅ Disponibilidad encontrada con ID:', disponibilidadData.id);

    const { error: errorUpdate } = await this.supabase.supabase
  .from('disponibilidad')
  .update({
    estado: 'ocupado',
    paciente_id: this.userId
  })
  .eq('id', disponibilidadData.id);


    if (errorUpdate) {
      console.error('❌ Error al actualizar disponibilidad:', errorUpdate);
      Swal.fire('Error', 'No se pudo actualizar la disponibilidad.', 'error');
      return;
    }

    const { error: errorInsert } = await this.supabase.supabase.from('turnos').insert({
      paciente: this.userId,
      especialista: this.especialistaSeleccionado.mail,
      especialidad: especialidadLimpia,
      fecha,
      hora,
      estado: 'pendiente'
    });

    if (errorInsert) {
      console.error('❌ Error al guardar el turno:', errorInsert);
      Swal.fire('Error', 'No se pudo guardar el turno.', 'error');
      return;
    }

    Swal.fire('Turno solicitado', 'Tu turno ha sido reservado correctamente.', 'success');
    this.formTurno.reset();
    this.especialidades = [];
    this.horariosDelDia = [];
    this.diasDisponibles = [];
    this.especialistaSeleccionado = null;
  }

async cargarDisponibilidadAgrupada() {
  const especialistaId = this.formTurno.value.especialistaId;
  const especialidad = this.formTurno.value.especialidad;

  if (!especialistaId || !especialidad) return;

  const especialidadLimpia = typeof especialidad === 'string' && especialidad.startsWith('[')
    ? JSON.parse(especialidad)[0]
    : especialidad;

  const { data, error } = await this.supabase.supabase
    .from('disponibilidad')
    .select('fecha, inicio')
    .eq('especialista_id', especialistaId)
    .ilike('especialidad', `%${especialidadLimpia}%`)
    .eq('estado', 'disponible');

  if (error) {
    console.error('❌ Error al obtener disponibilidad:', error);
    return;
  }

  // Agrupar por fecha
  const agrupado: { [fecha: string]: string[] } = {};
  for (const turno of data || []) {
    const fecha = turno.fecha;
    if (!agrupado[fecha]) agrupado[fecha] = [];
    agrupado[fecha].push(turno.inicio);
  }

  // Ordenar horarios por cada fecha
  for (const key in agrupado) {
    agrupado[key].sort((a, b) => a.localeCompare(b));
  }

  this.disponibilidadAgrupada = agrupado;
  console.log('📅 Disponibilidad agrupada:', this.disponibilidadAgrupada);
}

getIconoEspecialidad(especialidad: string): string {
  const nombre = especialidad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `assets/images/${nombre}.png`;
}

imgDefault(event: any) {
  event.target.src = 'assets/images/default.png';
}


  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  logout() {
    this.supabase.supabase.auth.signOut();
    location.href = '/bienvenida';
  }
}
