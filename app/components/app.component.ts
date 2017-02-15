import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToasterConfig } from 'angular2-toaster';

import { SocketService, UserService } from '../services/index';
import { UserNameModalComponent } from './index';

@Component({
  selector: 'app',
  templateUrl: 'views/app'
})
export class AppComponent implements OnInit {
  navbarCollapsed: boolean = true;
  userName: string = '';
  toasterConfig: ToasterConfig = new ToasterConfig({
    limit: 5,
    timeout: 5000,
    mouseoverTimerStop: true,
    preventDuplicates: true
  });

  constructor(
    private user: UserService,
    private socket: SocketService,
    private modalService: NgbModal
    ) { }

  async ngOnInit() {
    var userConnect = await this.socket.connect(this.user.userSid, this.user.userName);
    this.user.updateUser(userConnect.sid, userConnect.pid, userConnect.userName);
    this.userName = this.user.userName;
    console.log("Updated user");

    if (!this.user.hasChangedName)
      this.userNameModal();
  }

  collapse() {
    this.navbarCollapsed = !this.navbarCollapsed;
  }
  
  userNameModal() {
    const modalRef = this.modalService.open(UserNameModalComponent, { size: 'lg' });
    modalRef.componentInstance.userName = this.user.userName;

    modalRef.result.then((userName: string) => {
      if (userName === this.userName) {
        this.user.hasChangedName = '1';
        return;
      }
      this.socket.emit<string,string>('change-username', { data: userName }, response => {
        if (response.error) {
          this.toaster.pop('error', null, response.error);
          return;
        }

        this.user.userName = response.data;
        this.userName = response.data;
        this.user.hasChangedName = '1';
        console.info('Changed userName to: ', response.data);
      });
      return;
    }, () => {
      return;
    });
  }
}
