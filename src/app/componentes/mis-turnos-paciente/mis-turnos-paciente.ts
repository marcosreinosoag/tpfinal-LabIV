import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../../servicios/supabase';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-mis-turnos-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos-paciente.html',
  styleUrls: ['./mis-turnos-paciente.scss']
})
export class MisTurnosPaciente implements OnInit {
  turnos: any[] = [];
  filtroEspecialidad: string | null = null;
  filtroEspecialista: string | null = null;
  especialidades: string[] = [];
  //especialistas: string[] = [];
  especialistas: { mail: string; nombre: string; apellido: string }[] = [];
  comentarioCancelacion: { [key: string]: string } = {};
  comentarioAtencion: { [key: string]: string } = {};
  userId: string | null = null;
  userData: any = null;
  mostrarPerfil: boolean = true;
  historiasClinicas: any[] = [];
  mapaTurnos: Record<string, any> = {};
  today = new Date(); // para mostrar la fecha actual

  busquedaLibre: string = '';
  historiaVisible: { [turnoId: string]: boolean } = {};
  filtroEspecialistaSeleccionado: string = '';

  // Variables para la encuesta
  mostrarModalEncuesta: boolean = false;
  turnoIdEncuesta: string = '';
  hoverEstrella: number = 0;
  encuestaData: {
    calificacionEstrellas: number;
    recomendacion: string;
    aspectos: {
      puntualidad: boolean;
      profesionalismo: boolean;
      amabilidad: boolean;
      instalaciones: boolean;
      tiempoEspera: boolean;
    };
    satisfaccionGeneral: number;
    comentarios: string;
  } = {
    calificacionEstrellas: 0,
    recomendacion: '',
    aspectos: {
      puntualidad: false,
      profesionalismo: false,
      amabilidad: false,
      instalaciones: false,
      tiempoEspera: false
    },
    satisfaccionGeneral: 50,
    comentarios: ''
  };


  constructor(private supabase: Supabase, private router: Router) { }

  async ngOnInit() {
    const session = await this.supabase.supabase.auth.getUser();
    const email = session.data.user?.email;
    this.userId = session.data.user?.id || null;

    // Obtener datos del usuario
    const { data: usuario, error: userError } = await this.supabase.supabase
      .from('usuarios')
      .select('*')
      .eq('mail', email)
      .single();

    if (!userError && usuario) {
      this.userData = usuario;
    }

    // Obtener turnos del paciente
    const { data: turnos, error: turnosError } = await this.supabase.supabase
      .from('turnos')
      .select('*')
      .eq('paciente', this.userId);

    if (!turnosError && turnos) {
      this.turnos = turnos;
      this.especialidades = [...new Set(turnos.map(t => t.especialidad))];

      // 🔁 Obtener mails únicos de especialistas
      const mails = [...new Set(turnos.map(t => t.especialista))];

      // 🔍 Consultar nombres/apellidos de esos especialistas
      const { data: especialistasData, error: especialistasError } = await this.supabase.supabase
        .from('usuarios')
        .select('mail, nombre, apellido')
        .in('mail', mails);

      if (!especialistasError && especialistasData) {
        this.especialistas = especialistasData;
      } else {
        this.especialistas = [];
      }
    } else {
      Swal.fire({ icon: 'warning', title: 'Sin turnos', text: 'No se encontraron turnos.' });
    }

    // ✅ Obtener historia clínica del paciente
    const { data: historias } = await this.supabase.supabase
      .from('historia_clinica')
      .select('*')
      .eq('paciente_id', this.userId);

    this.historiasClinicas = historias || [];

    // ✅ Obtener datos de los turnos asociados a las historias
    const turnoIds = [...new Set(this.historiasClinicas.map(h => h.turno_id))];

    if (turnoIds.length) {
      const { data: turnosHistoria } = await this.supabase.supabase
        .from('turnos')
        .select('id, especialidad, fecha, hora')
        .in('id', turnoIds);

      turnosHistoria?.forEach(t => {
        this.mapaTurnos[t.id] = t;
      });
    }
  }


