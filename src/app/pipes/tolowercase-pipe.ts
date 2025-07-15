import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tolowercase',
  standalone: true
})
export class ToLowerCasePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value || typeof value !== 'string') return '';
    return value.toLowerCase();
  }
}
