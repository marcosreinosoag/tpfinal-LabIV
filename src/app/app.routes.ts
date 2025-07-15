import { Routes , RouterModule } from '@angular/router';
import { Bienvenida } from './componentes/bienvenida/bienvenida'; 
import { Login } from './componentes/login/login';
import { Registro } from './componentes/registro/registro';
import { Administrador } from './componentes/administrador/administrador'; 
import { MisTurnosEspecialista } from './componentes/mis-turnos-especialista/mis-turnos-especialista';
import { MisTurnosPaciente } from './componentes/mis-turnos-paciente/mis-turnos-paciente';
import { SolicitarTurno } from './componentes/solicitar-turno/solicitar-turno';
import { Turnos } from './componentes/turnos/turnos';
import { SolicitarTurnoAdmin } from './componentes/solicitar-turno-admin/solicitar-turno-admin';
import { RoleGuard } from './guards/role-guard';
import { HistoriaClinica } from './componentes/historia-clinica/historia-clinica';
import { HistoriasClinicasEspecialista } from './componentes/historias-clinicas-especialista/historias-clinicas-especialista';
import { Informes } from './componentes/informes/informes';

export const routes: Routes = [
{ path: '', component: Bienvenida, data: { animation: 'InicioPage' } },
{ path: 'bienvenida', component: Bienvenida, data: { animation: 'InicioPage' } },
{ path: 'login', component: Login, data: { animation: 'LoginPage' }},
{ path: 'registro', component: Registro, data: { animation: 'RegistroPage' } },
{ path: 'historia-clinica/:id', component: HistoriaClinica, data: { animation: 'HistoriaPage' } },
{ path: 'historias-clinicas-especialista', component: HistoriasClinicasEspecialista, data: { animation: 'HistoriasClinicasEspecialista' } },
 { path: 'solicitar-turno-admin', component: SolicitarTurnoAdmin},  


  //  Solo Admin
  { 
    path: 'admin', 
    component: Administrador,
    canActivate: [RoleGuard],  
    data: { roles: ['admin'], animation: 'AdminPage' }
  },

  //  Solo Especialista
  { 
    path: 'mis-turnos-especialista', 
    component: MisTurnosEspecialista,
    canActivate: [RoleGuard],
    data: { roles: ['Especialista'], animation: 'TurnosEspecialistaPage' }
  },

  // Solo Paciente
  { 
    path: 'mis-turnos-paciente', 
    component: MisTurnosPaciente,
    canActivate: [RoleGuard],
    data: { roles: ['Paciente'], animation: 'TurnosPacientePage' }
  },

  //  Paciente o Admin
  { 
    path: 'solicitar-turno', 
    component: SolicitarTurno,
    canActivate: [RoleGuard],
    data: { roles: ['Paciente', 'admin'] ,animation: 'SolicitarTurnoPage'}
  },

  //  Solo Admin
  { 
    path: 'turnos', 
    component: Turnos,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] , animation: 'TurnosPage'}
  },

    { 
    path: 'turnos', 
    component: Turnos,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] , animation: 'TurnosPage'}
  },

  // Solo Admin
  { 
    path: 'informes', 
    component: Informes,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] ,animation: 'InformesPage' }
  }
];
