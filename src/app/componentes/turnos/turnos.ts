import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supabase } from '../../servicios/supabase';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss'
})
export class Turnos implements OnInit{
turnos: any[] = [];
  filtroEspecialidad: string | null = null;
  filtroEspecialista: string | null = null;
  especialidades: string[] = [];
  especialistas: string[] = [];
  comentarioCancelacion: { [key: string]: string } = {};
  userId: string | null = null;
  esAdmin: boolean = false;

  busquedaNombre: string = ''; 
  busquedaFecha: string = '';

  constructor(private supabase: Supabase, private router: Router) {}
  async ngOnInit() {
  const session = await this.supabase.supabase.auth.getUser();
  const email = session.data.user?.email;

  const { data: usuario } = await this.supabase.supabase
    .from('usuarios')
    .select('rol')
    .eq('mail', email)
    .single();

  if (!usuario || usuario.rol !== 'admin') {
    Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'Solo el Administrador puede acceder.' });
    this.router.navigate(['/login']);
    return;
  }

  this.esAdmin = true;

  // Cargar turnos usando el método reutilizable
  await this.cargarTurnos();
}

turnosFiltrados() {
  return this.turnos
    .filter(t => {
      const textoFiltro = this.busquedaNombre.toLowerCase();
      const coincideTexto =
        !textoFiltro ||
        t.pacienteNombre.toLowerCase().includes(textoFiltro) ||
        t.especialistaNombre.toLowerCase().includes(textoFiltro) ||
        t.estado.toLowerCase().includes(textoFiltro) ||
        t.especialidad.toLowerCase().includes(textoFiltro);

      const coincideFecha = !this.busquedaFecha || t.fecha === this.busquedaFecha;

      return coincideTexto && coincideFecha;
    })
    .sort((a, b) => {
      // ✅ Turnos "realizado" van al final
      if (a.estado === 'realizado' && b.estado !== 'realizado') return 1;
      if (a.estado !== 'realizado' && b.estado === 'realizado') return -1;
      return 0;
    });
}



  puedeCancelar(turno: any): boolean {
    return !['aceptado', 'realizado', 'rechazado', 'cancelado'].includes(turno.estado);
  }

  mostrarCancelar(turnoId: string) {
    this.comentarioCancelacion[turnoId] = '';
  }

  async cancelarTurno(turnoId: string) {
    const comentario = this.comentarioCancelacion[turnoId];
    if (!comentario) return;
    
    const { error } = await this.supabase.supabase
      .from('turnos')
      .update({ estado: 'cancelado', motivo_cancelacion: comentario })
      .eq('id', turnoId);

    if (!error) {
      Swal.fire({ icon: 'success', title: 'Turno cancelado', text: 'El turno fue cancelado correctamente.' });
      await this.ngOnInit();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar el turno.' });
    }
  }

  async cargarTurnos() {
    // Traer turnos
    const { data: turnos, error } = await this.supabase.supabase
      .from('turnos')
      .select('*');

    if (error || !turnos) {
      console.error('Error al cargar turnos:', error);
      return;
    }

    this.turnos = turnos;
    this.especialidades = [...new Set(turnos.map(t => t.especialidad))];

    // Traer pacientes por UUID
    const pacienteIds = [...new Set(turnos.map(t => t.paciente))].filter(Boolean);
    const { data: pacientes } = await this.supabase.supabase
      .from('usuarios')
      .select('id, nombre, apellido')
      .in('id', pacienteIds);

    // Traer especialistas por mail
    const especialistaMails = [...new Set(turnos.map(t => t.especialista))].filter(Boolean);
    const { data: especialistas } = await this.supabase.supabase
      .from('usuarios')
      .select('mail, nombre, apellido')
      .in('mail', especialistaMails);

    // Armar mapas
    const mapaPacientes = new Map(pacientes?.map(p => [p.id, p]) || []);
    const mapaEspecialistas = new Map(especialistas?.map(e => [e.mail, e]) || []);

    // Enriquecer turnos con nombre y apellido
    this.turnos = this.turnos.map(t => ({
      ...t,
      pacienteNombre: `${mapaPacientes.get(t.paciente)?.nombre || ''} ${mapaPacientes.get(t.paciente)?.apellido || ''}`,
      especialistaNombre: `${mapaEspecialistas.get(t.especialista)?.nombre || ''} ${mapaEspecialistas.get(t.especialista)?.apellido || ''}`
    }));
  }

    goTo(path: string) {
    this.router.navigate([path]);  // Redirigir a la ruta proporcionada
  }

  
  // Cerrar sesión
  logout() {
    this.supabase.supabase.auth.signOut();
    this.router.navigate(['/bienvenida']);
  }

  limpiarFiltros() {
    this.filtroEspecialidad = null;
    this.filtroEspecialista = null;
  }
}
