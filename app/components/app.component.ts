import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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

  constructor(private user: UserService, private socket: SocketService, private modalService: NgbModal) {
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

    modalRef.result.then(userName => {
      this.socket.emit('change-username', userName, (error, newUserName) => {
        if (error) {
          console.info(error);
          return;
        }

        this.user.userName = newUserName;
        this.userName = newUserName;
        this.user.hasChangedName = '1';
        console.info('Changed userName to: ', newUserName);
      });
      return;
    }, () => {
      return;
    });
  }
}
