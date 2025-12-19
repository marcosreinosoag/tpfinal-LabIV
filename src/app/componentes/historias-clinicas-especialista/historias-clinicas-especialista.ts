import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supabase } from '../../servicios/supabase';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historias-clinicas-especialista',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './historias-clinicas-especialista.html',
  styleUrls: ['./historias-clinicas-especialista.scss'],
  providers: [DatePipe]
})

export class HistoriasClinicasEspecialista implements OnInit {
  historias: any[] = [];
  mapaPacientes: Record<string, string> = {};
  mapaTurnos: Record<string, any> = {};
  pacientesUnicos: { id: string, nombre: string, foto: string }[] = [];
  filtroPaciente: string | null = null;
  historiasPaciente: any[] = [];
  historiaSeleccionada: any = null;
  ultimosTurnos: any[] = [];
  historiasDelPaciente: any[] = []

  constructor(private supabase: Supabase,private router: Router) {}

  async ngOnInit() {
    const { data: session } = await this.supabase.supabase.auth.getUser();
    const email = session.user?.email;

    const { data: especialista } = await this.supabase.supabase
      .from('usuarios')
      .select('id')
      .eq('mail', email)
      .single();

    if (!especialista) return;

    const { data: historias } = await this.supabase.supabase
      .from('historia_clinica')
      .select('*')
      .eq('especialista_id', email)
      .order('fecha', { ascending: false });

    this.historias = historias || [];

    const pacienteIds = [...new Set(this.historias.map(h => h.paciente_id))];

    const { data: pacientes } = await this.supabase.supabase
      .from('usuarios')
      .select('id, nombre, apellido, fotoPerfil')
      .in('id', pacienteIds);

    pacientes?.forEach(p => {
      const nombre = `${p.nombre} ${p.apellido}`;
      this.mapaPacientes[p.id] = nombre;
      this.pacientesUnicos.push({
        id: p.id,
        nombre,
        foto: p.fotoPerfil || 'assets/default-user.png'
      });
    });

    const turnoIds = [...new Set(this.historias.map(h => h.turno_id))];

    const { data: turnos } = await this.supabase.supabase
      .from('turnos')
      .select('id, fecha, hora, especialidad, calificacionPaciente')
      .in('id', turnoIds);

    turnos?.forEach(t => {
      this.mapaTurnos[t.id] = t;
    });
  }

  getClaves(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  // Función para obtener los datos extra adicionales (excluyendo los 3 campos dinámicos principales)
  getDatosExtraAdicionales(datosExtra: any): Array<{clave: string, valor: any}> {
    if (!datosExtra) return [];
    
    const camposDinamicos = ['rangoDinamico', 'valorNumerico', 'switchSiNo'];
    const resultado: Array<{clave: string, valor: any}> = [];
    
    for (const clave in datosExtra) {
      if (!camposDinamicos.includes(clave)) {
        resultado.push({ clave, valor: datosExtra[clave] });
      }
    }
    
    return resultado;
  }

  nombrePaciente(id: string): string {
    return this.mapaPacientes[id] || 'Paciente';
  }

  datosTurno(id: string): any {
    return this.mapaTurnos[id] || {};
  }

  limpiarFiltro() {
    this.filtroPaciente = null;
    this.historiasPaciente = [];
    this.historiaSeleccionada = null;
  }

  verHistoria(historia: any) {
    this.historiaSeleccionada = historia;
  }

abrirModalPorPaciente(pacienteId: string) {
  this.historiasDelPaciente = this.historias
    .filter(h => h.paciente_id === pacienteId);

  // Obtener las 3 últimas historias por fecha
  this.ultimosTurnos = [...this.historiasDelPaciente]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 3);
}

  obtenerResena(turnoId: string): string | null {
    return this.mapaTurnos[turnoId]?.calificacionPaciente || null;
  }

  cerrarModal() {
  this.historiasDelPaciente = [];
}

  logout() {
    this.supabase.supabase.auth.signOut();
    this.router.navigate(['/bienvenida']);
  }


  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  scrollCarrusel(direction: string): void {
  const carrusel = document.querySelector('.historias-grid');
  if (direction === 'left') {
    carrusel?.scrollBy({ left: -300, behavior: 'smooth' });
  } else {
    carrusel?.scrollBy({ left: 300, behavior: 'smooth' });
  }
}

}
