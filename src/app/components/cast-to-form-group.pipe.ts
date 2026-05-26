import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Pipe({
  name: 'castToFormGroup',
  standalone: true
})
export class CastToFormGroupPipe implements PipeTransform {
  transform(value: AbstractControl | null): FormGroup {
    return value as FormGroup;
  }
}
