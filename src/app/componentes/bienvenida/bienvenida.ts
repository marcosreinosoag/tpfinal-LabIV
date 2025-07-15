import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.scss'
})
export class Bienvenida {
    constructor(private router: Router) {}

  goToLogin(path: string) {
    this.router.navigate([`/login`]); 
  }

    goToRegistro(path: string) {
    this.router.navigate([`/registro`]); 
  }

}

