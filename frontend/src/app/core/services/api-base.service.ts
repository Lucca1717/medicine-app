import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export abstract class ApiBaseService<TResponse, TRequest> {
  protected constructor(
    protected readonly http: HttpClient,
    private readonly resource: string,
  ) {}

  list(params?: Record<string, string | undefined>): Observable<TResponse[]> {
    let httpParams = new HttpParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value) {
        httpParams = httpParams.set(key, value);
      }
    });
    return this.http.get<TResponse[]>(`${environment.apiUrl}/${this.resource}`, { params: httpParams });
  }

  get(id: string): Observable<TResponse> {
    return this.http.get<TResponse>(`${environment.apiUrl}/${this.resource}/${id}`);
  }

  create(payload: TRequest): Observable<TResponse> {
    return this.http.post<TResponse>(`${environment.apiUrl}/${this.resource}`, payload);
  }

  update(id: string, payload: TRequest): Observable<TResponse> {
    return this.http.put<TResponse>(`${environment.apiUrl}/${this.resource}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/${this.resource}/${id}`);
  }
}
