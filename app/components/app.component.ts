import { Component, Input } from '@angular/core';

import { UserService } from '../services/user.service';

@Component({
  selector: 'app',
  templateUrl: 'views/app'
})
export class AppComponent {
  navbarCollapsed: boolean = true;
  userName: string = '';

  constructor(private user: UserService) {
    this.userName = user.userName;
  }

  collapse() {
    this.navbarCollapsed = !this.navbarCollapsed;
  }
}
