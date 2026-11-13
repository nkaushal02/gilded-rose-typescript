import { AGED_BRIE, BACKSTAGE_PASS, CONJURED_PREFIX, MIN_QUALITY, SULFURAS } from './constants';
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

// Conjured items degrade twice as fast as normal items.
const updateConjuredItem: ItemRule = (item) => {
  decreaseQuality(item, 2);
  item.sellIn--;
  if (isExpired(item)) {
    decreaseQuality(item, 2);
  }
};

// Legendary item: never has to be sold and never loses quality.
const updateSulfuras: ItemRule = () => {};

const RULES: { [name: string]: ItemRule } = {
  [AGED_BRIE]: updateAgedBrie,
  [BACKSTAGE_PASS]: updateBackstagePass,
  [SULFURAS]: updateSulfuras,
};

function isConjured(item: Item): boolean {
  return item.name.indexOf(CONJURED_PREFIX) === 0;
}

export function ruleFor(item: Item): ItemRule {
  if (isConjured(item)) {
    return updateConjuredItem;
  }
  return RULES.hasOwnProperty(item.name) ? RULES[item.name] : updateNormalItem;
}
