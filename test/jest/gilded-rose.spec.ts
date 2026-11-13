import { Item, GildedRose } from '@/gilded-rose';

const BRIE = 'Aged Brie';
const SULFURAS = 'Sulfuras, Hand of Ragnaros';
const PASS = 'Backstage passes to a TAFKAL80ETC concert';

function update(name: string, sellIn: number, quality: number): Item {
  const [item] = new GildedRose([new Item(name, sellIn, quality)]).updateQuality();
  return item;
}

describe('Gilded Rose', () => {
  describe('normal items', () => {
    it('lowers sellIn and quality by 1 each day', () => {
      const item = update('+5 Dexterity Vest', 10, 20);
      expect(item.sellIn).toBe(9);
      expect(item.quality).toBe(19);
    });

    it('degrades quality twice as fast once the sell date has passed', () => {
      const item = update('+5 Dexterity Vest', 0, 20);
      expect(item.sellIn).toBe(-1);
      expect(item.quality).toBe(18);
    });

    it('keeps degrading twice as fast on later days past the sell date', () => {
      const item = update('+5 Dexterity Vest', -5, 20);
      expect(item.quality).toBe(18);
    });

    it('never lets quality go negative', () => {
      expect(update('+5 Dexterity Vest', 10, 0).quality).toBe(0);
    });

    it('never lets quality go negative when expired', () => {
      expect(update('+5 Dexterity Vest', 0, 1).quality).toBe(0);
      expect(update('+5 Dexterity Vest', -1, 0).quality).toBe(0);
    });
  });

  describe('Aged Brie', () => {
    it('increases in quality by 1 as it gets older', () => {
      const item = update(BRIE, 10, 20);
      expect(item.sellIn).toBe(9);
      expect(item.quality).toBe(21);
    });

    it('increases in quality by 2 once the sell date has passed', () => {
      expect(update(BRIE, 0, 20).quality).toBe(22);
    });

    it('never exceeds quality 50', () => {
      expect(update(BRIE, 10, 50).quality).toBe(50);
      expect(update(BRIE, 10, 49).quality).toBe(50);
    });

    it('never exceeds quality 50 when expired', () => {
      expect(update(BRIE, 0, 49).quality).toBe(50);
      expect(update(BRIE, -1, 50).quality).toBe(50);
    });
  });

  describe('Sulfuras', () => {
    it('never changes sellIn or quality', () => {
      const item = update(SULFURAS, 0, 80);
      expect(item.sellIn).toBe(0);
      expect(item.quality).toBe(80);
    });

    it('never changes with a negative sellIn', () => {
      const item = update(SULFURAS, -1, 80);
      expect(item.sellIn).toBe(-1);
      expect(item.quality).toBe(80);
    });
  });

  describe('Backstage passes', () => {
    it('increases quality by 1 when there are more than 10 days left', () => {
      expect(update(PASS, 11, 20).quality).toBe(21);
    });

    it('increases quality by 2 when there are 10 days or less', () => {
      expect(update(PASS, 10, 20).quality).toBe(22);
      expect(update(PASS, 6, 20).quality).toBe(22);
    });

    it('increases quality by 3 when there are 5 days or less', () => {
      expect(update(PASS, 5, 20).quality).toBe(23);
      expect(update(PASS, 1, 20).quality).toBe(23);
    });

    it('drops quality to 0 after the concert', () => {
      const item = update(PASS, 0, 20);
      expect(item.sellIn).toBe(-1);
      expect(item.quality).toBe(0);
    });

    it('never exceeds quality 50', () => {
      expect(update(PASS, 11, 50).quality).toBe(50);
      expect(update(PASS, 10, 49).quality).toBe(50);
      expect(update(PASS, 5, 48).quality).toBe(50);
      expect(update(PASS, 5, 50).quality).toBe(50);
    });
  });

  describe('multiple items', () => {
    it('updates every item in the inventory independently', () => {
      const items = new GildedRose([
        new Item('+5 Dexterity Vest', 10, 20),
        new Item(BRIE, 2, 0),
        new Item(SULFURAS, 0, 80),
      ]).updateQuality();

      expect(items.map((i) => [i.sellIn, i.quality])).toEqual([
        [9, 19],
        [1, 1],
        [0, 80],
      ]);
    });
  });
});
