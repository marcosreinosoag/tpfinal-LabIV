import { Component, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supabase } from '../../servicios/supabase';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './informes.html',
  styleUrls: ['./informes.scss']
})
export class Informes implements OnInit {
  supabase = inject(Supabase);
  logs: any[] = [];
  turnosPorEspecialidad: any[] = [];
  turnosPorDia: { [fecha: string]: number } = {};
seccionActiva: 'logs' | 'especialidad' | 'dia' | 'medico' | 'finalizados' = 'logs';


  
  public barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: {
        label: (ctx: any) => `Cantidad de Turnos: ${ctx.raw}`
      }}
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
chartEspecialidad: any;
chartDia: any;
chartMedico:any;
fechaDesde: string = '';
fechaHasta: string = '';
turnosPorMedico: { email: string; cantidad: number }[] = [];
fechaDesdeFinalizados: string = '';
fechaHastaFinalizados: string = '';
turnosFinalizadosPorMedico: { email: string; cantidad: number }[] = [];
chartFinalizadosMedico: any;



constructor(
  private router: Router,
  private cdr: ChangeDetectorRef,
  private zone: NgZone
) {}

  async ngOnInit() {
    Chart.register(...registerables);
    this.logs = await this.supabase.getLogsIngreso();
     this.turnosPorEspecialidad = await this.supabase.getTurnosPorEspecialidad();
     this.renderGraficoTurnosPorEspecialidad();

     await this.cargarTurnosPorDia(); 
     this.renderGraficoTurnosPorDia();
     

setTimeout(() => {
    if (this.turnosPorEspecialidad.length > 0) {
      this.renderGraficoTurnosPorEspecialidad();
    }

    if (this.hayTurnosPorDia) {
      this.renderGraficoTurnosPorDia();
    }
  }, 100);
     
  }   

  exportToExcel() {
  const datos = this.logs.map(log => ({
    Email: log.email,
    Fecha: new Date(log.fecha).toLocaleDateString(),
    Hora: new Date(log.fecha).toLocaleTimeString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(datos);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs de Ingreso');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  saveAs(blob, 'logs_ingreso.xlsx');
}

renderGraficoTurnosPorEspecialidad() {
  const labels = this.turnosPorEspecialidad.map(t => t.especialidad);
  const data = this.turnosPorEspecialidad.map(t => t.cantidad);

  const coloresPorEspecialidad: { [key: string]: string } = {
    'Clínico': '#00b4d8',
    'Cardiología': '#ff6b6b',
    'Dermatología': '#8338ec',
    'Pediatría': '#ffbe0b',
    'Ginecología': '#ff006e',
    'Odontología': '#06d6a0',
    // default para otras
    'default': '#adb5bd'
  };

  const backgroundColors = labels.map(especialidad =>
    coloresPorEspecialidad[especialidad] || coloresPorEspecialidad['default']
  );

  const ctx = document.getElementById('graficoTurnosEspecialidad') as HTMLCanvasElement;

  if (this.chartEspecialidad) this.chartEspecialidad.destroy();

  this.chartEspecialidad = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Cantidad de Turnos',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Turnos por Especialidad',
          font: {
            size: 18,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
      stepSize: 1,    
      precision: 0         
    }
        }
      }
    }
  });
}
cambiarSeccion(seccion: 'logs' | 'especialidad' | 'dia' | 'medico' | 'finalizados') {

  this.seccionActiva = seccion;

  // Destruir el gráfico anterior para que se regenere limpio
  if (seccion === 'especialidad' && this.chartEspecialidad) {
    this.chartEspecialidad.destroy();
    this.chartEspecialidad = null;
  }

  if (seccion === 'dia' && this.chartDia) {
    this.chartDia.destroy();
    this.chartDia = null;
  }

  if (seccion === 'medico' && this.chartMedico) {
  this.chartMedico.destroy();
  this.chartMedico = null;
}
if (seccion === 'finalizados' && this.chartFinalizadosMedico) {
  this.chartFinalizadosMedico.destroy();
  this.chartFinalizadosMedico = null;
}

}


