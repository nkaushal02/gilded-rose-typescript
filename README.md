# Gilded Rose (TypeScript)

The Gilded Rose kata in TypeScript. The inventory update logic has been refactored into small,
per-item rules and extended to support **Conjured** items.

## Requirements (from the kata specification)

Source: [Gilded Rose Requirements](https://github.com/emilybache/GildedRose-Refactoring-Kata/blob/main/GildedRoseRequirements.md)

The inventory system works as follows:

- All items have a `SellIn` value, the number of days we have to sell the item.
- All items have a `Quality` value, which denotes how valuable the item is.
- At the end of each day the system lowers both values for every item.

With these rules:

- Once the sell by date has passed, `Quality` degrades twice as fast.
- The `Quality` of an item is never negative.
- **"Aged Brie"** actually increases in `Quality` the older it gets.
- The `Quality` of an item is never more than `50`.
- **"Sulfuras"**, being a legendary item, never has to be sold or decreases in `Quality`. Its
  `Quality` is `80` and it never alters.
- **"Backstage passes"**, like Aged Brie, increase in `Quality` as their `SellIn` value approaches:
  - `Quality` increases by `2` when there are `10` days or less, and by `3` when there are `5` days or less,
  - but `Quality` drops to `0` after the concert.

New feature, implemented in this project:

- **"Conjured"** items degrade in `Quality` twice as fast as normal items.

Constraint: the `Item` class and the `items` property must not be altered.

## Prerequisites

- Node.js 18 or newer (developed on Node 22)
- npm

## Setup

```sh
npm install
```

## Run the tests

Tests use [Jest](https://jestjs.io/).

```sh
npm test                   # run once, with a coverage report
npm run test:jest:watch    # re-run on file changes
```

## Compile

```sh
npm run compile                # compile to ./dist
npx tsc --noEmit               # type-check only, no output files
```

`npm run compile` cleans and rewrites `dist/`, which is git-ignored.

## Run the program

The text fixture prints the inventory day by day. The argument is the number of days (default 2).

```sh
npx ts-node test/golden-master-text-test.ts        # 2 days
npx ts-node test/golden-master-text-test.ts 10     # 10 days
```

Each line is `name, sellIn, quality`.

## Project structure

```
app/
├── item.ts          Item class (unchanged from the starter, only moved to its own file)
├── constants.ts     item names, quality limits, backstage thresholds
├── quality.ts       helpers: increaseQuality, decreaseQuality, isExpired
├── item-rules.ts    one rule per item type, plus the lookup (ruleFor)
└── gilded-rose.ts   GildedRose class (re-exports Item for existing imports)
test/
├── jest/            unit tests and the approval (golden master) test
└── golden-master-text-test.ts   text fixture used by the approval test
```

## Design decisions

- **Rule per item type.** The original nested `if` block is replaced by small functions, one for
  each kind of item (normal, Aged Brie, Backstage passes, Sulfuras, Conjured). `ruleFor(item)`
  picks the right one and `GildedRose.updateQuality()` just applies it to every item.
- **Adding a new item type** means writing one rule and adding it to the lookup in `item-rules.ts`.
- **Conjured items** are matched by name prefix (`"Conjured …"`). They lose 2 quality per day, or
  4 once the sell-by date has passed, and never go below 0.
- **`Item` is untouched.** The class body is identical to the starter, as the kata requires. It was
  only moved to its own file, and `gilded-rose.ts` re-exports it so `import { Item } from '@/gilded-rose'`
  still works.
- **Behaviour preserved.** The refactor was done against characterization tests and a 30-day golden
  master snapshot written before any production code changed. The only snapshot change is the
  Conjured Mana Cake rows, which now follow the new requirement.
- **Quality bounds.** `increaseQuality` and `decreaseQuality` move one step at a time and stop at
  the limits (0 and 50), which keeps the original behaviour for inputs outside that range.
  Sulfuras is never modified, so it keeps its quality of 80.

## How I approached this

**1. Understood the requirements first.** I read the specification and listed every rule: the
daily decrease, the double degradation after the sell-by date, the 0 and 50 bounds, and the three
special items (Aged Brie, Sulfuras, Backstage passes). I also noted the constraint that the `Item`
class and the `items` property must not change. The legacy `updateQuality` is one deeply nested
block, so I decided adding Conjured on top of it would be risky and hard to review.

**2. Planned the work as small, reviewable commits.** The order was deliberate: protect the existing
behaviour, then restructure, then add the feature, then document.

| # | Commit | Why |
|---|---|---|
| 1 | Add Gilded Rose kata starter code | Baseline to compare against |
| 2 | Replace placeholder spec with characterization tests | Pin down what the legacy code does before touching it |
| 3 | Refactor into item-specific quality update rules | Simplify the logic with tests proving nothing changed |
| 4 | Add Conjured support, with tests | The new feature, built on the cleaner structure |
| 5 | Documentation | Setup, run instructions, requirements and decisions |
| 6 | Final cleanup | Remove unused starter files, tidy the rules and constants, verify on a fresh install |

**3. Wrote tests before changing any logic.** I wrote tests for every rule (normal items, Aged Brie,
Sulfuras, Backstage passes, expiry, and the 0 and 50 bounds) and kept the starter's 30-day golden
master snapshot as a second safety net. Both passed against the untouched legacy code.

**4. Refactored, then extended.** I replaced the nested `if` block with one small rule per item
type and a lookup that chooses the rule. I decided the structure myself:
- `Item` goes in its own file, byte-for-byte unchanged, and is re-exported so existing imports work.
- Constants and quality helpers get their own small files.
- I first split the rules into a folder with one file each, then merged them into a single
  `item-rules.ts`. They are 3 to 10 lines each, so five files added more overhead than clarity. I
  also renamed the file from `updaters` to `item-rules` to say what it holds.

**5. Added Conjured as one new rule.** With the new structure it is one rule plus one lookup
check. I wrote its tests, including the case after expiry and the floor at 0. The golden master
snapshot changed for the Conjured Mana Cake rows only, which I reviewed line by line before
accepting. The starter's own comment on that item says it "does not work properly yet".

**6. Cleaned up and verified.** I removed the unused starter scaffolding (the Mocha and Vitest example
specs and configs, the TextTest script and their dependencies), because only Jest is used and those
specs still held the starter's failing `'fixme'` placeholder. I also made two small readability
changes: a single `degradingRule(rate)` shared by normal and Conjured items instead of two copies,
and named constants for the Backstage 10-day and 5-day thresholds. I then ran a fresh
`npm install`, type-check, the tests and the text fixture in a clean copy. 24 tests and 2 snapshots
pass, with 100% coverage of the production code.

### Use of AI

I used an AI coding agent (Claude Code) as a pair-programming tool for typing out code and checking my work. The approach was mine: I decided the commit order, the test-first strategy, the new file structure (including splitting and then merging the rules file, and the naming) and the design of the Conjured rule. I reviewed every change before committing it.
