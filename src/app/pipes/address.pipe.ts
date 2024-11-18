import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'address',
  standalone: true
})
export class AddressPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    if (value.length <= 8) return value;
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }
}
