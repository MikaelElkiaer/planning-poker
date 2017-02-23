import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToasterConfig } from 'angular2-toaster';

import { SocketState, SocketService, UserService } from '../services/index';
import { UserNameModalComponent } from './index';

@Component({
  selector: 'app',
  templateUrl: 'views/app'
})
export class AppComponent implements OnDestroy, OnInit {
  navbarCollapsed: boolean = true;
  userName: string = '???';
  toasterConfig: ToasterConfig = new ToasterConfig({
    limit: 5,
    timeout: 5000,
    mouseoverTimerStop: true,
    preventDuplicates: true
  });

  private socketState: SocketState = SocketState.Disconnected;
  private socketStateSubscription;

  constructor(
    private user: UserService,
    private socket: SocketService,
    private modalService: NgbModal
    ) { }

  ngOnInit() {
    if (this.socket.state === SocketState.Connected) {
      this.handleStateChange(this.socket.state);
    }

    this.socketStateSubscription = this.socket.socketStateEventEmitter.subscribe(state => this.handleStateChange(state));
  }

  ngOnDestroy() {
    this.socketStateSubscription.unsubscribe();
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

  private handleStateChange(state: SocketState) {
    if (state === SocketState.Connected) {
      this.userName = this.user.userName;

      if (!this.user.hasChangedName)
        this.userNameModal();
    }

    this.socketState = state;
  }
}
