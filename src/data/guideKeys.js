export const COMMAND_CATEGORIES = [
    {
        name: 'CORE',
        title: 'Core',
        description: 'Essential gameplay mechanics',
        accent: '#5C6BC0',
        iconKey: 'core',
        commands: [
            {
                name: 'drink-stock',
                usage: '/drink-stock',
                description: 'view your current stock of lemonade you\'ve mixed.'
            },
            {
                name: 'getting-started',
                usage: '/getting-started',
                description: 'view this detailed user manual for how lemonopoly works.'
            },
            {
                name: 'ingredient-stock',
                usage: '/ingredient-stock',
                description: 'view your current stock of the ingredients you\'ve purchased.'
            },
            {
                name: 'market purchase ingredient',
                usage: '/market purchase ingredient <ingredient>',
                description: 'purchase ingredients so that you can make more drinks.'
            },
            {
                name: 'market purchase recipe',
                usage: '/market purchase recipe <recipe>',
                description: 'purchase recipes to unlock new drinks to make and sell.'
            },
            {
                name: 'prestige',
                usage: '/prestige',
                description: 'prestige and start over, while unlocking permanent bonuses.'
            },
            {
                name: 'sell',
                usage: '/sell',
                description: 'sell drinks to customers every 10s, upgrades and premium passes lower the cooldown.'
            },
            {
                name: 'stand view',
                usage: '/stand view',
                description: 'view how your lemonade stand is doing.'
            },
            {
                name: 'start',
                usage: '/start',
                description: 'start your own lemonade stand adventure, command is single use only.'
            },
            {
                name: 'upgrade buy',
                usage: '/upgrade buy <stat> [amount]',
                description: 'purchase upgrades to increase your stands potential, caps increase as you progress.'
            },
            {
                name: 'weather-events',
                usage: '/weather-events',
                description: 'view the possible outcomes that each of the weather events could give you.'
            },
        ],
    },
    {
        name: 'UTILITY',
        title: 'Utility',
        description: 'Helpful tools and information',
        accent: '#5B5B5B',
        iconKey: 'utility',
        commands: [
            {
                name: 'config view',
                usage: '/config view',
                description: 'view the configuration that you have setup.'
            },
            {
                name: 'creators',
                usage: '/creators',
                description: 'view the development team behind my creation.'
            },
            {
                name: 'ingredient-book',
                usage: '/ingredient-book',
                description: 'view the full list of ingredients and their prices, discounts do not show here.'
            },
            {
                name: 'leaderboard all cash',
                usage: '/leaderboard all cash',
                description: 'view the top 10 stands based on earned cash.'
            },
            {
                name: 'leaderboard all level',
                usage: '/leaderboard all level',
                description: 'view the top 10 stands based on stand levels.'
            },
            {
                name: 'leaderboard all prestige',
                usage: '/leaderboard all prestige',
                description: 'view the top 10 stands based on prestige counts.'
            },
            {
                name: 'market view',
                usage: '/market view <type>',
                description: 'browse the market for new recipes you\'ve unlocked, or new ingredients.'
            },
            {
                name: 'my-recipes view',
                usage: '/my-recipes view',
                description: 'view your purchased recipes and their current mastery statistics.'
            },
            {
                name: 'premium-perks',
                usage: '/premium-perks',
                description: 'view the perks/rewards you could unlock by owning the premium pass.'
            },
            {
                name: 'recipe-book',
                usage: '/recipe-book',
                description: 'view the full list of recipes, ingredients they need and how to unlock them.'
            },
            {
                name: 'stand rename',
                usage: '/stand rename <name>',
                description: 'give your stand a brand new name, visible via viewing the stand.'
            },
            {
                name: 'upgrade view',
                usage: '/upgrade view',
                description: 'view the different types of upgrades, your current progress and the cost for the next upgrade.'
            },
        ],
    },
    {
        name: 'PREMIUM',
        title: 'Premium',
        description: 'Premium-Pass exclusive mechanics',
        accent: '#9B4FD1',
        iconKey: 'premium',
        commands: [
            {
                name: 'config edit active_recipe',
                usage: '/config edit active_recipe <recipe>',
                description: 'change which one of your owned recipes is set as your active recipe.'
            },
            {
                name: 'config edit card_border',
                usage: '/config edit card_border <colour1> [colour2] [colour3]',
                description: 'give the borders throughout the bot a custom colour, supports 1-3 colours.'
            },
            {
                name: 'config edit name_gradient',
                usage: '/config edit name_gradient <colour1> <colour2>',
                description: 'give the headings for each render throughout the bot a 2-colour gradient.'
            },
            {
                name: 'config reset all_customization',
                usage: '/config reset all_customization',
                description: 'resets all custom settings back to their default values, except active recipes.'
            },
            {
                name: 'config reset card_border',
                usage: '/config reset card_border',
                description: 'reset the card borders back to their default colour.'
            },
            {
                name: 'config reset name_gradient',
                usage: '/config reset name_gradient',
                description: 'reset the heading names back to their default colours.'
            },
            {
                name: 'lemon-illuminati claim',
                usage: '/lemon-illuminati claim',
                description: 'claim the monthly bonus rewards for owning the premium pass.'
            },
            {
                name: 'lemon-illuminati view',
                usage: '/lemon-illuminati view',
                description: 'view the rewards you get each month for owning the premium pass.'
            },
            {
                name: 'leaderboard premium cash',
                usage: '/leaderboard premium cash',
                description: 'view the top 10 premium-pass owned stands based on earned cash. '
            },
            {
                name: 'leaderboard premium level',
                usage: '/leaderboard premium level',
                description: 'view the top 10 premium-pass owned stands based on stand levels.'
            },
            {
                name: 'leaderboard premium prestige',
                usage: '/leaderboard premium prestige',
                description: 'view the top 10 premium-pass owned stands based on prestige counts.'
            },
            {
                name: 'the-vault redeem',
                usage: '/the-vault redeem',
                description: 'redeem one of your monthly reward items for additional perks.'
            },
            {
                name: 'the-vault view',
                usage: '/the-vault view',
                description: 'view an inventory of the items you earn from your monthly bonus claim each month.'
            },
        ],
    },
];