  turnosFiltrados() {
    const texto = this.busquedaLibre.toLowerCase().trim();

    return this.turnos
      .filter(t => {
        if (!texto) return true;

        const historia = this.historiasClinicas.find(h => h.turno_id === t.id);
        const especialista = this.especialistas.find(e => e.mail === t.especialista);
        const nombreCompleto = especialista ? `${especialista.nombre} ${especialista.apellido}`.toLowerCase() : '';

        const campos = [
          t.especialidad,
          t.especialista,
          nombreCompleto,
          t.estado,
          t.fecha,
          t.hora,
          t.comentarioEspecialista || '',
          ...(historia ? [
            historia.altura,
            historia.peso,
            historia.presion,
            historia.temperatura,
            ...Object.entries(historia.datos_extra || {}).map(([clave, valor]) => `${clave}: ${valor}`)
          ] : [])
        ].map(v => String(v).toLowerCase());

        return campos.some(campo => campo.includes(texto));
      })
      .sort((a, b) => {
        // Turnos "realizado" van al final
        if (a.estado === 'realizado' && b.estado !== 'realizado') return 1;
        if (a.estado !== 'realizado' && b.estado === 'realizado') return -1;
        return 0; // si son iguales, no cambia el orden
      });
  }

  puedeCancelar(turno: any) {
    return turno.estado === 'pendiente';
  }

  puedeVerResena(turno: any) {
    return !!turno.comentarioEspecialista;
  }

  puedeCalificar(turno: any) {
    return turno.estado === 'realizado' && !turno.calificacionPaciente;
  }

