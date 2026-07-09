export const STAT_ICON_KEYS = [
    'level',
    'heart',
    'cash',
    'coins',
    'prestige',
];

export const CONFIG_ICON_KEYS = [
    'autoserve',
    'beta',
    'leaderboard',
    'mix_all',
    'notifications',
    'premium',
    'seasonal',
    'timezone',
];

export const UPGRADE_ICON_KEYS = {
    speed: 'speed',
    storage: 'storage',
    resilience: 'resilience',
    appeal: 'appeal',
};

export const MEDAL_ICON_KEYS = [
    'gold',
    'silver',
    'bronze',
];

export const NUMBER_ICON_KEYS = Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0'));
export const ALL_ICON_KEYS = [
    ...STAT_ICON_KEYS,
    ...CONFIG_ICON_KEYS,
    ...Object.values(UPGRADE_ICON_KEYS),
    ...MEDAL_ICON_KEYS,
    ...NUMBER_ICON_KEYS,
];