import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './components/app.component';
import { HomeComponent } from './components/home.component';
import { GameComponent} from './components/game.component';
import { UserService } from './services/user.service';
import { SocketService } from './services/socket.service';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'game', component: GameComponent }
    ])
  ],
  declarations: [ AppComponent, HomeComponent, GameComponent ],
  bootstrap:    [ AppComponent ],
  providers: [ UserService, SocketService ]
})
export class AppModule {
  constructor(private socket: SocketService, private user: UserService) {
    socket.connect(user.UserSid);
  }
}
