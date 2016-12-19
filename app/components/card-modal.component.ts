import {Component, Input} from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import { PokerCard } from '../../DTO/pokerCard';

@Component({
  selector: 'card-modal-component',
  templateUrl: 'views/card-modal'
})
export class CardModalComponent {
  @Input() currentCard: PokerCard = PokerCard.NotPicked;

  constructor(public activeModal: NgbActiveModal) {}
}