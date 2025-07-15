import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Supabase } from '../../servicios/supabase';
import Swal from 'sweetalert2';

interface HorasPermitidas {
  inicio: string;
  fin: string;
}

type DiasSemana = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado';

@Component({
  selector: 'app-mis-turnos-especialista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos-especialista.html',
  styleUrls: ['./mis-turnos-especialista.scss']
})
export class MisTurnosEspecialista implements OnInit {
  userData: any = null;
  rol: string = '';
  mostrarPerfil: boolean = true;
  filtroEspecialidad: string | null = null;
  filtroPaciente: string | null = null;
  turnosFiltrados: any[] = [];
  especialidadesUnicas: string[] = [];
  filtroPacienteId: string | null = null;
  pacientesUnicos: { id: string, nombre: string }[] = [];
  diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  horas: string[] = [];
  especialidades: string[] = [];
  horarios: {
    dia: string;
    horaInicio: string;
    horaFin: string;
    especialidad: string;
    duracion: number;
    estado: string;
  }[] = [];
  turnos: any[] = [];
  busquedaLibre: string = '';

  mostrarHistoria: Record<string, boolean> = {};
  historiasClinicas: any[] = [];


  constructor(private supabase: Supabase, private router: Router) { }

  async ngOnInit() {
    this.generarHoras();

    // Obtener sesión actual y correo
    const { data: session } = await this.supabase.supabase.auth.getUser();
    const email = session.user?.email;

    // Obtener datos del usuario
    const { data: usuario, error } = await this.supabase.supabase
      .from('usuarios')
      .select('*')
      .eq('mail', email)
      .single();

    if (error || !usuario) {
      console.error('❌ Error al obtener usuario:', error);
      return;
    }

    this.userData = usuario;
    this.rol = usuario.rol;
    this.horarios = usuario.horarios || [];

    // Cargar especialidades (puede venir como string o array)
    this.especialidades = typeof usuario.especialidades === 'string'
      ? usuario.especialidades.split(',').map((e: string) => e.trim())
      : usuario.especialidades || [];

    // Obtener turnos del especialista
    const { data: turnosData } = await this.supabase.supabase
      .from('turnos')
      .select('*')
      .eq('especialista', usuario.mail);

    this.turnos = turnosData || [];

    // Obtener pacientes únicos
    const pacientesIds = [...new Set(this.turnos.map(t => t.paciente))];

    const { data: pacientesData } = await this.supabase.supabase
      .from('usuarios')
      .select('id, nombre, apellido')
      .in('id', pacientesIds);

    const mapaPacientes: Record<string, string> = {};
    this.pacientesUnicos = pacientesData?.map(p => ({
      id: p.id,
      nombre: `${p.nombre} ${p.apellido}`
    })) || [];

    pacientesData?.forEach(p => {
      mapaPacientes[p.id] = `${p.nombre} ${p.apellido}`;
    });

    // Asignar nombre del paciente a cada turno
    this.turnos = this.turnos.map(t => ({
      ...t,
      nombrePaciente: mapaPacientes[t.paciente] || 'Paciente desconocido'
    }));

    // Obtener historias clínicas asociadas a esos turnos
    const turnoIds = this.turnos.map(t => t.id);
    const { data: historias } = await this.supabase.supabase
      .from('historia_clinica')
      .select('*')
      .in('turno_id', turnoIds);

    this.historiasClinicas = historias || [];

    // Asociar cada historia a su turno correspondiente
    this.turnos = this.turnos.map(t => ({
      ...t,
      historia: this.historiasClinicas.find(h => h.turno_id === t.id)
    }));

    // Aplicar filtros
    this.actualizarFiltros();
    this.aplicarFiltros();
  }

  // //evito horarios redundantes
  validarHorarioRedundante(horaInicio: string, horaFin: string): boolean {
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);

