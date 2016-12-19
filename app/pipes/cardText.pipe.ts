import { Pipe, PipeTransform } from '@angular/core';

import { PokerCard } from '../../DTO/pokerCard';

@Pipe({name: 'cardText'})
export class CardTextPipe implements PipeTransform {
  transform(value: PokerCard): string {
    switch (value) {
      case PokerCard.NotPicked:
        return '<span class="fa fa-thumbs-o-down vcenter"></span>';
      case PokerCard.Picked:
        return '<span class="fa fa-thumbs-o-up vcenter"></span>';
      case PokerCard.CoffeeBreak:
        return '<span class="fa fa-coffee vcenter"></span>';
      case PokerCard.QuestionMark:
        return '<span class="fa fa-question vcenter></span>';
      case PokerCard.Half:
        return '&frac12;';
      default:
        return value.toString();
    }
  }
}