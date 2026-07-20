export const CONFIG_ICON_KEYS = [
    'autoserve',
    'beta',
    'leaderboard',
    'mix_all',
    'notifications',
    'seasonal',
    'timezone',
];

export const CURRENCY_ICON_KEYS = [
    'cash',
    'coins',

];

export const LEADERBOARD_ICON_KEYS = [
    'bronze',
    'silver',
    'gold',
]

export const MISC_ICON_KEYS = [
    'cooldown',
    'disabled',
    'enabled',
    'info',
    'left_arrow',
    'reply',
    'replyagain',
    'right_arrow',
    'warning',
];

export const NUMBER_ICON_KEYS = Array.from(
    { length: 10 }, 
    (_, i) => String(i + 1).padStart(2, '0')
);

export const PREMIUM_ICON_KEYS = [
    'free_staff',
    'gift_token',
    'ingredient_crate',
    'level_skip',
    'premium',
    'stand_repair',
    'storage_expand',
    'ticket',
    'token',
];

export const STAND_ICON_KEYS = [
    'heart',
    'level',
    'location',
    'prestige',
    'recipe',
];

export const UPGRADE_ICON_KEYS = [
    'appeal',
    'resilience',
    'speed',
    'storage',
];

export const WEATHER_ICON_KEYS = [
    'heatwave',
    'local_festival',
    'sudden_rain',
    'thunderstorm',
    'wind_storm'
];

export const GUIDE_ICON_KEYS = [
    'core',
    'utility',
    'mastery',
    'global_events',
    'weather_events',
    'achievements',
    'workers',
    'quests',
    'customers',
];

export const ALL_ICON_KEYS = [
    ...CONFIG_ICON_KEYS,
    ...CURRENCY_ICON_KEYS,
    ...LEADERBOARD_ICON_KEYS,
    ...MISC_ICON_KEYS,
    ...NUMBER_ICON_KEYS,
    ...PREMIUM_ICON_KEYS,
    ...STAND_ICON_KEYS,
    ...UPGRADE_ICON_KEYS,
    ...WEATHER_ICON_KEYS,
    ...GUIDE_ICON_KEYS,
];

export const ICON_CATEGORIES = {
    config: CONFIG_ICON_KEYS,
    currency: CURRENCY_ICON_KEYS,
    leaderboard: LEADERBOARD_ICON_KEYS,
    misc: MISC_ICON_KEYS,
    numbers: NUMBER_ICON_KEYS,
    premium: PREMIUM_ICON_KEYS,
    stand: STAND_ICON_KEYS,
    upgrades: UPGRADE_ICON_KEYS,
    weather: WEATHER_ICON_KEYS,
    guide: GUIDE_ICON_KEYS,
};

export const ICON_KEY_TO_CATEGORY = Object.fromEntries(Object.entries(ICON_CATEGORIES).flatMap(([category, keys]) => keys.map((key) => [key, category])));