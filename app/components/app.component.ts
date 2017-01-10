import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToasterService } from 'angular2-toaster';

import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';
import { UserNameModalComponent } from '../components/username-modal.component';

@Component({
  selector: 'app',
  templateUrl: 'views/app'
})
export class AppComponent implements OnInit {
  navbarCollapsed: boolean = true;
  userName: string = '';

  constructor(private user: UserService, private socket: SocketService, private modalService: NgbModal, private toaster: ToasterService) {
    this.userName = user.userName;
  }

  ngOnInit() {
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
