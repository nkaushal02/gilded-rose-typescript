import { AGED_BRIE, BACKSTAGE_PASS, MIN_QUALITY, SULFURAS } from './constants';
import { Item } from './item';
import { decreaseQuality, increaseQuality, isExpired } from './quality';

export type ItemRule = (item: Item) => void;

const updateNormalItem: ItemRule = (item) => {
  decreaseQuality(item);
  item.sellIn--;
  if (isExpired(item)) {
    decreaseQuality(item);
  }
};

const updateAgedBrie: ItemRule = (item) => {
  increaseQuality(item);
  item.sellIn--;
  if (isExpired(item)) {
    increaseQuality(item);
  }
};

const updateBackstagePass: ItemRule = (item) => {
  increaseQuality(item);
  if (item.sellIn < 11) {
    increaseQuality(item);
  }
  if (item.sellIn < 6) {
    increaseQuality(item);
  }
  item.sellIn--;
  if (isExpired(item)) {
    item.quality = MIN_QUALITY;
  }
};

// Legendary item: never has to be sold and never loses quality.
const updateSulfuras: ItemRule = () => {};

const RULES: { [name: string]: ItemRule } = {
  [AGED_BRIE]: updateAgedBrie,
  [BACKSTAGE_PASS]: updateBackstagePass,
  [SULFURAS]: updateSulfuras,
};

export function ruleFor(item: Item): ItemRule {
  return RULES.hasOwnProperty(item.name) ? RULES[item.name] : updateNormalItem;
}
