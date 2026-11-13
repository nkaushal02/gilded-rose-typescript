import { Item } from './item';
import { ruleFor } from './item-rules';

// Re-exported so existing imports from '@/gilded-rose' keep working.
export { Item };

export class GildedRose {
  items: Array<Item>;

  constructor(items = [] as Array<Item>) {
    this.items = items;
  }

  updateQuality() {
    this.items.forEach((item) => ruleFor(item)(item));
    return this.items;
  }
}