  puedeCompletarEncuesta(turno: any) {
    return turno.estado === 'realizado' && !turno.encuestaPaciente;
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
      Swal.fire({ icon: 'success', title: 'Turno cancelado', text: 'Tu turno fue cancelado correctamente.' });
      this.ngOnInit();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar el turno.' });
    }
  }

  verResena(turno: any) {
    Swal.fire({
      title: 'Reseña del especialista',
      text: turno.comentarioEspecialista,
      icon: 'info'
    });
  }

  mostrarComentario(turnoId: string) {
    this.comentarioAtencion[turnoId] = '';
  }

  async calificarAtencion(turnoId: string) {
    const comentario = this.comentarioAtencion[turnoId];
    if (!comentario) return;
    const { error } = await this.supabase.supabase
      .from('turnos')
      .update({ calificacionPaciente: comentario })
      .eq('id', turnoId);

    if (!error) {
      Swal.fire({ icon: 'success', title: 'Gracias por tu opinión', text: 'Tu calificación fue registrada.' });
      this.ngOnInit();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la calificación.' });
    }
  }

  toggleVista(mostrar: boolean) {
    this.mostrarPerfil = mostrar;
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  logout() {
    this.supabase.supabase.auth.signOut();
    location.href = '/bienvenida';
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

  datosTurno(id: string): any {
    return this.mapaTurnos[id] || {};
  }

  async descargarPDF(historia: any) {
    const doc = new jsPDF();

    // Usar la ruta directa para el logo de la clínica
    const logoUrl = 'assets/images/logo.png';  // Ruta relativa a tu imagen

    // Aquí se utiliza la ruta directamente en lugar de base64
    doc.addImage(logoUrl, 'ICO', 15, 10, 15, 15);  // Asegúrate de que el tipo sea correcto, puede ser 'PNG', 'JPG', 'ICO', etc.

    // Título y fecha de emisión
    doc.setFontSize(16);
    doc.text('Informe de Historia Clínica', 35, 18);
    doc.setFontSize(10);
    doc.text('Emitido: ' + new Date().toLocaleString(), 35, 25);

    let y = 40;

    // Datos clínicos
    const datos = [
      `Especialidad: ${this.datosTurno(historia.turno_id)?.especialidad || '-'}`,
      `Fecha: ${new Date(historia.fecha).toLocaleString()}`,
      `Altura: ${historia.altura || 'N/A'} cm`,
      `Peso: ${historia.peso || 'N/A'} kg`,
      `Presión: ${historia.presion || 'N/A'}`,
      `Temperatura: ${historia.temperatura || 'N/A'} °C`,
    ];

    datos.forEach(dato => {
      doc.text(dato, 15, y);
      y += 8;
    });

    // Mostrar los 3 campos dinámicos con nombres descriptivos
    if (historia.datos_extra) {
      if (historia.datos_extra.rangoDinamico !== undefined) {
        doc.text(`Bienestar del paciente: ${historia.datos_extra.rangoDinamico}`, 15, y);
        y += 8;
      }
      if (historia.datos_extra.valorNumerico !== undefined) {
        doc.text(`Cantidad de consultas: ${historia.datos_extra.valorNumerico}`, 15, y);
        y += 8;
      }
      if (historia.datos_extra.switchSiNo !== undefined) {
        doc.text(`Alergias: ${historia.datos_extra.switchSiNo}`, 15, y);
        y += 8;
      }

      // Mostrar otros datos adicionales (excluyendo los 3 campos dinámicos)
      const otrosDatos = this.getDatosExtraAdicionales(historia.datos_extra);
      if (otrosDatos.length > 0) {
        doc.text('Otros Datos:', 15, y);
        y += 8;
        otrosDatos.forEach(item => {
          doc.text(`${item.clave}: ${item.valor}`, 20, y);
          y += 8;
        });
      }
    }

    // Guardar el PDF con el nombre "historia-clinica.pdf"
    doc.save('historia-clinica.pdf');
  }

  async descargarHistoriaClinica() {
    const doc = new jsPDF();

    // Usar la ruta directa para el logo de la clínica
    const logoUrl = 'assets/images/logo.png';  // Ruta relativa a tu imagen

    // Agregar logo al PDF
    doc.addImage(logoUrl, 'PNG', 15, 10, 15, 15);

    // Título y fecha de emisión
    doc.setFontSize(16);
    doc.text('Informe de Historia Clínica Completa', 35, 18);
    doc.setFontSize(10);
    doc.text('Fecha de descarga: ' + new Date().toLocaleString(), 35, 25); // Fecha de descarga

    let y = 40;

    // Recorrer todas las historias clínicas y agregar los datos al PDF
    this.historiasClinicas.forEach(h => {
      const datos = [
        `Fecha: ${new Date(h.fecha).toLocaleString()}`,
        `Especialidad: ${this.datosTurno(h.turno_id)?.especialidad || '-'}`,
        `Altura: ${h.altura || 'N/A'} cm`,
        `Peso: ${h.peso || 'N/A'} kg`,
        `Presión: ${h.presion || 'N/A'}`,
        `Temperatura: ${h.temperatura || 'N/A'} °C`,
      ];

      datos.forEach(dato => {
        doc.text(dato, 15, y);
        y += 8;
      });

      // Mostrar los 3 campos dinámicos con nombres descriptivos
      if (h.datos_extra) {
        if (h.datos_extra.rangoDinamico !== undefined) {
          doc.text(`Bienestar del paciente: ${h.datos_extra.rangoDinamico}`, 15, y);
          y += 8;
        }
        if (h.datos_extra.valorNumerico !== undefined) {
          doc.text(`Cantidad de consultas: ${h.datos_extra.valorNumerico}`, 15, y);
          y += 8;
        }
        if (h.datos_extra.switchSiNo !== undefined) {
          doc.text(`Alergias: ${h.datos_extra.switchSiNo}`, 15, y);
          y += 8;
        }

        // Mostrar otros datos adicionales (excluyendo los 3 campos dinámicos)
        const otrosDatos = this.getDatosExtraAdicionales(h.datos_extra);
        if (otrosDatos.length > 0) {
          doc.text('Otros Datos:', 15, y);
          y += 8;
          otrosDatos.forEach(item => {
            doc.text(`${item.clave}: ${item.valor}`, 20, y);
            y += 8;
          });
        }
      }

      // Agregar un pequeño espacio entre cada historia clínica
      y += 10;
    });

    // Guardar el PDF con el nombre "historia-clinica-completa.pdf"
    doc.save('historia-clinica-completa.pdf');
  }

  toggleHistoria(turnoId: string) {
    this.historiaVisible[turnoId] = !this.historiaVisible[turnoId];
  }

  historiaDelTurno(turnoId: string) {
    return this.historiasClinicas.find(h => h.turno_id === turnoId);
  }


  async descargarHistoriaPorEspecialista(mailEspecialista: string) {
    const doc = new jsPDF();
    const logoUrl = 'assets/images/logo.png';

    // Traer nombre y apellido del profesional
    const { data: especialista, error } = await this.supabase.supabase
      .from('usuarios')
      .select('id, nombre, apellido')
      .eq('mail', mailEspecialista)
      .single();

    if (error || !especialista) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontró el profesional' });
      return;
    }

    const nombreCompleto = `${especialista.nombre} ${especialista.apellido}`;

    doc.addImage(logoUrl, 'PNG', 15, 10, 15, 15);
    doc.setFontSize(16);
    doc.text(`Historia Clínica atendido por: ${nombreCompleto}`, 35, 18);
    doc.setFontSize(10);
    doc.text('Emitido: ' + new Date().toLocaleString(), 35, 25);

    let y = 40;

    // Filtrar por id del especialista
    const historiasFiltradas = this.historiasClinicas.filter(
      h => h.especialista_id === especialista.id || h.especialista_id === mailEspecialista
    );

    if (!historiasFiltradas.length) {
      Swal.fire({
        icon: 'info',
        title: 'Sin datos',
        text: `No hay historias clínicas con el profesional ${nombreCompleto}`
      });
      return;
    }

    historiasFiltradas.forEach(h => {
      const turno = this.mapaTurnos[h.turno_id];
      const datos = [
        `Fecha: ${new Date(h.fecha).toLocaleString()}`,
        `Especialidad: ${turno?.especialidad || '-'}`,
        `Altura: ${h.altura || 'N/A'} cm`,
        `Peso: ${h.peso || 'N/A'} kg`,
        `Presión: ${h.presion || 'N/A'}`,
        `Temperatura: ${h.temperatura || 'N/A'} °C`,
      ];

      datos.forEach(dato => {
        doc.text(dato, 15, y);
        y += 8;
      });

      // Mostrar los 3 campos dinámicos con nombres descriptivos
      if (h.datos_extra) {
        if (h.datos_extra.rangoDinamico !== undefined) {
          doc.text(`Bienestar del paciente: ${h.datos_extra.rangoDinamico}`, 15, y);
          y += 8;
        }
        if (h.datos_extra.valorNumerico !== undefined) {
          doc.text(`Cantidad de consultas: ${h.datos_extra.valorNumerico}`, 15, y);
          y += 8;
        }
        if (h.datos_extra.switchSiNo !== undefined) {
          doc.text(`Alergias: ${h.datos_extra.switchSiNo}`, 15, y);
          y += 8;
        }

        // Mostrar otros datos adicionales (excluyendo los 3 campos dinámicos)
        const otrosDatos = this.getDatosExtraAdicionales(h.datos_extra);
        if (otrosDatos.length > 0) {
          doc.text('Datos adicionales:', 15, y);
          y += 8;
          otrosDatos.forEach(item => {
            doc.text(`${item.clave}: ${item.valor}`, 20, y);
            y += 8;
          });
        }
      }

      y += 10;
    });

    // Guardar usando nombre del profesional
    doc.save(`historia_${especialista.apellido}_${especialista.nombre}.pdf`);
  }


  getNombreEspecialista(mail: string): string {
    const especialista = this.especialistas.find(e => e.mail === mail);
    return especialista ? `${especialista.nombre} ${especialista.apellido}` : mail;
  }
  
  async descargarHistoriaPorEspecialidad(especialidad: string) {
    const doc = new jsPDF();
    const logoUrl = 'assets/images/logo.png';

    doc.addImage(logoUrl, 'PNG', 15, 10, 15, 15);
    doc.setFontSize(16);
    doc.text(`Historia Clínica - Especialidad: ${especialidad}`, 35, 18);
    doc.setFontSize(10);
    doc.text('Emitido: ' + new Date().toLocaleString(), 35, 25);

    let y = 40;

    // Filtrar historias clínicas por especialidad usando mapaTurnos
    const historiasFiltradas = this.historiasClinicas.filter(h => {
      const turno = this.mapaTurnos[h.turno_id];
      return turno?.especialidad === especialidad;
    });

    if (!historiasFiltradas.length) {
      Swal.fire({
        icon: 'info',
        title: 'Sin datos',
        text: `No hay historias clínicas para la especialidad ${especialidad}`
      });
      return;
    }

    historiasFiltradas.forEach(h => {
      const turno = this.mapaTurnos[h.turno_id];

      const datos = [
        `Fecha: ${new Date(h.fecha).toLocaleString()}`,
        `Especialidad: ${turno?.especialidad || '-'}`,
        `Altura: ${h.altura || 'N/A'} cm`,
        `Peso: ${h.peso || 'N/A'} kg`,
        `Presión: ${h.presion || 'N/A'}`,
        `Temperatura: ${h.temperatura || 'N/A'} °C`,
      ];

      datos.forEach(dato => {
        doc.text(dato, 15, y);
        y += 8;
      });

      // Mostrar los 3 campos dinámicos con nombres descriptivos
      if (h.datos_extra) {
        if (h.datos_extra.rangoDinamico !== undefined) {
          doc.text(`Bienestar del paciente: ${h.datos_extra.rangoDinamico}`, 15, y);
          y += 8;
        }
        if (h.datos_extra.valorNumerico !== undefined) {
          doc.text(`Cantidad de consultas: ${h.datos_extra.valorNumerico}`, 15, y);
          y += 8;
        }
        if (h.datos_extra.switchSiNo !== undefined) {
          doc.text(`Alergias: ${h.datos_extra.switchSiNo}`, 15, y);
          y += 8;
        }

        // Mostrar otros datos adicionales (excluyendo los 3 campos dinámicos)
        const otrosDatos = this.getDatosExtraAdicionales(h.datos_extra);
        if (otrosDatos.length > 0) {
          doc.text('Datos adicionales:', 15, y);
          y += 8;
          otrosDatos.forEach(item => {
            doc.text(`${item.clave}: ${item.valor}`, 20, y);
            y += 8;
          });
        }
      }

      y += 10;
    });

    doc.save(`historia_especialidad_${especialidad}.pdf`);
  }

  // Funciones para la encuesta
  abrirEncuesta(turnoId: string) {
    this.turnoIdEncuesta = turnoId;
    // Resetear datos de la encuesta
    this.encuestaData = {
      calificacionEstrellas: 0,
      recomendacion: '',
      aspectos: {
        puntualidad: false,
        profesionalismo: false,
        amabilidad: false,
        instalaciones: false,
        tiempoEspera: false
      },
      satisfaccionGeneral: 50,
      comentarios: ''
    };
    this.mostrarModalEncuesta = true;
  }

  cerrarEncuesta() {
    this.mostrarModalEncuesta = false;
    this.turnoIdEncuesta = '';
    this.hoverEstrella = 0;
  }

  esEncuestaValida(): boolean {
    return (
      this.encuestaData.calificacionEstrellas > 0 &&
      this.encuestaData.recomendacion !== '' &&
      (this.encuestaData.aspectos.puntualidad ||
       this.encuestaData.aspectos.profesionalismo ||
       this.encuestaData.aspectos.amabilidad ||
       this.encuestaData.aspectos.instalaciones ||
       this.encuestaData.aspectos.tiempoEspera)
    );
  }

  async enviarEncuesta() {
    if (!this.esEncuestaValida()) {
      Swal.fire({
        icon: 'warning',
        title: 'Encuesta incompleta',
        text: 'Por favor complete todos los campos obligatorios marcados con *'
      });
      return;
    }

    // Preparar datos de la encuesta para guardar
    const datosEncuesta = {
      calificacionEstrellas: this.encuestaData.calificacionEstrellas,
      recomendacion: this.encuestaData.recomendacion,
      aspectos: this.encuestaData.aspectos,
      satisfaccionGeneral: this.encuestaData.satisfaccionGeneral,
      comentarios: this.encuestaData.comentarios || '',
      fechaCompletada: new Date().toISOString()
    };

    // Guardar como JSON string en la columna encuestaPaciente
    const { error } = await this.supabase.supabase
      .from('turnos')
      .update({ encuestaPaciente: JSON.stringify(datosEncuesta) })
      .eq('id', this.turnoIdEncuesta);

    if (!error) {
      Swal.fire({
        icon: 'success',
        title: '¡Gracias!',
        text: 'Tu encuesta ha sido registrada exitosamente.'
      });
      this.cerrarEncuesta();
      this.ngOnInit(); // Recargar datos
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la encuesta. Por favor intenta nuevamente.'
      });
    }
  }

}
