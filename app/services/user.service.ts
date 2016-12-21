import { Injectable } from '@angular/core';

@Injectable()
export class UserService {
  get userSid() { return localStorage.getItem(this.USER_SID_KEY); }
  set userSid(value) { localStorage.setItem(this.USER_SID_KEY, value); }
  get userPid() { return localStorage.getItem(this.USER_PID_KEY); }
  set userPid(value) { localStorage.setItem(this.USER_PID_KEY, value); }
  get userName() { return localStorage.getItem(this.USER_USERNAME_KEY); }
  set userName(value) { localStorage.setItem(this.USER_USERNAME_KEY, value); }
  get hasChangedName() { return localStorage.getItem(this.USER_HAS_CHANGED_NAME_KEY); }
  set hasChangedName(value) { localStorage.setItem(this.USER_HAS_CHANGED_NAME_KEY, value); }
  
  private readonly USER_SID_KEY = "UserSid";
  private readonly USER_PID_KEY = "UserPid";
  private readonly USER_USERNAME_KEY = "UserName";
  private readonly USER_HAS_CHANGED_NAME_KEY = "HasChangedName";
}