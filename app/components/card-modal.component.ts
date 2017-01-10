import {Component, Input} from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import { PokerCard } from '../../shared/dto/pokerCard';

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
  @Input() currentCard: PokerCard = PokerCard.NotPicked;

  pickableCards: PokerCard[] = [
    PokerCard.NotPicked,
    PokerCard.CoffeeBreak,
    PokerCard.QuestionMark,
    PokerCard.Zero,
    PokerCard.Half,
    PokerCard.One,
    PokerCard.Two,
    PokerCard.Three,
    PokerCard.Five,
    PokerCard.Eight,
    PokerCard.Thirteen,
    PokerCard.Forty,
    PokerCard.Hundred,
    PokerCard.Infinity
  ];

  constructor(public activeModal: NgbActiveModal) {}
}