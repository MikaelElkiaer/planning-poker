import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';

@Component({
  templateUrl: 'views/game'
})
export class GameComponent implements OnInit {
  private gameId: string;

  constructor(private route: ActivatedRoute) {
    
  }

  ngOnInit() {
    this.gameId = this.route.snapshot.params['id'];
  }

  get GameId() { return this.gameId; }
}