import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService, Language } from '../../servicios/translation.service';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.scss'
})
export class Bienvenida {
  currentLanguage: Language = 'es';
  languages: { code: Language; name: string }[] = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' }
  ];

  constructor(
    private router: Router,
    public translationService: TranslationService
  ) {
    // Establecer idioma a español sin guardar en localStorage
    this.translationService.setLanguage('es', false);
    this.currentLanguage = 'es';
  }

  goToLogin(path: string) {
    this.router.navigate([`/login`]); 
  }

  goToRegistro(path: string) {
    this.router.navigate([`/registro`]); 
  }

  changeLanguage(language: Language) {
    this.translationService.setLanguage(language, false);
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }
}

