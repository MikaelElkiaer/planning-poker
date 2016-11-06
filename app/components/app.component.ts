import { Component, Input } from '@angular/core';
@Component({
  selector: 'app',
  templateUrl: 'views/app'
})
export class AppComponent {
  navbarCollapsed: boolean = true;

  collapse() {
    this.navbarCollapsed = !this.navbarCollapsed;
  }
}
