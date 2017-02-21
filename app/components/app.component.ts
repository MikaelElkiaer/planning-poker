import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToasterConfig } from 'angular2-toaster';

import { SocketState, SocketService, UserService } from '../services/index';
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

  private socketState: SocketState = SocketState.Uninitialized;
  private socketStateSubscription;

  constructor(
    private user: UserService,
    private socket: SocketService,
    private modalService: NgbModal
    ) { }

  async ngOnInit() {
    this.socketStateSubscription = await this.socket.socketStateEventEmitter.subscribe(async (state: SocketState) => {
      this.socketState = state;

      if (this.socketState === SocketState.Connected) {
        this.userName = this.user.userName;

        if (!this.user.hasChangedName)
          await this.userNameModal();
      }
    });
  }

  collapse() {
    this.navbarCollapsed = !this.navbarCollapsed;
  }
  
  async userNameModal() {
    const modalRef = this.modalService.open(UserNameModalComponent, { size: 'lg' });
    modalRef.componentInstance.userName = this.user.userName;

    modalRef.result.then(async (userName: string) => {
      if (userName === this.userName) {
        this.user.hasChangedName = '1';
        return;
      }
      try {
        let name = await this.socket.emit<string,string>('change-username', { data: userName });
        
        this.user.userName = name;
        this.userName = name;
        this.user.hasChangedName = '1';
        console.info('Changed userName to: ', name);
      }
      catch (error) { }
      return;
    }, () => {
      return;
    });
  }
}
