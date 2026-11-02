import { TestBed } from '@angular/core/testing';
import { CurrentUserService } from './current-user.service';

describe('CurrentUserService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [CurrentUserService] });
  });

  it('persists and restores the selected user id', () => {
    TestBed.inject(CurrentUserService).setSelectedUserId('user-1');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [CurrentUserService] });
    expect(TestBed.inject(CurrentUserService).selectedUserId()).toBe('user-1');
  });
});
