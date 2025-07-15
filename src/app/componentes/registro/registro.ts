import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Supabase } from '../../servicios/supabase';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoFocus } from '../../directivas/auto-focus';
import { MostrarPassword } from '../../directivas/mostrar-password';
import { ToggleCaptchaButtonDirective } from '../../directivas/captcha-propio';

declare global {
  interface Window {
    captchaCallback: (token: string) => void;
    grecaptcha: any;
  }
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AutoFocus, MostrarPassword, ToggleCaptchaButtonDirective],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss']
})
export class Registro implements OnInit, AfterViewChecked {
  formPaciente!: FormGroup;
  formEspecialista!: FormGroup;
  selectedRole: 'Paciente' | 'Especialista' | null = null;
  isRoleSelected = false;
  archivoSeleccionado1: File | null = null;
  archivoSeleccionado2: File | null = null;
  especialidades: string[] = ['Cardiología', 'Dermatología', 'Neurología'];
  renderizado = false;
  captchaValido = false;
  captchaHabilitado = true;
  enviando = false;  // <-- NUEVO FLAG PARA EVITAR MÚLTIPLES ENVIOS

  constructor(private fb: FormBuilder, private supabaseService: Supabase) { }

  ngOnInit(): void {
    this.formPaciente = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      edad: ['', [Validators.required, Validators.min(0), Validators.max(110)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      obraSocial: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fotoPerfil: [''],
      fotoPerfil2: ['']
    });

    this.formEspecialista = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      especialidades: this.fb.array([], Validators.required),
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fotoPerfil: ['']
    });

    window.captchaCallback = (token: string) => {
      console.log('Captcha resuelto:', token);
      this.captchaValido = true;
    };
  }

  ngAfterViewChecked() {
    if (
      this.isRoleSelected &&
      !this.renderizado &&
      window.grecaptcha &&
      document.getElementById('captcha-container')
    ) {
      this.renderizado = true;
      window.grecaptcha.render('captcha-container', {
        sitekey: '6LflVGIrAAAAABnKl8IKRYXlZIdTa_4rc2vGb1nM',
        callback: (response: string) => {
          console.log('Captcha resuelto:', response);
          this.captchaValido = true;
        }
      });
    }
  }

  get nombre() { return this.getForm().get('nombre'); }
  get apellido() { return this.getForm().get('apellido'); }
  get edad() { return this.getForm().get('edad'); }
  get dni() { return this.getForm().get('dni'); }
  get mail() { return this.getForm().get('mail'); }
  get password() { return this.getForm().get('password'); }
  get obraSocial() { return this.formPaciente.get('obraSocial'); }

  getForm(): FormGroup {
    return this.selectedRole === 'Paciente' ? this.formPaciente : this.formEspecialista;
  }

  mensajeError(controlName: string): string {
    const control = this.getForm().get(controlName);
    if (control?.hasError('required')) return 'Campo obligatorio';
    if (control?.hasError('pattern')) return 'Formato inválido';
    if (control?.hasError('email')) return 'Correo inválido';
    if (control?.hasError('minlength')) return 'Contraseña muy corta';
    if (controlName === 'edad' && control?.hasError('min')) return 'Edad mínima inválida';
    if (controlName === 'edad' && control?.hasError('max')) return 'Edad máxima inválida';
    return '';
  }

  selectRole(role: 'Paciente' | 'Especialista') {
    this.selectedRole = role;
    this.isRoleSelected = true;
    this.renderizado = false; // permitir re-render si cambia el formulario
  }

  onFileChange(event: any, fileNumber: number) {
    const file = event.target.files[0];
    if (fileNumber === 1) this.archivoSeleccionado1 = file;
    if (fileNumber === 2) this.archivoSeleccionado2 = file;
  }

  onEspecialidadChange(event: any) {
    const especialidadesArray = this.formEspecialista.get('especialidades') as FormArray;
    if (event.target.checked) {
      especialidadesArray.push(this.fb.control(event.target.value));
    } else {
      const index = especialidadesArray.controls.findIndex(x => x.value === event.target.value);
      if (index >= 0) especialidadesArray.removeAt(index);
    }
  }

  agregarEspecialidad(nuevaEspecialidad: string) {
    if (nuevaEspecialidad && !this.especialidades.includes(nuevaEspecialidad)) {
      this.especialidades.push(nuevaEspecialidad);
    }
  }

  async onSubmit() {
    if (this.enviando) return; // Evitar múltiples envíos
    this.enviando = true;

    const form = this.getForm();
    if (form.invalid) {
      Swal.fire('Error', 'Formulario incompleto o inválido', 'error');
      this.enviando = false;
      return;
    }

    if (this.captchaHabilitado && !this.captchaValido) {
      Swal.fire('Error', 'Por favor, resolvé el captcha para continuar.', 'error');
      this.enviando = false;
      return;
    }

    const formData = { ...form.value, rol: this.selectedRole };
    const password = formData.password;
    delete formData.password;

    if (this.selectedRole === 'Especialista') {
      formData.especialidades = this.formEspecialista.value.especialidades;
      formData.estado = 'inhabilitado';
    }

    if (this.archivoSeleccionado1) {
      const filePath1 = `${this.selectedRole}-${formData.nombre}-${formData.apellido}-1-${Date.now()}`;
      const foto1 = await this.supabaseService.uploadImage(this.archivoSeleccionado1, filePath1);
      if (foto1) formData.fotoPerfil = foto1;
    }

    if (this.selectedRole === 'Paciente' && this.archivoSeleccionado2) {
      const filePath2 = `${this.selectedRole}-${formData.nombre}-${formData.apellido}-2-${Date.now()}`;
      const foto2 = await this.supabaseService.uploadImage(this.archivoSeleccionado2, filePath2);
      if (foto2) formData.fotoPerfil2 = foto2;
    }

    try {
      // Validar si el mail ya está registrado en la tabla usuarios
      const { data: usuariosExistentes, error: errorMail } = await this.supabaseService.supabase
        .from('usuarios')
        .select('id')
        .eq('mail', formData.mail);

      if (errorMail) {
        Swal.fire('Error', 'No se pudo verificar el correo. Intenta nuevamente.', 'error');
        this.enviando = false;
        return;
      }

      if (usuariosExistentes && usuariosExistentes.length > 0) {
        Swal.fire('Correo ya registrado', 'El correo electrónico ingresado ya está en uso.', 'warning');
        this.enviando = false;
        return;
      }

      // Intentar registrar en Supabase Auth
      const user = await this.supabaseService.signUp(formData.mail, password);
      if (!user) {
        Swal.fire('Error', 'El correo ya está en uso en el sistema de autenticación.', 'error');
        this.enviando = false;
        return;
      }

      // Insertar en tabla usuarios
      formData.id = user.id;
      await this.supabaseService.saveUser(formData);

      this.formPaciente.reset();
      this.formEspecialista.reset();
      this.selectedRole = null;
      this.isRoleSelected = false;
      this.renderizado = false;
      this.captchaValido = false;

      Swal.fire('Éxito', 'Usuario registrado correctamente', 'success');
    } catch (error: any) {
      if (error?.message?.includes('email')) {
        Swal.fire('Error', 'Este correo ya fue registrado. Probá con otro.', 'error');
      } else {
        Swal.fire('Error', 'Hubo un problema al registrar el usuario', 'error');
      }
    } finally {
      this.enviando = false;
    }
  }

  onCaptchaResolved(token: string) {
    console.log('Captcha resuelto:', token);
    this.captchaValido = true;
  }
}