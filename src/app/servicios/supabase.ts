import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class Supabase {
  public supabase: SupabaseClient; 
  constructor() {this.supabase = createClient('https://sjmmmfxkuimzkkabpkwn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbW1tZnhrdWltemtrYWJwa3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDc0NzMsImV4cCI6MjA4MTM4MzQ3M30.PmbL_GwlZfeyOe3PxX1lRaVpFeE9RQ_mKpDpZKVypuU') }
   // Función para subir la imagen al almacenamiento de Supabase
  async uploadImage(file: File, path: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from('imagenes') // Asegúrate de tener un bucket de imágenes
        .upload(path, file);

      if (error) {
        throw error;
      }

      // Devuelve la URL pública de la imagen
      const url = this.supabase.storage.from('imagenes').getPublicUrl(data.path);
      return url.data.publicUrl;
    } catch (err) {
      console.error('Error al subir imagen:', err);
      return null;
    }
  }

   // Método para guardar el usuario en la base de datos
  async saveUser(data: any) {
    try {
      const { data: result, error } = await this.supabase
        .from('usuarios')  // Asegúrate de que la tabla 'usuarios' esté bien definida en Supabase
        .insert([data]);

      if (error) {
        console.error('Error al insertar los datos:', error.message);
        return;
      }

      console.log('Usuario guardado:', result);
    } catch (err) {
      console.error('Error al guardar usuario:', err);
    }
  }


// Función para registrar un nuevo usuario con email y contraseña
  async signUp(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      
      return data.user; // Devuelve el usuario si el registro fue exitoso
    } catch (err: any) {
      console.error('Error en el registro:', err.message || err);
      throw err;
    }
  }


  
// Método para iniciar sesión utilizando el sistema de autenticación de Supabase
async signIn(email: string, password: string) {
  try {
    // Usamos el método de Supabase para autenticar con el email y la contraseña
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      return null;
    }
    return data.user;  // Retornamos los datos del usuario si la autenticación fue exitosa

  } catch (err: any) {
    console.error('Error al iniciar sesión:', err.message || err);
    return null;
  }
}

  // Función para cerrar sesión
  async signOut() {
    await this.supabase.auth.signOut();
  }

  // Función para verificar si el email está verificado
  async verifyEmail() {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      if (error) throw new Error(error.message);
      
      // Comprobamos si el correo fue confirmado usando `email_confirmed_at`
      return data?.user?.user_metadata?.["email_confirmed_at"] ? true : false;
    } catch (err: any) {
      console.error('Error al obtener el usuario:', err.message || err);
      return false;
    }
  }

  // Obtener usuarios desde la base de datos
async getUsers() {
  const { data, error } = await this.supabase.from('usuarios').select('*');  // Asegúrate de que la tabla 'usuarios' esté bien definida en Supabase
  if (error) {
    throw error;
  }
  return data;
}

getPublicUrl(path: string): string {
  const { data } = this.supabase.storage.from('imagenes').getPublicUrl(path);
  return data?.publicUrl || '';
}

//Obtener logs ingreso

async getLogsIngreso() {
  const { data, error } = await this.supabase
    .from('logs_ingreso')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al obtener logs:', error.message);
    return [];
  }

  return data;
}

//Obtener turnos especialidad
async getTurnosPorEspecialidad() {
  const { data, error } = await this.supabase
    .from('turnos')
    .select('especialidad', { count: 'exact', head: false });

  if (error) {
    console.error('Error al obtener turnos por especialidad:', error.message);
    return [];
  }

  // Agrupar y contar
  const conteo: { [key: string]: number } = {};
  data.forEach(t => {
    const esp = t.especialidad || 'Sin especialidad';
    conteo[esp] = (conteo[esp] || 0) + 1;
  });

  return Object.entries(conteo).map(([especialidad, cantidad]) => ({
    especialidad,
    cantidad
  }));
}

//obtener turnos x dia
async getTurnosPorDia(): Promise<{ [fecha: string]: number }> {
  const { data, error } = await this.supabase
    .from('turnos')
    .select('fecha')
    .order('fecha', { ascending: true });

  if (error) {
    console.error('Error al obtener los turnos:', error.message);
    return {}; // Aseguramos que siempre se devuelva un objeto
  }

  const agrupados: { [fecha: string]: number } = {};
  data.forEach((turno: any) => {
    const fecha = turno.fecha;
    agrupados[fecha] = (agrupados[fecha] || 0) + 1;
  });

  return agrupados;
}

async getTurnosPorMedico(desde: string, hasta: string) {
  const { data, error } = await this.supabase
    .from('turnos')
    .select('especialista, fecha')
    .gte('fecha', desde)
    .lte('fecha', hasta);

  if (error) {
    console.error('Error al obtener turnos por médico:', error);
    return [];
  }

  const agrupados: { [email: string]: number } = {};
  data.forEach(t => {
    const email = t.especialista;
    if (email) {
      agrupados[email] = (agrupados[email] || 0) + 1;
    }
  });

  return Object.entries(agrupados).map(([email, cantidad]) => ({
    email,
    cantidad
  }));
}

async getTurnosFinalizadosPorMedico(desde: string, hasta: string) {
  const { data, error } = await this.supabase
    .from('turnos')
    .select('fecha, estado, especialista') // solo el email
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .eq('estado', 'realizado'); // solo los finalizados

  if (error) {
    console.error('Error al obtener turnos finalizados por médico:', error.message);
    return [];
  }

  const agrupados: { [email: string]: number } = {};
  data.forEach(t => {
    const email = t.especialista || 'Sin email';
    agrupados[email] = (agrupados[email] || 0) + 1;
  });

  return Object.entries(agrupados).map(([email, cantidad]) => ({
    email,
    cantidad
  }));
}

