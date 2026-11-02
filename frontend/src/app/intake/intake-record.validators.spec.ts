import { FormBuilder } from '@angular/forms';
import { IntakeStatus } from '../core/models/medication-manager';
import { applyStatusValidators } from './intake-record.validators';

describe('intake status validators', () => {
  const builder = new FormBuilder();

  it('requires actual intake fields only for TAKEN', () => {
    const form = builder.group({
      medicationPeriodId: builder.control<string | null>('period'),
      scheduledAt: builder.nonNullable.control('2026-01-01T08:00'),
      takenAt: builder.control<string | null>(null),
      quantityValue: builder.control<number | null>(null),
      quantityUnitId: builder.control<string | null>(null),
      status: builder.nonNullable.control<IntakeStatus>('PENDING'),
    });
    applyStatusValidators(form);
    expect(form.valid).toBe(true);
    form.controls.status.setValue('TAKEN');
    applyStatusValidators(form);
    expect(form.controls.takenAt.hasError('required')).toBe(true);
    expect(form.controls.quantityValue.hasError('required')).toBe(true);
    expect(form.controls.quantityUnitId.hasError('required')).toBe(true);
    form.controls.takenAt.setValue('2026-01-01T08:05');
    form.controls.quantityValue.setValue(1);
    form.controls.quantityUnitId.setValue('unit');
    expect(form.valid).toBe(true);
  });
});
