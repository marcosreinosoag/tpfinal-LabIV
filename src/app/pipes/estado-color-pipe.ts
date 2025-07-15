import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoColor',
  standalone: true
})
export class EstadoColorPipe implements PipeTransform {

   transform(value: string): string {
    if (!value) return '';
    const estado = value.toLowerCase();
    if (estado === 'activo') return '🟢 Activo';
    if (estado === 'inhabilitado') return '🔴 Inhabilitado';
    return value;
  }

}
