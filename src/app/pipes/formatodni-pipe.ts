import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatodni' })
export class FormatoDniPipe implements PipeTransform {
  transform(value: string): string {
    if (!value || value.length !== 8) return value;
    return value.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
  }
}
