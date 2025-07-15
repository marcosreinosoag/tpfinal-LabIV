import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHoverZoom]',
   standalone: true
})
export class HoverZoom {

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.transform = 'scale(1.2)';
    this.el.nativeElement.style.transition = 'transform 0.3s ease';
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.transform = 'scale(1)';
  }

}