exportarGraficoAPdf() {
  const canvas = document.getElementById('graficoTurnosEspecialidad') as HTMLCanvasElement;

  if (!canvas) {
    console.error('No se encontró el canvas del gráfico.');
    return;
  }

  const imagen = canvas.toDataURL('image/png');
  const doc = new jsPDF();

  doc.text('Turnos por Especialidad', 10, 10);
  doc.addImage(imagen, 'PNG', 10, 20, 190, 90); 
  doc.save('grafico-turnos-especialidad.pdf');
}

async cargarTurnosPorDia() {
  this.turnosPorDia = await this.supabase.getTurnosPorDia();
}

renderGraficoTurnosPorDia() {
  const labels = Object.keys(this.turnosPorDia);
  const data = Object.values(this.turnosPorDia);

  const backgroundColors = labels.map((_, index) => {
    const colores = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#f67019'];
    return colores[index % colores.length];
  });

  const ctx = document.getElementById('graficoTurnosDia') as HTMLCanvasElement;

  if (this.chartDia) this.chartDia.destroy();

  this.chartDia = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Cantidad de Turnos',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Turnos por Día',
          font: {
            size: 18,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0
          }
        }
      }
    }
  });
}


exportarGraficoPorDiaAPdf() {
  const canvas = document.getElementById('graficoTurnosDia') as HTMLCanvasElement;

  if (!canvas) {
    console.error('No se encontró el canvas del gráfico.');
    return;
  }

  const imagen = canvas.toDataURL('image/png');
  const doc = new jsPDF();

  doc.text('Turnos por Día', 10, 10);
  doc.addImage(imagen, 'PNG', 10, 20, 190, 90); 
  doc.save('grafico-turnos-dia.pdf');
}
get hayTurnosPorDia(): boolean {
  return Object.keys(this.turnosPorDia).length > 0;
}

ngAfterViewChecked(): void {
  if (this.seccionActiva === 'especialidad' && !this.chartEspecialidad && this.turnosPorEspecialidad.length > 0) {
    this.renderGraficoTurnosPorEspecialidad();
  }

  if (this.seccionActiva === 'dia' && !this.chartDia && this.hayTurnosPorDia) {
    this.renderGraficoTurnosPorDia();
  }
  if (this.seccionActiva === 'medico' && !this.chartMedico && this.turnosPorMedico.length > 0) {
  this.renderGraficoTurnosPorMedico();
}

}

async getTurnosPorMedicoEnLapso(desde: string, hasta: string): Promise<{ [email: string]: number }> {
  const { data, error } = await this.supabase.supabase
    .from('turnos')
    .select('especialista, fecha')
    .gte('fecha', desde)
    .lte('fecha', hasta);

  if (error) {
    console.error('Error al obtener turnos por médico:', error.message);
    return {};
  }

  const agrupados: { [email: string]: number } = {};
  data.forEach((turno: any) => {
    const medico = turno.especialista || 'Sin nombre';
    agrupados[medico] = (agrupados[medico] || 0) + 1;
  });

  return agrupados;
}

async filtrarTurnosPorMedico() {
 if (!this.fechaDesde || !this.fechaHasta || this.fechaDesde > this.fechaHasta) {
    Swal.fire({
      icon: 'error',
      title: 'Fechas inválidas',
      text: 'Por favor seleccioná un rango de fechas válido.',
      confirmButtonColor: '#027373'
    });
    return;
  }

  this.turnosPorMedico = await this.supabase.getTurnosPorMedico(this.fechaDesde, this.fechaHasta);
  console.log('Turnos filtrados:', this.turnosPorMedico);

  // Esperar a que Angular actualice el DOM
  this.zone.runOutsideAngular(() => {
    setTimeout(() => {
      this.zone.run(() => {
        this.cdr.detectChanges(); // forzamos que se actualice la vista
        const canvas = document.getElementById('graficoTurnosPorMedico');
        if (canvas) {
          this.renderGraficoTurnosPorMedico();
        } else {
          console.warn('Canvas graficoTurnosPorMedico sigue sin aparecer. Probá con más delay o revisá *ngIf.');
        }
      });
    }, 0);
  });
}