export const FEATURES = [
    {
        title: 'Serving Customers',
        iconKey: 'customers',
        accent: '#F46FFF',
        description: 'serve customers with the drinks you\'ve mixed.',
        content: {
            type: 'bullets',
            items: [
                'regular customers appear every 10s as the default cooldown',
                'ensure you have enough ingredients for your active recipe',
                'use the mix command to mix the ingredients for this recipe',
                'use the sell command to sell a drink to a customer',
                'the customer will give cash per drink they order',
                'upgrading appeal and speed will improve your selling',
                'selling drinks will increase your mastery for your active recipe',
            ],
        },
        tip: 'mastering drinks increases their sell price and provides an ingredient discount.'
    },
    {
        title: 'Mastering Recipes',
        iconKey: 'mastery',
        accent: '#00897B',
        description: 'master recipes to accumulate an ingredient discount.',
        content: {
            type: 'bullets',
            items: [
                'example of first point',
                'example of second point',
            ],
        },
        tip: ''
    },
    {
        title: 'Premium Benefits',
        iconKey: 'premium',
        accent: '#9B4FD1',
        description: 'premium members earn a monthly bundle of bonus items, banked in the vault until redeemed.',
        content: {
            type: 'bullets',
            items: [
                'example of first point',
                'example of second point',
            ]
        },
        tip: 'rewards can be claimed/reset on the 1st of every month.'
    },
    {
        title: 'Automation',
        iconKey: 'workers',
        accent: '#8D6E63',
        description: '',
        content: {
            type: 'bullets',
            items: [
                'example of first point',
                'example of second point',
            ],
        },
        tip: ''
    },
    {
        title: 'Weather Events',
        iconKey: 'weather_events',
        accent: '#42CDFF',
        description: '',
        content: {
            type: 'bullets',
            items: [
                'example of first point',
                'example of second point',
            ],
        },
        tip: ''
    },
    {
        title: 'Global Events',
        iconKey: 'global_events',
        accent: '#1976D2',
        description: '',
        content: {
            type: 'bullets',
            items: [
                'example of first point',
                'example of second point',
            ],
        },
        tip: ''
    },
    {
        title: 'Quests',
        iconKey: 'quests',
        accent: '#FF4B2B',
        description: '',
        content: {
            type: 'bullets',
            items: [
                'example of first point',
                'example of second point',
            ],
        },
        tip: ''
    },
    {
        title: 'Achievements',
        iconKey: 'achievements',
        accent: '#EC407A',
        description: '',
        content: {
            type: 'bullets',
            items: [
                'example of first point',
                'example of second point',
            ],
        },
        tip: ''
    },
];

/*
FEATURE CONTENT LAYOUTS

-- BULLET POINTS --
content: {
    type: 'bullets',
    items: [
        'example of first point',
        'example of second point',
    ],
},

-- PARAGRAPHS --
content: {
    type: 'paragraph',
    text: 'example paragraph walking through the premium rewards flow, from purchasing premium through to claiming and redeeming items via the vault.',
},
*/