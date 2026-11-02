import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserMedicationsApiService } from './user-medications-api.service';

describe('UserMedicationsApiService', () => {
  let service: UserMedicationsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserMedicationsApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserMedicationsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists medications for a user', () => {
    service.listForUser('user-1').subscribe();
    http.expectOne({ method: 'GET', url: '/api/user-medications?userId=user-1' });
  });
});
