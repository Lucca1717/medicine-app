import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CurrentUserService } from '../core/services/current-user.service';
import { PeriodsPageComponent } from './periods-page.component';

describe('PeriodsPageComponent', () => {
  let fixture: ComponentFixture<PeriodsPageComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodsPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: CurrentUserService,
          useValue: { selectedUserId: signal<string | null>(null) },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PeriodsPageComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('asks the user to select a current user when none is selected', () => {
    expect(fixture.nativeElement.textContent).toContain(
      'Select a current user to manage scheduled periods.',
    );
    expect(fixture.nativeElement.querySelector('ion-fab')).toBeNull();
  });
});