// Obtener cantidad de pacientes por especialidad
async getPacientesPorEspecialidad() {
  const { data: turnos, error } = await this.supabase
    .from('turnos')
    .select('especialidad, paciente');

  if (error) {
    console.error('Error al obtener pacientes por especialidad:', error.message);
    return [];
  }

  console.log('Total turnos obtenidos para pacientes por especialidad:', turnos?.length || 0);

  // Agrupar por especialidad y contar pacientes únicos
  const pacientesPorEspecialidad: { [especialidad: string]: Set<string> } = {};
  
  turnos?.forEach(t => {
    const esp = t.especialidad || 'Sin especialidad';
    const pacienteId = t.paciente;
    
    if (!pacientesPorEspecialidad[esp]) {
      pacientesPorEspecialidad[esp] = new Set();
    }
    
    if (pacienteId) {
      pacientesPorEspecialidad[esp].add(pacienteId);
    }
  });

  const resultado = Object.entries(pacientesPorEspecialidad).map(([especialidad, pacientesSet]) => ({
    especialidad,
    cantidad: pacientesSet.size
  }));

  console.log('Pacientes por especialidad calculados:', resultado);
  return resultado;
}

// Obtener cantidad de médicos por especialidad
async getMedicosPorEspecialidad() {
  // Obtener todos los usuarios primero
  const { data: allUsers, error: allError } = await this.supabase
    .from('usuarios')
    .select('id, mail, especialidades, rol');

  if (allError) {
    console.error('Error al obtener usuarios:', allError.message);
    return [];
  }

  console.log('Total usuarios obtenidos:', allUsers?.length || 0);

  // Filtrar especialistas (case-insensitive)
  const usuarios = (allUsers || []).filter(u => 
    u.rol && u.rol.toLowerCase() === 'especialista'
  );

  console.log('Total especialistas filtrados:', usuarios.length);

  // Agrupar médicos por especialidad
  const medicosPorEspecialidad: { [especialidad: string]: Set<string> } = {};
  
  usuarios.forEach(usuario => {
    let especialidades: string[] = [];
    
    if (typeof usuario.especialidades === 'string') {
      try {
        especialidades = JSON.parse(usuario.especialidades);
      } catch {
        especialidades = usuario.especialidades.split(',').map((e: string) => e.trim());
      }
    } else if (Array.isArray(usuario.especialidades)) {
      especialidades = usuario.especialidades;
    }
    
    console.log('Especialista:', usuario.mail, 'Especialidades:', especialidades);
    
    especialidades.forEach(esp => {
      if (esp && esp.trim() !== '') {
        if (!medicosPorEspecialidad[esp]) {
          medicosPorEspecialidad[esp] = new Set();
        }
        medicosPorEspecialidad[esp].add(usuario.mail);
      }
    });
  });

  const resultado = Object.entries(medicosPorEspecialidad).map(([especialidad, medicosSet]) => ({
    especialidad,
    cantidad: medicosSet.size
  }));

  console.log('Médicos por especialidad calculados:', resultado);
  return resultado;
}

// Obtener todas las encuestas de pacientes
async getEncuestasPacientes() {
  const { data, error } = await this.supabase
    .from('turnos')
    .select('id, encuestaPaciente, especialidad, fecha, paciente, especialista');

  if (error) {
    console.error('Error al obtener encuestas:', error.message);
    return [];
  }

  // Filtrar y parsear las encuestas
  const turnosConEncuesta = (data || []).filter(t => {
    return t.encuestaPaciente && 
           t.encuestaPaciente !== null && 
           t.encuestaPaciente !== 'null' &&
           String(t.encuestaPaciente).trim() !== '';
  });

  const encuestas = turnosConEncuesta.map(t => {
    try {
      let encuestaParsed;
      if (typeof t.encuestaPaciente === 'string') {
        encuestaParsed = JSON.parse(t.encuestaPaciente);
      } else {
        encuestaParsed = t.encuestaPaciente;
      }
      
      return {
        ...t,
        encuesta: encuestaParsed
      };
    } catch (parseError) {
      console.error('Error al parsear encuesta:', parseError);
      return null;
    }
  }).filter(t => t !== null && t.encuesta !== null);

  return encuestas;
}

// Obtener todos los turnos de un paciente específico
async getTurnosPorPaciente(pacienteId: string) {
  const { data, error } = await this.supabase
    .from('turnos')
    .select('*')
    .eq('paciente', pacienteId)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al obtener turnos del paciente:', error.message);
    return [];
  }

  return data || [];
}

// Obtener todos los pacientes
async getTodosLosPacientes() {
  // Obtener todos los usuarios primero para ver qué roles hay
  const { data: allUsers, error: allError } = await this.supabase
    .from('usuarios')
    .select('id, nombre, apellido, mail, rol');

  if (allError) {
    console.error('Error al obtener usuarios:', allError.message);
    return [];
  }

  console.log('Todos los usuarios obtenidos:', allUsers?.length || 0);
  console.log('Roles únicos encontrados:', [...new Set(allUsers?.map(u => u.rol) || [])]);

  // Filtrar pacientes (case-insensitive)
  const pacientes = (allUsers || []).filter(u => 
    u.rol && u.rol.toLowerCase() === 'paciente'
  );

  console.log('Pacientes filtrados:', pacientes.length, pacientes);
  
  return pacientes.map(p => ({
    id: p.id,
    nombre: p.nombre,
    apellido: p.apellido,
    mail: p.mail
  }));
}

}



