import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IntakeStatus } from '../core/models/medication-manager';

export interface IntakeFormControls {
  medicationPeriodId: FormControl<string | null>;
  scheduledAt: FormControl<string>;
  takenAt: FormControl<string | null>;
  quantityValue: FormControl<number | null>;
  quantityUnitId: FormControl<string | null>;
  status: FormControl<IntakeStatus>;
}

export type IntakeForm = FormGroup<IntakeFormControls>;

export function applyStatusValidators(form: IntakeForm): void {
  const taken = form.controls.status.value === 'TAKEN';
  const takenAt = form.controls.takenAt;
  const quantityValue = form.controls.quantityValue;
  const quantityUnitId = form.controls.quantityUnitId;
  const validators = taken ? [Validators.required] : [];

  takenAt.setValidators(validators);
  quantityValue.setValidators(taken ? [Validators.required, Validators.min(0.001)] : []);
  quantityUnitId.setValidators(validators);
  takenAt.updateValueAndValidity({ emitEvent: false });
  quantityValue.updateValueAndValidity({ emitEvent: false });
  quantityUnitId.updateValueAndValidity({ emitEvent: false });
}

export const statusFieldsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const form = control as IntakeForm;
  const pending = form.controls.status.value === 'PENDING';
  const hasActualFields =
    Boolean(form.controls.takenAt.value) ||
    form.controls.quantityValue.value !== null ||
    Boolean(form.controls.quantityUnitId.value);
  return pending && hasActualFields ? { actualFieldsNotAllowed: true } : null;
};
