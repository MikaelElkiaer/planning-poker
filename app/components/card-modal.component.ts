import { Component, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import * as Dto from '../../shared/dto';

@Component({
  selector: 'card-modal-component',
  templateUrl: 'views/card-modal',
  styles: [`.vote {
              display: inline-block;
              margin: 10px;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
            }

            .pickable:hover {
              background-color: #f5f5f5;
              cursor:  pointer;
            }

            div.poker-card {
              box-shadow: 2px 2px 4px #bbbbbb;
              margin: auto;
              padding-top: 50%;
              width: 70px;
              height: 100px;
              font-size: 28px;
              text-align: center;
              border: 2px solid black;
              border-radius: 5px;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }

            .selected div.poker-card {
              border-color: #357ebd;
              color: #357ebd;
              font-weight: bold;
            }`]
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