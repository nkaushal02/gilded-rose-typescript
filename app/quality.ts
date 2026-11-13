import { MAX_QUALITY, MIN_QUALITY } from './constants';
import { Item } from './item';

export function increaseQuality(item: Item, amount = 1): void {
  for (let i = 0; i < amount && item.quality < MAX_QUALITY; i++) {
    item.quality++;
  }
}

export function decreaseQuality(item: Item, amount = 1): void {
  for (let i = 0; i < amount && item.quality > MIN_QUALITY; i++) {
    item.quality--;
  }
}

export function isExpired(item: Item): boolean {
  return item.sellIn < 0;
}
