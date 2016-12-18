import { Pipe, PipeTransform } from '@angular/core';

import { PokerCard } from '../../DTO/pokerCard';

@Pipe({name: 'cardText'})
export class CardTextPipe implements PipeTransform {
  transform(value: PokerCard): string {
    switch (value) {
      case PokerCard.NotPicked:
        return 'n';
      case PokerCard.Picked:
        return 'y';
      case PokerCard.CoffeeBreak:
        return 'c';
      case PokerCard.QuestionMark:
        return '?';
      case PokerCard.Half:
        return '.5';
      default:
        return value.toString();
    }
  }
}