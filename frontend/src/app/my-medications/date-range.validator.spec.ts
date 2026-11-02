import { FormControl, FormGroup } from '@angular/forms';
import { endDateNotBeforeStartDate } from './date-range.validator';

describe('endDateNotBeforeStartDate', () => {
  it('rejects an end date before the start date', () => {
    const form = new FormGroup({
      startDate: new FormControl('2026-01-02'),
      endDate: new FormControl('2026-01-01'),
    });
    expect(endDateNotBeforeStartDate(form)).toEqual({ endDateBeforeStartDate: true });
  });

  it('allows missing or ordered dates', () => {
    expect(endDateNotBeforeStartDate(new FormGroup({
      startDate: new FormControl('2026-01-01'),
      endDate: new FormControl('2026-01-02'),
    }))).toBeNull();
    expect(endDateNotBeforeStartDate(new FormGroup({
      startDate: new FormControl('2026-01-01'),
      endDate: new FormControl(''),
    }))).toBeNull();
  });
});
