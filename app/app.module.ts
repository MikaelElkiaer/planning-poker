import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToasterModule } from 'angular2-toaster';

import { AppComponent, HomeComponent, GameComponent } from './components/index';
import { CardModalComponent, ConfigModalComponent, KickModalComponent, UserNameModalComponent } from './components/index';
import { CardTextPipe } from './pipes/cardText.pipe';
import { UserService, SocketService } from './services/index';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'game/:id', component: GameComponent }
    ]),
    NgbModule.forRoot(),
    ToasterModule
  ],
  declarations: [ AppComponent, HomeComponent, GameComponent, CardModalComponent, ConfigModalComponent, UserNameModalComponent, CardTextPipe, KickModalComponent ],
  bootstrap:    [ AppComponent ],
  providers: [ UserService, SocketService ],
  entryComponents: [ CardModalComponent, ConfigModalComponent, UserNameModalComponent, KickModalComponent ]
})
export class AppModule { }
