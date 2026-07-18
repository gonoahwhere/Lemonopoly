export const UPGRADE_LEVEL_CAP = 20;
export const UPGRADE_STATS = ['speed', 'storage', 'appeal', 'resilience'];
export const BASE_SELL_COOLDOWN_MS = 10_000;
export const SELL_COOLDOWN_FLOOR_MS = 3_000;
export const BASE_STORAGE_CAPACITY = 40;
export const TIP_RATE = 0.05;
export const PRESTIGE_STARTING_CASH = 500;
export const PRESTIGE_STARTING_LEVEL = 1;
export const PRESTIGE_INCOME_STEP = 0.15;
export const PRESTIGE_LEVEL_BASE = 50;
export const PRESTIGE_LEVEL_STEP = 15;
export const PRESTIGE_PRICE_STEP = 0.5;

export const UPGRADE_EFFECTS = {
    speed: { start: 20, cap: 70, capsAt: 15 },
    storage: { start: 30, cap: 430, capsAt: 50 },
    appealTip: { start: 3, cap: 60, capsAt: 20 },
    appealDouble: { start: 1, cap: 50, capsAt: 15 },
    resilience: { start: 9, cap: 99, capsAt: 20 },
};

export const UPGRADE_PRICING = {
    speed: { base: 175, growth: 1.40 },
    appeal: { base: 140, growth: 1.38 },
    storage: { base: 95, growth: 1.32 },
    resilience: { base: 120, growth: 1.30 },
};

function clampLevel(level) {
    return Math.max(0, Math.min(UPGRADE_LEVEL_CAP, level ?? 0));
}

function effectValue(effectKey, level, prestige = 0) {
    const e = UPGRADE_EFFECTS[effectKey];
    if (!e) return 0;
    const at20 = e.start + (e.cap - e.start) * Math.min(1, (prestige ?? 0) / e.capsAt);
    return at20 * (clampLevel(level) / UPGRADE_LEVEL_CAP);
}

export const speedReductionPct = (level, prestige) => effectValue('speed', level, prestige);
export const storageBonus = (level, prestige) => Math.round(effectValue('storage', level, prestige));
export const tipChancePct = (level, prestige) => effectValue('appealTip', level, prestige);
export const doubleChancePct = (level, prestige) => effectValue('appealDouble', level, prestige);
export const resilienceReductionPct = (level, prestige) => effectValue('resilience', level, prestige);

export function sellCooldownMs(level, prestige) {
    const ms = BASE_SELL_COOLDOWN_MS * (1 - speedReductionPct(level, prestige) / 100);
    return Math.max(SELL_COOLDOWN_FLOOR_MS, Math.round(ms));
}

export function storageCapacity(level, prestige) {
    return BASE_STORAGE_CAPACITY + storageBonus(level, prestige);
}

export function upgradeCost(stat, level, prestige = 0) {
    const cfg = UPGRADE_PRICING[stat];
    if (!cfg) return null;
    const priceMult = 1 + PRESTIGE_PRICE_STEP * (prestige ?? 0);
    return Math.round(cfg.base * cfg.growth ** clampLevel(level) * priceMult);
}

export function upgradeCostRange(stat, fromLevel, count, prestige = 0) {
    let total = 0;
    for (let i = 0; i < count; i++) {
        total += upgradeCost(stat, fromLevel + i, prestige);
    }
    return total;
}

const statLevel = (player, stat) => player?.upgrades?.[stat]?.level ?? 0;
const prestigeLevel = (player) => player?.prestige?.level ?? 0;

export const getSellCooldownMs = (player) => sellCooldownMs(statLevel(player, 'speed'), prestigeLevel(player));
export const getStorageCapacity = (player) => storageCapacity(statLevel(player, 'storage'), prestigeLevel(player));
export const getTipChance = (player) => tipChancePct(statLevel(player, 'appeal'), prestigeLevel(player)) / 100;
export const getDoubleChance = (player) => doubleChancePct(statLevel(player, 'appeal'), prestigeLevel(player)) / 100;
export const getDamageReduction = (player) => resilienceReductionPct(statLevel(player, 'resilience'), prestigeLevel(player)) / 100;

export function formatUpgradeEffect(stat, level, prestige = 0) {
    switch (stat) {
        case 'speed':
            return `${(sellCooldownMs(level, prestige) / 1000).toFixed(1)}s sell cooldown`;
        case 'storage':
            return `${storageCapacity(level, prestige)} storage capacity`;
        case 'appeal':
            return `${Math.round(tipChancePct(level, prestige))}% tip chance, ${Math.round(doubleChancePct(level, prestige))}% double`;
        case 'resilience':
            return `${Math.round(resilienceReductionPct(level, prestige))}% less event damage`;
        default:
            return '';
    }
}

// Prestige-related functions
export const prestigeIncomeMultiplier = (level) => 1 + PRESTIGE_INCOME_STEP * (level ?? 0);
export const getPrestigeLevelRequirement = (prestige) => PRESTIGE_LEVEL_BASE + PRESTIGE_LEVEL_STEP * (prestige ?? 0);
export function areUpgradesMaxed(player) {
    return UPGRADE_STATS.every((stat) => (player?.upgrades?.[stat]?.level ?? 0) >= UPGRADE_LEVEL_CAP);
}

export function isPrestigeReady(player) {
    const level = player?.stand?.level ?? 1;
    return areUpgradesMaxed(player) && level >= getPrestigeLevelRequirement(prestigeLevel(player));
}
