import { Directive, ElementRef, Renderer2, Output, EventEmitter, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appToggleCaptchaButton]'
})
export class ToggleCaptchaButtonDirective implements OnInit {
  @Input() estadoInicial: boolean = true; // opcional, por defecto habilitado
  @Output() estadoCambiado = new EventEmitter<boolean>();

  private habilitado: boolean = true;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.habilitado = this.estadoInicial;
    this.crearBoton();
  }

  private crearBoton(): void {
    const boton = this.renderer.createElement('button');
    this.actualizarTexto(boton);

    this.renderer.setStyle(boton, 'margin', '10px 0');
    this.renderer.setStyle(boton, 'padding', '10px 20px');
    this.renderer.setStyle(boton, 'backgroundColor', '#4f46e5');
    this.renderer.setStyle(boton, 'color', 'white');
    this.renderer.setStyle(boton, 'border', 'none');
    this.renderer.setStyle(boton, 'borderRadius', '5px');
    this.renderer.setStyle(boton, 'cursor', 'pointer');

    this.renderer.listen(boton, 'click', () => {
      this.habilitado = !this.habilitado;
      this.actualizarTexto(boton);
      this.estadoCambiado.emit(this.habilitado);
    });

    this.renderer.appendChild(this.el.nativeElement, boton);
  }

  private actualizarTexto(boton: HTMLElement): void {
    const texto = this.habilitado ? 'Deshabilitar Captcha' : 'Habilitar Captcha';
    this.renderer.setProperty(boton, 'innerText', texto);
  }
}