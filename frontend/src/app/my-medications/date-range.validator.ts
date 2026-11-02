import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const endDateNotBeforeStartDate: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const startDate = control.get('startDate')?.value as string | null | undefined;
  const endDate = control.get('endDate')?.value as string | null | undefined;
  if (!startDate || !endDate || endDate >= startDate) {
    return null;
  }
  return { endDateBeforeStartDate: true };
};
