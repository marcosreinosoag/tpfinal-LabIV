import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Supabase } from '../../servicios/supabase';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslationService, Language } from '../../servicios/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule], 
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  loginForm = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]],  // Validación de email
    password: ['', Validators.required]  // Validación de contraseña
  });
  errorMessage: string | null = null;
  iniciandoSesion: boolean = false;
  currentLanguage: Language = 'es';
  languages: { code: Language; name: string }[] = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' }
  ];
  private supabaseService = inject(Supabase);  // Servicio de Supabase
  private router = inject(Router);  // Inyectamos el router para navegar
  public translationService = inject(TranslationService);

  constructor() {
    // Establecer idioma a español sin guardar en localStorage
    this.translationService.setLanguage('es', false);
    this.currentLanguage = 'es';
  }

  changeLanguage(language: Language) {
    this.translationService.setLanguage(language, false);
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  // Datos de acceso rápido (usuarios predefinidos)
  quickAccessUsers = [
    { email: 'jotebe5731@mekuron.com', password: '12345678', rol: 'admin', fotoPerfil: 'https://sjmmmfxkuimzkkabpkwn.supabase.co/storage/v1/object/public/imagenes/Jose-Lopez-1765945493076' },
    { email: 'bomiya5332@mucate.com', password: '12345678', rol: 'paciente', fotoPerfil: 'https://sjmmmfxkuimzkkabpkwn.supabase.co/storage/v1/object/public/imagenes/Paciente-Krilin-Paz-1-1765944523550' },
    { email: 'fivogog687@mekuron.com', password: '12345678', rol: 'paciente', fotoPerfil: 'https://sjmmmfxkuimzkkabpkwn.supabase.co/storage/v1/object/public/imagenes/Paciente-Popo-Tevez-1-1765945111196' },
    { email: 'gowafar398@mekuron.com', password: '12345678', rol: 'paciente', fotoPerfil: 'https://sjmmmfxkuimzkkabpkwn.supabase.co/storage/v1/object/public/imagenes/Paciente-Roshi-Rafa-1-1765944928517' },
    { email: 'sivov64564@mekuron.com', password: '12345678', rol: 'especialista', fotoPerfil: 'https://sjmmmfxkuimzkkabpkwn.supabase.co/storage/v1/object/public/imagenes/Especialista-Goku-Perez-1-1765944119670' },
    { email: 'piwojo1400@mucate.com', password: '12345678', rol: 'especialista', fotoPerfil: 'https://sjmmmfxkuimzkkabpkwn.supabase.co/storage/v1/object/public/imagenes/Especialista-Ten-Golz-1-1765944726605' },
  ];

  // Método para manejar el inicio de sesión rápido
  async onQuickAccessLogin(email: string, password: string) {
    if (this.iniciandoSesion) return;
    this.loginForm.setValue({ email, password });  // Seteamos los valores de email y contraseña en el formulario
    await this.onSubmit();  // Llamamos al método onSubmit para manejar el login
  }

async onSubmit() {
  if (this.iniciandoSesion) return;
  
  if (this.loginForm.valid) {
    let { email, password } = this.loginForm.value;

    if (!email || !password) {
      this.errorMessage = this.translate('login.error.required');
      return;
    }

    this.iniciandoSesion = true;
    this.errorMessage = null;

    try {
      // Intentar login
      const { data: signInResult, error: loginError } = await this.supabaseService.supabase.auth.signInWithPassword({
        email,
        password
      });

      // Si hay error de login
      if (loginError) {
        if (loginError.message.toLowerCase().includes('email not confirmed')) {
          Swal.fire({
            icon: 'error',
            title: this.translate('login.error.emailNotConfirmed'),
            text: this.translate('login.error.emailNotConfirmedText'),
            confirmButtonText: 'OK'
          });
        } else {
          this.errorMessage = this.translate('login.error.credentials');
        }
        this.iniciandoSesion = false;
        return;
      }

      // Obtener datos del usuario autenticado
      const { data: userData } = await this.supabaseService.supabase.auth.getUser();

      try {
      if (userData?.user?.id && userData?.user?.email) {
        await this.supabaseService.supabase
          .from('logs_ingreso')
          .insert([
            {
              usuario_id: userData.user.id,
              email: userData.user.email,
              fecha: new Date().toISOString()
            }
          ]);
      }
    } catch (logError) {
      console.warn('No se pudo registrar el log de ingreso:', logError);
    }


      // Verificar si el correo está confirmado
      if (!userData?.user?.confirmed_at) {
        await this.supabaseService.supabase.auth.signOut();
        Swal.fire({
          icon: 'warning',
          title: this.translate('login.error.verifyEmail'),
          text: this.translate('login.error.verifyEmailText'),
          confirmButtonText: 'OK'
        });
        this.iniciandoSesion = false;
        return;
      }

      // Buscar usuario en la tabla personalizada
      const { data, error: userError } = await this.supabaseService.supabase
        .from('usuarios')
        .select('rol, estado')
        .eq('mail', email)
        .single();

      if (userError || !data) {
        this.errorMessage = this.translate('login.error.userStatus');
        await this.supabaseService.supabase.auth.signOut();
        this.iniciandoSesion = false;
        return;
      }

      const rol = data.rol?.toLowerCase();
      const estado = data.estado?.toLowerCase();

      // Si es especialista y no está activo
      if (rol === 'especialista' && estado !== 'activo') {
        await this.supabaseService.supabase.auth.signOut();
        Swal.fire({
          icon: 'error',
          title: this.translate('login.error.accountDisabled'),
          text: this.translate('login.error.accountDisabledText'),
          confirmButtonText: 'OK'
        });
        this.iniciandoSesion = false;
        return;
      }

      localStorage.setItem('rol', rol);

      // Redirigir según el rol
      if (rol === 'admin') {
        this.router.navigate(['/admin']);
      } else if (rol === 'especialista') {
        this.router.navigate(['/mis-turnos-especialista']);
      } else if (rol === 'paciente') {
        this.router.navigate(['/mis-turnos-paciente']);
      } else {
        this.router.navigate(['/bienvenida']);
      }

    } catch (error) {
      this.errorMessage = this.translate('login.error.general');
      this.iniciandoSesion = false;
    } finally {
      this.iniciandoSesion = false;
    }
  }
}

    goTo(path: string) {
    this.router.navigate([`/registro`]); 
  }

}
