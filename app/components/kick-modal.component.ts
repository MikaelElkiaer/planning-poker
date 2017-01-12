import { Component, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import * as Dto from '../../shared/dto/index';

@Component({
    selector: 'kick-modal-component',
    templateUrl: 'views/kick-modal'
})
export class KickModalComponent {
  @Input() player: Dto.PlayerPublic;

  constructor(public activeModal: NgbActiveModal) {}
}