    if (hInicio > hFin || (hInicio === hFin && mInicio > mFin)) {
      Swal.fire('Error', 'La hora de inicio no puede ser mayor que la de fin.', 'error');
      return false;
    }
    return true;
  }
  generarHoras() {
    const intervalo = 30;
    const horasPermitidas: Record<DiasSemana, HorasPermitidas> = {
      lunes: { inicio: '08:00', fin: '19:00' },
      martes: { inicio: '08:00', fin: '19:00' },
      miércoles: { inicio: '08:00', fin: '19:00' },
      jueves: { inicio: '08:00', fin: '19:00' },
      viernes: { inicio: '08:00', fin: '19:00' },
      sábado: { inicio: '08:00', fin: '14:00' },
    };

    for (let dia of this.diasSemana) {
      const { inicio, fin } = horasPermitidas[dia.toLowerCase() as DiasSemana];
      const [hInicio, mInicio] = inicio.split(':').map(Number);
      const [hFin, mFin] = fin.split(':').map(Number);

      for (let h = hInicio; h <= hFin; h++) {
        for (let m = mInicio; m < 60; m += intervalo) {
          if (h === hFin && m > mFin) break;
          this.horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
      }
    }
  }

  // Verificar la disponibilidad existente
  async verificarDisponibilidadExistente(bloques: any[]): Promise<any[]> {
    const { data: existingBlocks, error } = await this.supabase.supabase
      .from('disponibilidad')
      .select('especialista_id, fecha, inicio, fin')
      .in('especialista_id', bloques.map(b => b.especialista_id))
      .in('fecha', bloques.map(b => b.fecha))
      .in('inicio', bloques.map(b => b.inicio));

    if (error) {
      console.error('❌ Error al verificar disponibilidad existente:', error.message);
      return [];
    }

    const newBlocks = bloques.filter(bloque =>
      !existingBlocks.some(existing =>
        existing.especialista_id === bloque.especialista_id &&
        existing.fecha === bloque.fecha &&
        existing.inicio === bloque.inicio &&
        existing.fin === bloque.fin
      )
    );

    return newBlocks;
  }

  // Validación de horario
  validarHorario(horaInicio: string, horaFin: string, dia: string): boolean {
    const horasPermitidas: Record<DiasSemana, HorasPermitidas> = {
      lunes: { inicio: '08:00', fin: '19:00' },
      martes: { inicio: '08:00', fin: '19:00' },
      miércoles: { inicio: '08:00', fin: '19:00' },
      jueves: { inicio: '08:00', fin: '19:00' },
      viernes: { inicio: '08:00', fin: '19:00' },
      sábado: { inicio: '08:00', fin: '14:00' },
    };

    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);
    const horasDia = horasPermitidas[dia.toLowerCase() as DiasSemana];

    if (!horasDia) {
      Swal.fire('Error', 'Día no válido.', 'error');
      return false;
    }

    const [hInicioPerm, mInicioPerm] = horasDia.inicio.split(':').map(Number);
    const [hFinPerm, mFinPerm] = horasDia.fin.split(':').map(Number);

    if (
      (hInicio < hInicioPerm || (hInicio === hInicioPerm && mInicio < mInicioPerm)) ||
      (hFin > hFinPerm || (hFin === hFinPerm && mFin > mFinPerm))
    ) {
      Swal.fire('Error', 'El horario no está dentro del rango permitido.', 'error');
      return false;
    }

    return true;
  }

  // Validar horarios vacíos
  validarCamposVacios(horaInicio: string, horaFin: string): boolean {
    if (!horaInicio || !horaFin) {
      Swal.fire('Error', 'Los campos de horario no pueden estar vacíos.', 'error');
      return false;
    }
    return true;
  }

  // Función para agregar horarios
  agregarHorario() {
    this.horarios.push({ dia: '', horaInicio: '', horaFin: '', especialidad: this.especialidades.length === 1 ? this.especialidades[0] : '', duracion: 30, estado: 'disponible' });
  }

  generarBloques(horario: any): string[] {
    const bloques: string[] = [];
    const duracion = horario.duracion || 30;
    let [h, m] = horario.horaInicio.split(':').map(Number);

    // Usar let en lugar de const para que puedas reasignar los valores
    let [hf, mf] = horario.horaFin.split(':').map(Number); // Cambié const por let aquí

    // Ajustar los rangos de hora según el día
    if (horario.dia === 'Sábado') {
      if (h < 8) h = 8; // El sábado solo se permite entre 08:00 y 14:00
      if (hf > 14) hf = 14;
    } else {
      if (h < 8) h = 8; // De lunes a viernes solo entre 08:00 y 19:00
      if (hf > 19) hf = 19;
    }

    while (h < hf || (h === hf && m < mf)) {
      bloques.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      m += duracion;
      if (m >= 60) { h++; m -= 60; }
    }

    return bloques;
  }

  async guardarHorarios() {
    // Verificar que los horarios no estén vacíos, que no sean redundantes y que estén dentro del rango permitido
    for (let h of this.horarios) {
      if (!this.validarCamposVacios(h.horaInicio, h.horaFin)) return;
      if (!this.validarHorarioRedundante(h.horaInicio, h.horaFin)) return;
      if (!this.validarHorario(h.horaInicio, h.horaFin, h.dia)) return;
    }

    // Proceder con la inserción en la base de datos
    await this.supabase.supabase.from('usuarios').update({ horarios: this.horarios }).eq('mail', this.userData.mail);
    await this.supabase.supabase.from('disponibilidad').delete().eq('especialista_id', this.userData.id);

    const bloques: any[] = [];
    const hoy = new Date();

    // Generar bloques para los próximos 15 días
    for (let i = 0; i < 15; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const diaSemana = this.obtenerNombreDia(fecha);

      // Iterar sobre los horarios definidos por el especialista
      for (const h of this.horarios) {
        // Verificar si el día del horario coincide con el día de la fecha actual
        if (this.normalizarDia(h.dia) === this.normalizarDia(diaSemana)) {
          const semana = this.obtenerSemana(fecha);
          const bloquesHorario = this.generarBloques(h); // Generar los bloques de tiempo

          console.log(`🗓️ Día encontrado: ${diaSemana} - Fecha: ${fecha.toISOString().split('T')[0]} - Especialidad: ${h.especialidad}`);

          // Generar los bloques de hora para cada uno de los intervalos
          for (const horaInicio of bloquesHorario) {
            const [hStart, mStart] = horaInicio.split(':').map(Number);
            const inicio = `${String(hStart).padStart(2, '0')}:${String(mStart).padStart(2, '0')}`;

            // Calcular la hora de fin, sumando la duración al bloque de inicio
            const finDate = new Date(fecha);
            finDate.setHours(hStart);
            finDate.setMinutes(mStart + h.duracion);
            const fin = `${String(finDate.getHours()).padStart(2, '0')}:${String(finDate.getMinutes()).padStart(2, '0')}`;

            console.log(`⏰ Bloque generado: ${inicio} - ${fin} (Duración: ${h.duracion} min)`);

            // Crear un nuevo bloque de disponibilidad
            bloques.push({
              especialista_id: this.userData.id,
              especialidad: h.especialidad,
              dia: diaSemana,
              fecha: this.getFechaLocalString(fecha),
              semana,
              inicio,
              fin,
              duracion: h.duracion,
              estado: 'disponible'
            });
          }
        }
      }
    }



    // Verificar disponibilidad de los bloques generados en la base de datos
    const newBlocks = await this.verificarDisponibilidadExistente(bloques);

    // Insertar los bloques que no existían previamente
    if (newBlocks.length) {
      const { error } = await this.supabase.supabase.from('disponibilidad').insert(newBlocks);
      if (error) {
        console.error('❌ Error al insertar disponibilidad:', error.message, error.details);
        Swal.fire('Error', 'No se pudo guardar la disponibilidad.', 'error');
        return;
      }
    }

    console.log('✅ Total de bloques nuevos generados:', newBlocks.length);
    Swal.fire('Horarios guardados', 'La disponibilidad fue actualizada correctamente.', 'success');
  }
  async eliminarHorario(index: number) {
    const confirm = await Swal.fire({ title: '¿Eliminar horario?', text: 'Esto eliminará también la disponibilidad generada.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar' });
    if (!confirm.isConfirmed) return;
    const horarioEliminado = this.horarios[index];
    this.horarios.splice(index, 1);
    await this.supabase.supabase.from('usuarios').update({ horarios: this.horarios }).eq('mail', this.userData.mail);
    await this.supabase.supabase.from('disponibilidad').delete().match({ especialista_id: this.userData.id, dia_semana: horarioEliminado.dia, especialidad: horarioEliminado.especialidad, estado: 'disponible' });
    Swal.fire('Eliminado', 'Disponibilidad eliminada correctamente.', 'success');
  }

  aplicarFiltros() {
    const texto = this.busquedaLibre?.toLowerCase().trim() || '';

    this.turnosFiltrados = this.turnos
      .filter(t => {
        const filtroEsp = !this.filtroEspecialidad || t.especialidad === this.filtroEspecialidad;
        const filtroPac = !this.filtroPacienteId || t.paciente === this.filtroPacienteId;

        const camposTurno = [
          t.especialidad,
          t.estado,
          t.nombrePaciente,
          t.fecha,
          t.hora,
          t.comentarioEspecialista
        ];

        const camposHistoria = t.historia ? [
          t.historia.altura,
          t.historia.peso,
          t.historia.presion,
          t.historia.temperatura,
          ...Object.entries(t.historia.datos_extra || {}).map(([k, v]) => `${k}: ${v}`)
        ] : [];

        const todos = [...camposTurno, ...camposHistoria].map(e => String(e).toLowerCase());

        return filtroEsp && filtroPac && todos.some(c => c.includes(texto));
      })
      .sort((a, b) => {
        // Finalizados al final
        if (a.estado === 'realizado' && b.estado !== 'realizado') return 1;
        if (a.estado !== 'realizado' && b.estado === 'realizado') return -1;
        return 0;
      });
  }


  actualizarFiltros() {
    this.especialidadesUnicas = [...new Set(this.turnos.map(t => t.especialidad))];
    this.pacientesUnicos = this.turnos
      .map(t => ({ id: t.paciente, nombre: t.nombrePaciente }))
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i); // elimina duplicados

    this.aplicarFiltros();
  }

  puedeAceptar(estado: string): boolean {
    return !['realizado', 'cancelado', 'rechazado', 'aceptado'].includes(estado);
  }

  puedeRechazar(estado: string): boolean {
    return !['aceptado', 'realizado', 'cancelado', 'rechazado'].includes(estado);
  }

  puedeCancelar(estado: string): boolean {
    return !['aceptado', 'realizado', 'rechazado', 'cancelado'].includes(estado);
  }
  getFechaLocalString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async aceptarTurno(turno: any) {
    const confirm = await Swal.fire({ title: '¿Aceptar turno?', text: 'Estás por aceptar este turno.', icon: 'question', showCancelButton: true, confirmButtonText: 'Aceptar' });
    if (confirm.isConfirmed) {
      await this.supabase.supabase.from('turnos').update({ estado: 'aceptado' }).eq('id', turno.id);
      this.recargarTurnos();
    }
  }

  async rechazarTurno(turno: any) {
    const { value: motivo } = await Swal.fire({ title: 'Motivo del rechazo', input: 'text', inputLabel: 'Ingrese el motivo', inputValidator: (value) => !value && 'El motivo es obligatorio', showCancelButton: true });
    if (motivo) {
      await this.supabase.supabase.from('turnos').update({ estado: 'rechazado', motivo_rechazo: motivo }).eq('id', turno.id);
      this.recargarTurnos();
    }
  }

  async cancelarTurno(turno: any) {
    const { value: motivo } = await Swal.fire({ title: 'Motivo de la cancelación', input: 'text', inputLabel: 'Ingrese el motivo', inputValidator: (value) => !value && 'El motivo es obligatorio', showCancelButton: true });
    if (motivo) {
      await this.supabase.supabase.from('turnos').update({ estado: 'cancelado', motivo_cancelacion: motivo }).eq('id', turno.id);
      this.recargarTurnos();
    }
  }

  async finalizarTurno(turno: any) {
    const { value: comentario } = await Swal.fire({ title: 'Finalizar turno', input: 'textarea', inputLabel: 'Comentario de diagnóstico', inputValidator: (value) => !value && 'El comentario es obligatorio', showCancelButton: true });
    if (comentario) {
      await this.supabase.supabase
        .from('turnos')
        .update({ estado: 'realizado', comentarioEspecialista: comentario })
        .eq('id', turno.id);

      Swal.fire('Turno finalizado', 'Redirigiendo a historia clínica...', 'success').then(() => {
        this.router.navigate(['/historia-clinica', turno.id]);
      });

    }
  }

  async recargarTurnos() {
    const { data } = await this.supabase.supabase.from('turnos').select('*').eq('especialista', this.userData.mail);
    this.turnos = data || [];
    this.actualizarFiltros();
  }

  obtenerSemana(fecha: Date): string {
    const primerDia = new Date(fecha.getFullYear(), 0, 1);
    const diferencia = (+fecha - +primerDia + ((primerDia.getDay() + 6) % 7) * 86400000) / 86400000;
    const semana = Math.ceil(diferencia / 7);
    return `Semana ${semana} - ${fecha.getFullYear()}`;
  }

  obtenerNombreDia(fecha: Date): string {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return dias[fecha.getDay()];
  }

  verResena(turno: any) {
    const reseña = turno.calificacionPaciente || 'Sin comentarios.';
    Swal.fire({
      title: 'Reseña del paciente',
      text: reseña,
      icon: 'info'
    });
  }

  formatearEspecialidad(esp: any): string {
    if (Array.isArray(esp)) {
      return esp.join(', ');
    }
    if (typeof esp === 'string') {
      // Si ya está bien, lo muestra así
      return esp.replace(/[\[\]"]+/g, '');
    }
    return String(esp);
  }



  toggleVista(mostrar: boolean) {
    this.mostrarPerfil = mostrar;
  }

  logout() {
    this.supabase.supabase.auth.signOut();
    this.router.navigate(['/bienvenida']);
  }

  normalizarDia(dia: string): string {
    return dia.trim().toLowerCase();
  }

  cargarHistoriaClinica(turnoId: string) {
    this.router.navigate(['/historia-clinica', turnoId]);
  }
  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  getClaves(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
  
  getHorasParaDia(dia: string): string[] {
    const horas: string[] = [];
    const intervalo = 30;

    const horasPermitidas: Record<DiasSemana, HorasPermitidas> = {
      lunes: { inicio: '08:00', fin: '19:00' },
      martes: { inicio: '08:00', fin: '19:00' },
      miércoles: { inicio: '08:00', fin: '19:00' },
      jueves: { inicio: '08:00', fin: '19:00' },
      viernes: { inicio: '08:00', fin: '19:00' },
      sábado: { inicio: '08:00', fin: '14:00' },
    };

    const diaNormalizado = dia.toLowerCase() as DiasSemana;
    const { inicio, fin } = horasPermitidas[diaNormalizado];
    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);

    for (let h = hInicio; h <= hFin; h++) {
      for (let m = 0; m < 60; m += intervalo) {
        if (h === hFin && m > mFin) break;
        horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }

    return horas;
  }


}
