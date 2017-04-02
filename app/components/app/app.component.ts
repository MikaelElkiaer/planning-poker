import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToasterConfig } from 'angular2-toaster';

import { SocketComponent } from '../shared/index';
import { SocketState, SocketService, UserService } from '../../services/index';
import { UserNameModalComponent } from '../index';
import { CLIENT_EVENTS as C, SERVER_EVENTS as S } from '../../../shared/events/index';

@Component({
  selector: 'app',
  templateUrl: 'views/app'
})
export class AppComponent extends SocketComponent {
  public navbarCollapsed: boolean = true;
  public userName: string = '???';
  public toasterConfig: ToasterConfig = 
    new ToasterConfig({ limit: 5, timeout: 5000, mouseoverTimerStop: true, preventDuplicates: true });

  constructor(
    private user: UserService,
    private modalService: NgbModal,
    socket: SocketService
    ) {
      super(socket);
    }

  toggleCollapse() {
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
        let name = await this.emit<string,string>(S.changeUserName, { data: userName });
        
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

  handleStateChange(state: SocketState) {
    if (state === SocketState.Connected) {
      this.userName = this.user.userName;

      if (!this.user.hasChangedName)
        this.userNameModal();
    }
  }
}
