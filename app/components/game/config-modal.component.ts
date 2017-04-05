import { Component, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import * as Dto from '../../../shared/dto';

@Component({
    selector: 'config-modal-component',
    templateUrl: 'views/config-modal'
})
export class ConfigModalComponent {
    @Input() config: Dto.GameConfig;
    @Input() isHost: boolean;

    constructor(public activeModal: NgbActiveModal) {}
}