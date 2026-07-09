export const STAT_ICON_KEYS = [
    'level',
    'heart',
    'cash',
    'coins'
];

export const CONFIG_ICON_KEYS = [
    'autoserve',
    'beta',
    'leaderboard',
    'mix_all',
    'notifications',
    'premium',
    'seasonal',
    'timezone'
];

export const UPGRADE_ICON_KEYS = {
    speed: 'speed',
    storage: 'storage',
    resilience: 'resilience',
    appeal: 'appeal',
};

export const ALL_ICON_KEYS = [
    ...STAT_ICON_KEYS,
    ...CONFIG_ICON_KEYS,
    ...Object.values(UPGRADE_ICON_KEYS),
];