import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }   from './app.component';
import { UserService } from './services/user.service';
import { SocketService } from './services/socket.service';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ],
  providers: [ UserService, SocketService ]
})
export class AppModule {
  constructor(private socket: SocketService, private user: UserService) {
    socket.connect(user.UserName || 'Ace');
  }
}
