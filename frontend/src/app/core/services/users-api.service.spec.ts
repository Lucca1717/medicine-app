import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UsersApiService } from './users-api.service';

describe('UsersApiService', () => {
  let service: UsersApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsersApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates users through the users endpoint', () => {
    const request = { name: 'Jane', email: 'jane@example.com', password: 'password' };
    const user = { id: '1', name: 'Jane', email: request.email, createdAt: '2026-01-01T00:00:00Z' };
    service.create(request).subscribe((result) => expect(result).toEqual(user));
    const testRequest = http.expectOne({ method: 'POST', url: '/api/users' });
    expect(testRequest.request.body).toEqual(request);
    testRequest.flush(user);
  });
});
