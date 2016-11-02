import { Injectable } from '@angular/core';

@Injectable()
class UserService {
  private readonly USER_SID_KEY = "UserSid";
  private readonly USER_PID_KEY = "UserPid";
  private readonly USER_USERNAME_KEY = "UserName";

  get UserSid() {
    return localStorage.getItem(this.USER_SID_KEY);
  }

  set UserSid(value) {
    localStorage.setItem(this.USER_SID_KEY, value);
  }

  get UserPid() {
    return localStorage.getItem(this.USER_PID_KEY);
  }

  set UserPid(value) {
    localStorage.setItem(this.USER_PID_KEY, value);
  }

  get UserName() {
    return localStorage.getItem(this.USER_USERNAME_KEY);
  }

  set UserName(value) {
    localStorage.setItem(this.USER_USERNAME_KEY, value);
  }
}

export { UserService };
