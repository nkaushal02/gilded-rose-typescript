import {
  AGED_BRIE,
  BACKSTAGE_DOUBLE_RATE_DAYS,
  BACKSTAGE_PASS,
  BACKSTAGE_TRIPLE_RATE_DAYS,
  CONJURED_PREFIX,
  MIN_QUALITY,
  SULFURAS,
} from './constants';
import { Item } from './item';
import { decreaseQuality, increaseQuality, isExpired } from './quality';

export type ItemRule = (item: Item) => void;

// Loses `rate` quality per day, and twice that once the sell-by date has passed.
const degradingRule = (rate: number): ItemRule => (item) => {
  decreaseQuality(item, rate);
  item.sellIn--;
  if (isExpired(item)) {
    decreaseQuality(item, rate);
  }
};

const updateNormalItem = degradingRule(1);

// Conjured items degrade twice as fast as normal items.
const updateConjuredItem = degradingRule(2);

const updateAgedBrie: ItemRule = (item) => {
  increaseQuality(item);
  item.sellIn--;
  if (isExpired(item)) {
    increaseQuality(item);
  }
};

const updateBackstagePass: ItemRule = (item) => {
  increaseQuality(item);
  if (item.sellIn <= BACKSTAGE_DOUBLE_RATE_DAYS) {
    increaseQuality(item);
  }
  if (item.sellIn <= BACKSTAGE_TRIPLE_RATE_DAYS) {
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

// Any item whose name starts with "Conjured" (e.g. "Conjured Mana Cake").
function isConjured(item: Item): boolean {
  return item.name.indexOf(CONJURED_PREFIX) === 0;
}

export function ruleFor(item: Item): ItemRule {
  if (isConjured(item)) {
    return updateConjuredItem;
  }
  return RULES.hasOwnProperty(item.name) ? RULES[item.name] : updateNormalItem;
}
