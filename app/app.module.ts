import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './components/app.component';
import { HomeComponent } from './components/home.component';
import { GameComponent} from './components/game.component';
import { CardModalComponent } from './components/card-modal.component';
import { CardTextPipe } from './pipes/cardText.pipe';
import { UserService } from './services/user.service';
import { SocketService } from './services/socket.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'game/:id', component: GameComponent }
    ]),
    NgbModule.forRoot()
  ],
  declarations: [ AppComponent, HomeComponent, GameComponent, CardModalComponent, CardTextPipe ],
  bootstrap:    [ AppComponent ],
  providers: [ UserService, SocketService ],
  entryComponents: [ CardModalComponent ]
})
export class AppModule {
  constructor(private socket: SocketService, private user: UserService) {
    socket.connect(user.userSid);
  }
}
