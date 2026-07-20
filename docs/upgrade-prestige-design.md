# Upgrade & Prestige System

Rough design notes for how the four upgrade stats scale, how prestige makes them
stronger, and what everything costs. Numbers here aren't final, they're a
starting point we can tweak once we see it in play. The formulas and caps are the
part I actually care about pinning down.

## The four stats

All four cap at level 20. They all use the same idea: each stat has a ceiling
that depends on your prestige, and your level decides how much of that ceiling
you actually get.

```
effect = ceiling(prestige) * (level / 20)
```

So a level 10 stat gives you half of whatever the ceiling is at your prestige,
level 20 gives you all of it. You always have to grind 0 to 20 to get the full
value, which keeps upgrades worth buying no matter how high your prestige is.

Each stat's level 20 value is a straight line from a low start up to its cap,
reached at a set prestige:

```text
value@20(p) = start + (cap - start) * min(1, p / capsAt)
```

- `start` is what a fully upgraded (level 20) stat gives at prestige 0. This is
  the early-game throttle. Keeping it low means even a maxed-out new player earns
  barely above someone with no upgrades, so early game stays a slow grind and the
  real money only shows up once prestiges start stacking.
- `capsAt` is the prestige where the stat hits its cap and stops climbing. Pushing
  it further out spreads the growth over more prestiges, so each one gives a
  smaller bump and the payoff runs longer.

Here's the numbers for each stat (all at level 20):

| Stat       | Start (P0)        | Cap               | Caps at |
| ---------- | ----------------- | ----------------- | ------- |
| Speed      | 20% faster (8.0s) | 70% faster (3.0s) | P15     |
| Storage    | +30 (70 total)    | +430 (470 total)  | P50     |
| Tips       | 5% chance         | 100% chance       | P20     |
| Double     | 3% chance         | 100% chance       | P30     |
| Resilience | 9% damage cut     | 99% damage cut    | P20     |

`p` is prestige level. Base sell cooldown is 10s and speed pulls it down toward a
3s floor. Base storage is 40 for both ingredients and drinks. The appeal stats
(tips and double) start lowest on purpose, since they're the ones that multiply
income the hardest and we don't want early game running away. Double is stretched
all the way to P30 so guaranteed double sells stay a real long-term goal.

Speed is the only one with a real cap, and that's on purpose. If the cooldown
ever gets near zero, double-sell plus tips plus the income multiplier turn into
infinite money. The 3s floor keeps the loop from breaking. The others are
safe to let climb longer, since storage is just convenience and the
appeal/resilience stats are chance-based, so they top out on their own further
out (P20 through P50).

### What it looks like across prestiges

All stats at level 20:

| Prestige | Cooldown      | Capacity     | Tip           | Double        | Resilience   |
| -------- | ------------- | ------------ | ------------- | ------------- | ------------ |
| P0       | 8.0s          | 70           | 5%            | 3%            | 9%           |
| P5       | 6.3s          | 110          | 28.8%         | 19.2%         | 31.5%        |
| P10      | 4.7s          | 150          | 52.5%         | 35.3%         | 54%          |
| P15      | 3.0s (capped) | 190          | 76.3%         | 51.5%         | 76.5%        |
| P20      | 3.0s          | 230          | 100% (capped) | 67.7%         | 99% (capped) |
| P30      | 3.0s          | 310          | 100%          | 100% (capped) | 99%          |
| P50      | 3.0s          | 470 (capped) | 100%          | 100%          | 99%          |

Early on this is deliberately weak. A brand new player who grinds every upgrade to
level 20 still only earns around 1.3x what someone with no upgrades earns, because
the cooldown is barely down and tips and double almost never fire. By P10 that same
maxed loadout is only about 3.5x the no-upgrade baseline (before the income
multiplier), and it keeps climbing for a long time after, since double doesn't cap
until P30 and storage not until P50. The payoff really is in stacking prestiges.

Speed locks at P15, but there's still a ton of growth left after that. Tips and
resilience finish at P20, double keeps climbing to P30, and storage all the way to
P50, so prestige keeps mattering long after speed is done.

A few notes on the individual stats:

- Tips pay an extra 40% of the sale value. At 100% chance every sale tips.
- Double sells two cups on one cooldown. At 100% every sale is a double. I
  stretched it all the way out to P30 so guaranteed doubles stay a long-term chase.
