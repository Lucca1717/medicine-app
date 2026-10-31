import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MedicationFormPageComponent } from './medication-form-page.component';

describe('MedicationFormPageComponent', () => {
  it('requires a positive dosage value and a dosage unit', async () => {
    await TestBed.configureTestingModule({
      imports: [MedicationFormPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const fixture = TestBed.createComponent(MedicationFormPageComponent);
    const component = fixture.componentInstance;
    expect(component.form.invalid).toBe(true);
    component.form.patchValue({ name: 'Dipyrone', dosageValue: 500, dosageUnitId: 'unit-1' });
    expect(component.form.valid).toBe(true);
    component.form.controls.dosageValue.setValue(0);
    expect(component.form.invalid).toBe(true);
  });
});
