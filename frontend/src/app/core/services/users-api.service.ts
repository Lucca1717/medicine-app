import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';
import { User, UserRequest } from '../models/medication-manager';

@Injectable({ providedIn: 'root' })
export class UsersApiService extends ApiBaseService<User, UserRequest> {
  constructor(http: HttpClient) {
    super(http, 'users');
  }
}
