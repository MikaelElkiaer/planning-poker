import { Component, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import * as Dto from '../../../shared/dto';

@Component({
  selector: 'card-modal-component',
  templateUrl: 'views/card-modal',
  styleUrls: ['app/style/game.css']
})
export class CardModalComponent {
  @Input() currentCard: Dto.PokerCard = Dto.PokerCard.NotPicked;

  pickableCards: Dto.PokerCard[] = [
    Dto.PokerCard.NotPicked,
    Dto.PokerCard.CoffeeBreak,
    Dto.PokerCard.QuestionMark,
    Dto.PokerCard.Zero,
    Dto.PokerCard.Half,
    Dto.PokerCard.One,
    Dto.PokerCard.Two,
    Dto.PokerCard.Three,
    Dto.PokerCard.Five,
    Dto.PokerCard.Eight,
    Dto.PokerCard.Thirteen,
    Dto.PokerCard.Forty,
    Dto.PokerCard.Hundred,
    Dto.PokerCard.Infinity
  ];

  constructor(public activeModal: NgbActiveModal) {}
}