renderGraficoTurnosPorMedico() {
  const labels = this.turnosPorMedico.map(t => t.email);
  const data = this.turnosPorMedico.map(t => t.cantidad);
  const colores = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#f67019'];
  const backgroundColors = labels.map((_, i) => colores[i % colores.length]);

  const canvas = document.getElementById('graficoTurnosPorMedico') as HTMLCanvasElement;
  if (!canvas) return;

  if (this.chartMedico) this.chartMedico.destroy();

  this.chartMedico = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Cantidad de Turnos',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Turnos por Médico',
          font: { size: 18, weight: 'bold' }
        },
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 }
        }
      }
    }
  });
}

exportarGraficoPorMedicoAPdf() {
  const canvas = document.getElementById('graficoTurnosPorMedico') as HTMLCanvasElement;

  if (!canvas) {
    console.error('No se encontró el canvas del gráfico.');
    return;
  }

  const imagen = canvas.toDataURL('image/png');
  const doc = new jsPDF();

  doc.text('Turnos por Médico', 10, 10);
  doc.addImage(imagen, 'PNG', 10, 20, 190, 90);
  doc.save('grafico-turnos-medico.pdf');
}

renderGraficoFinalizadosPorMedico() {
  const labels = this.turnosFinalizadosPorMedico.map(t => t.email);
  const data = this.turnosFinalizadosPorMedico.map(t => t.cantidad);
  const colores = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#f67019'];
  const backgroundColors = labels.map((_, i) => colores[i % colores.length]);

  const canvas = document.getElementById('graficoFinalizadosPorMedico') as HTMLCanvasElement;
  if (!canvas) {
    console.warn('Canvas graficoFinalizadosPorMedico no encontrado aún');
    return;
  }

  if (this.chartFinalizadosMedico) this.chartFinalizadosMedico.destroy();

  this.chartFinalizadosMedico = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Turnos Finalizados',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Turnos Finalizados por Médico',
          font: { size: 18, weight: 'bold' }
        },
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 }
        }
      }
    }
  });
}
async filtrarTurnosFinalizadosPorMedico() {
  if (!this.fechaDesdeFinalizados || !this.fechaHastaFinalizados || this.fechaDesdeFinalizados > this.fechaHastaFinalizados) {
    Swal.fire({
      icon: 'error',
      title: 'Fechas inválidas',
      text: 'Por favor seleccioná un rango de fechas válido para los turnos finalizados.',
      confirmButtonColor: '#027373'
    });
    return;
  }

  this.turnosFinalizadosPorMedico = await this.supabase.getTurnosFinalizadosPorMedico(
    this.fechaDesdeFinalizados,
    this.fechaHastaFinalizados
  );

  console.log('Turnos finalizados filtrados:', this.turnosFinalizadosPorMedico);

  this.zone.runOutsideAngular(() => {
    setTimeout(() => {
      this.zone.run(() => {
        this.cdr.detectChanges(); // fuerza detección de cambios
        const canvas = document.getElementById('graficoFinalizadosPorMedico');
        if (canvas) {
          this.renderGraficoFinalizadosPorMedico();
        } else {
          console.warn('Canvas graficoFinalizadosPorMedico no encontrado aún. Probá con más delay.');
        }
      });
    }, 100); 
  });
}


exportarGraficoFinalizadosPorMedicoAPdf() {
  const canvas = document.getElementById('graficoFinalizadosPorMedico') as HTMLCanvasElement;

  if (!canvas) {
    console.error('No se encontró el canvas del gráfico de finalizados.');
    return;
  }

  const imagen = canvas.toDataURL('image/png');
  const doc = new jsPDF();

  doc.text('Turnos Finalizados por Médico', 10, 10);
  doc.addImage(imagen, 'PNG', 10, 20, 190, 90);
  doc.save('grafico-turnos-finalizados-medico.pdf');
}



  logout() {
    this.supabase.supabase.auth.signOut();
    location.href = '/bienvenida';
  }

  goTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
