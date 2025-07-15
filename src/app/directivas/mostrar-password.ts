import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appMostrarPassword]',
   standalone: true
})
export class MostrarPassword {

  private visible = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click')
  togglePassword() {
    const input = this.el.nativeElement.previousElementSibling;
    if (input?.type === 'password' || input?.type === 'text') {
      this.visible = !this.visible;
      this.renderer.setAttribute(input, 'type', this.visible ? 'text' : 'password');
      this.el.nativeElement.textContent = this.visible ? '🙈' : '👁️';
    }
  }

}
