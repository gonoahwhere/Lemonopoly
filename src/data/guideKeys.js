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
                usage: '/drink-stock [page]',
                description: 'view your current stock of lemonade you\'ve mixed.'
            },
            {
                name: 'getting-started',
                usage: '/getting-started [page] [section]',
                description: 'view this detailed user manual for how lemonopoly works.'
            },
            {
                name: 'ingredient-stock',
                usage: '/ingredient-stock [page]',
                description: 'view your current stock of the ingredients you\'ve purchased.'
            },
            {
                name: 'mix',
                usage: '/mix <amount>',
                description: 'mix ingredients to create drinks for your active recipe.'
            },
            {
                name: 'market purchase ingredient',
                usage: '/market purchase ingredient <ingredient> <amount>',
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
                usage: '/ingredient-book [page]',
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
                name: 'lemon-illuminati view',
                usage: '/lemon-illuminati view',
                description: 'view the rewards you get each month for owning the premium pass.'
            },
            {
                name: 'market view',
                usage: '/market view <type> [page]',
                description: 'browse the market for new recipes you\'ve unlocked, or new ingredients.'
            },
            {
                name: 'my-recipes master',
                usage: '/my-recipes master <recipe>',
                description: 'master recipes to increase their sell price and earn a discount.'
            },
            {
                name: 'my-recipes view',
                usage: '/my-recipes view [page]',
                description: 'view your purchased recipes and their current mastery statistics.'
            },
            {
                name: 'premium-perks',
                usage: '/premium-perks',
                description: 'view the perks/rewards you could unlock by owning the premium pass.'
            },
            {
                name: 'recipe-book',
                usage: '/recipe-book [page]',
                description: 'view the full list of recipes, ingredients they need and how to unlock them.'
            },
            {
                name: 'stand rename',
                usage: '/stand rename <name>',
                description: 'give your stand a brand new name, visible via viewing the stand.'
            },
            {
                name: 'stand repair',
                usage: '/stand repair <method>',
                description: 'repair your stand back to full health after harmful weather events.'
            },
            {
                name: 'the-vault view',
                usage: '/the-vault view',
                description: 'view an inventory of the items you earn from your monthly bonus claim each month.'
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
                name: 'autosell',
                usage: '/autosell <mode>',
                description: 'enable/disable autosell as a premium member perk.'
            },
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
                name: 'lemon-illuminati claim',
                usage: '/lemon-illuminati claim',
                description: 'claim the monthly bonus rewards for owning the premium pass.'
            },
            {
                name: 'the-vault redeem',
                usage: '/the-vault redeem',
                description: 'redeem one of your monthly reward items for additional perks.'
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
                'if you\'re a premium member, you can utilise auto selling'
            ],
        },
        tips: [
            'mastering drinks increases their sell price and provides an ingredient discount.'
        ]
    },
    {
        title: 'Mastering Recipes',
        iconKey: 'mastery',
        accent: '#00897B',
        description: 'master recipes to accumulate an ingredient discount.',
        content: {
            type: 'bullets',
            items: [
                'to master a recipe you need to make sure you hit the requirements',
                'as you sell drinks, you will work towards earning 5 stars',
                'once a recipe has reached 5 stars and you have achieved the minimum income required',
                'you can use the master option while viewing your own recipes to master a recipe',
                'mastering increases its tier which ultimately increases the base sell price',
                'mastering also increases the overall personal ingredient discount price'
            ],
        },
        tips: [
            'some tiers require achieving prestige milestones to unlock access.'
        ]
    },
    {
        title: 'Premium Benefits',
        iconKey: 'premium',
        accent: '#9B4FD1',
        description: 'premium members earn monthly rewards, banked in the vault until redeemed.',
        content: {
            type: 'bullets',
            items: [
                'you can mix double the amount of drinks per mix',
                'your accumulated ingredient discount is doubled',
                'you can have the ability to use auto sell, disables manual selling',
                'claimable bonus every month, rewards show in the vault',
                'level skips are automatically applied per claim',
                'you can give most headings in the renders a gradient via the config settings',
                'you can give most borders in the renders a gradient via the config settings',
                'your stand can now show on premium only leaderboards',
                'there is now have a visible premium badge, upcoming update will make this togglable',
                'premium members will have early access opportunities for upcoming updates',
                'access to premium only channels in the Community Discord',
                'access to premium only recipes via the market'
            ]
        },
        tips: [
            'not all premium features have been implemented currently.',
            'rewards can be claimed/reset on the 1st of every month.'
        ]
    },
    {
        title: 'Automation',
        hidden: true,
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
        tips: [
            ''
        ]
    },
    {
        title: 'Weather Events',
        iconKey: 'weather_events',
        accent: '#42CDFF',
        description: 'personal weather events affect how your game progresses',
        content: {
            type: 'bullets',
            items: [
                'there are 5 types of weather events available at random',
                'each event can last anywhere from 10 minutes to 20 minutes',
                'each event also has individual outcomes that can occur',
                'only one outcome per event is selected at any one time',
                'you can view the possible outcomes for each weather type via the weather-events command',
                'you can also view the current event and which event is next',
                'the events also display whether they are beneficial, risky or harmful to your stand',
            ],
        },
        tips: [
            'weather events are personal, so each stand has their own type/outcome at any given point.'
        ]
    },
    {
        title: 'Global Events',
        hidden: true,
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
        tips: [
            ''
        ]
    },
    {
        title: 'Quests',
        hidden: true,
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
        tips: [
            ''
        ]
    },
    {
        title: 'Achievements',
        hidden: true,
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
        tips: [
            ''
        ]
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