- Resilience cuts event damage to your stand health and repair costs. It stops at
  99% instead of 100% so you always take a little damage, which keeps repairs and
  the stat relevant forever.

### Quick example

A player at prestige 3 with everything at level 20:

- Speed: `20 + (70-20)*(3/15)` = 30% faster, so a 7.0s cooldown
- Storage: `30 + (430-30)*(3/50)` = +54, so 94 capacity
- Tip: `5 + (100-5)*(3/20)` = 19.25%
- Double: `3 + (100-3)*(3/30)` = 12.7%
- Resilience: `9 + (99-9)*(3/20)` = 22.5%

## Prestige

### What resets

When you prestige, all four upgrades go back to level 0, your stand level resets
to 1, and your cash is set to $500. Your ingredients and drinks are kept, not
wiped — but resetting the storage upgrade drops your capacity back to base, so
anything over that gets trimmed down to fit. You keep your unlocked recipes,
mastery stars, coins, and your prestige level and perks.

Resetting stand level is what makes the level leaderboard its own race, separate
from prestige — a low-prestige player who's climbed high can still outrank someone
who just prestiged and dropped to level 1. Already-unlocked recipes stay unlocked,
so the reset doesn't lock any content away.

### When you can prestige

You need all four upgrades at level 20 and your stand at a climbing level gate:

```text
requires: all four upgrades at level 20
          stand level >= 50 + 15 * p
```

The upgrade requirement is the main engine — since upgrades reset, you rebuild
them to 20 every time. The level gate climbs by 15 each prestige (50, 65, 80,
...) so it stays a real target, and it keeps the level leaderboard meaningful:
a low-prestige, high-level player can still outrank a high-prestige one.

### Income multiplier

```
income = 1 + 0.15 * p
```

I kept this pretty tame. The upgrade effects already multiply hard at high
prestige (double times tip times speed), so the income bonus just needs to smooth
out the early rebuild, not pile another steep curve on top.

`/prestige` stores this on the profile, but `/sell` doesn't apply it yet — wiring
that in is a one-line follow-up whenever we want it live.

| Prestige | Income |
| -------- | ------ |
| P0       | 1.00x  |
| P5       | 1.75x  |
| P10      | 2.50x  |
| P20      | 4.00x  |
| P30      | 5.50x  |

## Pricing

Since a level 20 stat is stronger at higher prestige, it should cost more to
rebuild there. So the price is the normal per-level curve times a prestige
multiplier:

```
cost = base * growth^level * (1 + 0.5 * p)
```

The `base * growth^level` part is the per-level curve within a single stat. Level
0 to 1 costs `base`, and each level after that multiplies by `growth`. The
`(1 + 0.5*p)` scales the whole thing up as you prestige.

Per-stat numbers at prestige 0:

| Stat       | Base (first level) | Growth | Total 0 to 20 |
| ---------- | ------------------ | ------ | ------------- |
| Speed      | 175                | 1.40   | ~365,600      |
| Appeal     | 140                | 1.38   | ~230,800      |
| Storage    | 95                 | 1.32   | ~76,300       |
| Resilience | 120                | 1.30   | ~75,600       |
|            |                    | Total  | ~748,300      |

Speed and appeal cost the most since they're the two that directly multiply your
income. Storage and resilience are cheaper quality-of-life buys.

What the per-level prices actually look like at prestige 0:

| Level | Speed   | Appeal | Storage | Resilience |
| ----- | ------- | ------ | ------- | ---------- |
| 1     | 175     | 140    | 95      | 120        |
| 5     | 672     | 508    | 288     | 343        |
| 10    | 3,616   | 2,541  | 1,156   | 1,273      |
| 15    | 19,446  | 12,719 | 4,632   | 4,725      |
| 20    | 104,580 | 63,655 | 18,566  | 17,537     |

And the total to max all four, at each prestige:

| Prestige | Multiplier | Total for all four |
| -------- | ---------- | ------------------ |
| P0       | 1.0x       | ~748K              |
| P1       | 1.5x       | ~1.12M             |
| P2       | 2.0x       | ~1.50M             |
| P5       | 3.5x       | ~2.62M             |
| P10      | 6.0x       | ~4.49M             |
| P15      | 8.5x       | ~6.36M             |
| P20      | 11.0x      | ~8.23M             |
| P30      | 16.0x      | ~11.97M            |