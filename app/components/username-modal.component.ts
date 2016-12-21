import { Component, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'username-modal-component',
    templateUrl: 'views/username-modal'
})
export class UserNameModalComponent {
  @Input() userName: string;

  constructor(public activeModal: NgbActiveModal) {}
}