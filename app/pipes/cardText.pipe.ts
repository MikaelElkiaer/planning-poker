import { Pipe, PipeTransform } from '@angular/core';

import { PokerCard } from '../../dto/pokerCard';

@Pipe({name: 'cardText'})
export class CardTextPipe implements PipeTransform {
  transform(value: PokerCard): string {
    switch (value) {
      case PokerCard.NotPicked:
        return '<span class="fa fa-thumbs-o-down"></span>';
      case PokerCard.Picked:
        return '<span class="fa fa-thumbs-o-up"></span>';
      case PokerCard.CoffeeBreak:
        return '<span class="fa fa-coffee"></span>';
      case PokerCard.QuestionMark:
        return '<span class="fa fa-question"></span>';
      case PokerCard.Half:
        return '&frac12;';
      case PokerCard.Infinity:
        return '&#x221e;';
      default:
        return value.toString();
    }
  }
}