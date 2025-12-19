import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'es' | 'en' | 'pt';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
    pt: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage$ = new BehaviorSubject<Language>('es');
  private translations: Translations = {
    // Bienvenida
    'welcome.title': {
      es: 'Bienvenidos',
      en: 'Welcome',
      pt: 'Bem-vindos'
    },
    'welcome.subtitle': {
      es: 'Clínica OnLine, especialista en salud, cuenta con:',
      en: 'Clínica OnLine, health specialist, has:',
      pt: 'Clínica OnLine, especialista em saúde, possui:'
    },
    'welcome.consultorios': {
      es: '6 consultorios',
      en: '6 consulting rooms',
      pt: '6 consultórios'
    },
    'welcome.laboratorios': {
      es: 'Dos laboratorios físicos',
      en: 'Two physical laboratories',
      pt: 'Dois laboratórios físicos'
    },
    'welcome.salaEspera': {
      es: 'Una sala de espera general',
      en: 'A general waiting room',
      pt: 'Uma sala de espera geral'
    },
    'welcome.register': {
      es: 'Registrarse',
      en: 'Sign up',
      pt: 'Registrar-se'
    },
    'welcome.login': {
      es: 'Iniciar sesión',
      en: 'Log in',
      pt: 'Entrar'
    },
    'welcome.description': {
      es: 'Trabajan profesionales de diversas especialidades, que ocupan los consultorios acorde a su disponibilidad, recibiendo pacientes con turno para consulta o tratamiento.',
      en: 'Professionals from various specialties work here, occupying the consulting rooms according to their availability, receiving patients with appointments for consultation or treatment.',
      pt: 'Trabalham profissionais de diversas especialidades, que ocupam os consultórios de acordo com sua disponibilidade, recebendo pacientes com agendamento para consulta ou tratamento.'
    },
    'welcome.schedule': {
      es: 'Horarios',
      en: 'Schedule',
      pt: 'Horários'
    },
    'welcome.openToPublic': {
      es: 'Abierto al público:',
      en: 'Open to the public:',
      pt: 'Aberto ao público:'
    },
    'welcome.weekdays': {
      es: 'Lunes a Viernes',
      en: 'Monday to Friday',
      pt: 'Segunda a Sexta'
    },
    'welcome.weekdaysTime': {
      es: 'de 8:00 a 19:00',
      en: 'from 8:00 to 19:00',
      pt: 'das 8:00 às 19:00'
    },
    'welcome.saturday': {
      es: 'Sábados',
      en: 'Saturdays',
      pt: 'Sábados'
    },
    'welcome.saturdayTime': {
      es: 'de 8:00 a 14:00',
      en: 'from 8:00 to 14:00',
      pt: 'das 8:00 às 14:00'
    },
    'welcome.clinicName': {
      es: 'Clínica OnLine',
      en: 'Clínica OnLine',
      pt: 'Clínica OnLine'
    },
    'welcome.specialists': {
      es: 'Especialistas en Salud',
      en: 'Health Specialists',
      pt: 'Especialistas em Saúde'
    },

    // Login
    'login.title': {
      es: 'Iniciar sesión',
      en: 'Log in',
      pt: 'Entrar'
    },
    'login.email': {
      es: 'Email',
      en: 'Email',
      pt: 'Email'
    },
    'login.emailPlaceholder': {
      es: 'Ingresá tu correo',
      en: 'Enter your email',
      pt: 'Digite seu email'
    },
    'login.password': {
      es: 'Contraseña',
      en: 'Password',
      pt: 'Senha'
    },
    'login.passwordPlaceholder': {
      es: 'Ingresá tu contraseña',
      en: 'Enter your password',
      pt: 'Digite sua senha'
    },
    'login.submit': {
      es: 'Iniciar sesión',
      en: 'Log in',
      pt: 'Entrar'
    },
    'login.register': {
      es: 'Registrarse',
      en: 'Sign up',
      pt: 'Registrar-se'
    },
    'login.error.credentials': {
      es: 'Credenciales incorrectas. Por favor, intenta de nuevo.',
      en: 'Incorrect credentials. Please try again.',
      pt: 'Credenciais incorretas. Por favor, tente novamente.'
    },
    'login.error.emailNotConfirmed': {
      es: 'Correo no verificado',
      en: 'Email not verified',
      pt: 'Email não verificado'
    },
    'login.error.emailNotConfirmedText': {
      es: 'Por favor, revisá tu correo y verificá tu cuenta antes de iniciar sesión.',
      en: 'Please check your email and verify your account before logging in.',
      pt: 'Por favor, verifique seu email e confirme sua conta antes de fazer login.'
    },
    'login.error.accountDisabled': {
      es: 'Cuenta inhabilitada',
      en: 'Account disabled',
      pt: 'Conta desabilitada'
    },
    'login.error.accountDisabledText': {
      es: 'Tu cuenta de especialista fue inhabilitada. Contactá al administrador.',
      en: 'Your specialist account has been disabled. Contact the administrator.',
      pt: 'Sua conta de especialista foi desabilitada. Entre em contato com o administrador.'
    },
    'login.error.verifyEmail': {
      es: 'Verificá tu correo',
      en: 'Verify your email',
      pt: 'Verifique seu email'
    },
    'login.error.verifyEmailText': {
      es: 'Tu cuenta aún no fue verificada. Revisá tu correo y hacé clic en el enlace de activación.',
      en: 'Your account has not been verified yet. Check your email and click on the activation link.',
      pt: 'Sua conta ainda não foi verificada. Verifique seu email e clique no link de ativação.'
    },
    'login.error.general': {
      es: 'Error al iniciar sesión. Intenta nuevamente.',
      en: 'Error logging in. Please try again.',
      pt: 'Erro ao fazer login. Tente novamente.'
    },
    'login.error.required': {
      es: 'Correo y contraseña son obligatorios.',
      en: 'Email and password are required.',
      pt: 'Email e senha são obrigatórios.'
    },
    'login.error.userStatus': {
      es: 'No se pudo obtener el estado del usuario.',
      en: 'Could not get user status.',
      pt: 'Não foi possível obter o status do usuário.'
    },

    // Registro
    'register.selectUserType': {
      es: 'Selecciona tu tipo de usuario',
      en: 'Select your user type',
      pt: 'Selecione seu tipo de usuário'
    },
    'register.patient': {
      es: 'Paciente',
      en: 'Patient',
      pt: 'Paciente'
    },
    'register.specialist': {
      es: 'Especialista',
      en: 'Specialist',
      pt: 'Especialista'
    },
    'register.title': {
      es: 'Registro de',
      en: 'Registration of',
      pt: 'Registro de'
    },
    'register.name': {
      es: 'Nombre',
      en: 'Name',
      pt: 'Nome'
    },
    'register.lastName': {
      es: 'Apellido',
      en: 'Last name',
      pt: 'Sobrenome'
    },
    'register.age': {
      es: 'Edad',
      en: 'Age',
      pt: 'Idade'
    },
    'register.dni': {
      es: 'DNI',
      en: 'ID',
      pt: 'CPF'
    },
    'register.email': {
      es: 'Email',
      en: 'Email',
      pt: 'Email'
    },
    'register.password': {
      es: 'Contraseña',
      en: 'Password',
      pt: 'Senha'
    },
    'register.healthInsurance': {
      es: 'Obra Social',
      en: 'Health Insurance',
      pt: 'Plano de Saúde'
    },
    'register.profilePhoto1': {
      es: 'Foto de Perfil 1:',
      en: 'Profile Photo 1:',
      pt: 'Foto de Perfil 1:'
    },
    'register.profilePhoto2': {
      es: 'Foto de Perfil 2:',
      en: 'Profile Photo 2:',
      pt: 'Foto de Perfil 2:'
    },
    'register.profilePhoto': {
      es: 'Foto de Perfil',
      en: 'Profile Photo',
      pt: 'Foto de Perfil'
    },
    'register.specialties': {
      es: 'Especialidades:',
      en: 'Specialties:',
      pt: 'Especialidades:'
    },
    'register.addSpecialty': {
      es: 'Agregar nueva especialidad',
      en: 'Add new specialty',
      pt: 'Adicionar nova especialidade'
    },
    'register.add': {
      es: 'Agregar',
      en: 'Add',
      pt: 'Adicionar'
    },
    'register.submit': {
      es: 'Registrar',
      en: 'Register',
      pt: 'Registrar'
    },
    'register.registering': {
      es: 'Registrando...',
      en: 'Registering...',
      pt: 'Registrando...'
    },
    'register.error.incomplete': {
      es: 'Formulario incompleto o inválido',
      en: 'Incomplete or invalid form',
      pt: 'Formulário incompleto ou inválido'
    },
    'register.error.captcha': {
      es: 'Por favor, resolvé el captcha para continuar.',
      en: 'Please solve the captcha to continue.',
      pt: 'Por favor, resolva o captcha para continuar.'
    },
    'register.error.emailCheck': {
      es: 'No se pudo verificar el correo. Intenta nuevamente.',
      en: 'Could not verify email. Please try again.',
      pt: 'Não foi possível verificar o email. Tente novamente.'
    },
    'register.error.emailExists': {
      es: 'El correo electrónico ingresado ya está en uso.',
      en: 'The email entered is already in use.',
      pt: 'O email inserido já está em uso.'
    },
    'register.error.emailExistsTitle': {
      es: 'Correo ya registrado',
      en: 'Email already registered',
      pt: 'Email já registrado'
    },
    'register.error.authEmailExists': {
      es: 'El correo ya está en uso en el sistema de autenticación.',
      en: 'The email is already in use in the authentication system.',
      pt: 'O email já está em uso no sistema de autenticação.'
    },
    'register.error.general': {
      es: 'Hubo un problema al registrar el usuario',
      en: 'There was a problem registering the user',
      pt: 'Houve um problema ao registrar o usuário'
    },
    'register.error.emailRegistered': {
      es: 'Este correo ya fue registrado. Probá con otro.',
      en: 'This email has already been registered. Try another one.',
      pt: 'Este email já foi registrado. Tente outro.'
    },
    'register.success': {
      es: 'Usuario registrado correctamente',
      en: 'User registered successfully',
      pt: 'Usuário registrado com sucesso'
    },
    'register.successTitle': {
      es: 'Éxito',
      en: 'Success',
      pt: 'Sucesso'
    },
    'register.error.required': {
      es: 'Campo obligatorio',
      en: 'Required field',
      pt: 'Campo obrigatório'
    },
    'register.error.invalidFormat': {
      es: 'Formato inválido',
      en: 'Invalid format',
      pt: 'Formato inválido'
    },
    'register.error.invalidEmail': {
      es: 'Correo inválido',
      en: 'Invalid email',
      pt: 'Email inválido'
    },
    'register.error.shortPassword': {
      es: 'Contraseña muy corta',
      en: 'Password too short',
      pt: 'Senha muito curta'
    },
    'register.error.minAge': {
      es: 'Edad mínima inválida',
      en: 'Invalid minimum age',
      pt: 'Idade mínima inválida'
    },
    'register.error.maxAge': {
      es: 'Edad máxima inválida',
      en: 'Invalid maximum age',
      pt: 'Idade máxima inválida'
    },
    'register.error.specialtyRequired': {
      es: 'Debe seleccionar al menos una especialidad.',
      en: 'You must select at least one specialty.',
      pt: 'Você deve selecionar pelo menos uma especialidade.'
    },

    // Idioma
    'language': {
      es: 'Idioma',
      en: 'Language',
      pt: 'Idioma'
    },
    'language.spanish': {
      es: 'Español',
      en: 'Spanish',
      pt: 'Espanhol'
    },
    'language.english': {
      es: 'Inglés',
      en: 'English',
      pt: 'Inglês'
    },
    'language.portuguese': {
      es: 'Portugués',
      en: 'Portuguese',
      pt: 'Português'
    }
  };

  constructor() {
    // Cargar idioma guardado o usar español por defecto
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['es', 'en', 'pt'].includes(savedLanguage)) {
      this.currentLanguage$.next(savedLanguage);
    } else {
      this.currentLanguage$.next('es');
    }
  }

  getCurrentLanguage(): Observable<Language> {
    return this.currentLanguage$.asObservable();
  }

  getCurrentLanguageValue(): Language {
    return this.currentLanguage$.value;
  }

  setLanguage(language: Language, saveToStorage: boolean = true): void {
    this.currentLanguage$.next(language);
    if (saveToStorage) {
      localStorage.setItem('language', language);
    }
  }

  translate(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }
    return translation[this.currentLanguage$.value] || translation['es'];
  }

  // Método para obtener traducciones directamente (útil para usar en templates)
  get(key: string): string {
    return this.translate(key);
  }
}


