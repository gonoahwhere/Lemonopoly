export const PREMIUM_PERKS = [
    'x2 Mix All Cap',
    'x2 ingredient discount',
    'Ability to automatically serve customers',
    'Access to Premium recipes',
    'Claimable bonus every month - can be automatically claimed',
    'Custom gradient heading names on rendered images',
    'Ability to gift ingredients to other players',
    'Access to premium only leaderboards',
    'Visible premium badge in the leaderboards',
    'Premium only channels in the Community Discord',
    'Customisation for recipe card borders',
    'Early access opportunities',
]

export const MONTHLY_CLAIMS = [
    {
        name: 'Tokens',
        id: 'premium_tokens',
        icon: 'token',
        description: 'special type of premium currency',
        quantity: 1000,
    },
    {
        name: 'Recipe Tickets',
        id: 'recipe_tickets',
        description: 'grants free drinks for an owned recipe',
        icon: 'ticket',
        quantity: 10,
    },
    {
        name: 'Ingredient Crate',
        id: 'ingredient_crate',
        description: 'grants a random selection of ingredients',
        icon: 'ingredient_crate',
        quantity: 1,
    },
    {
        name: 'Storage Expansion Token',
        id: 'storage_expansion_token',
        description: 'permanently increase capacity for a random ingredient/drink',
        icon: 'storage_expand',
        quantity: 1,
    },
    {
        name: 'Free Stand Repair',
        id: 'free_stand_repair',
        description: 'repairs stand health to 100 at no cost',
        icon: 'stand_repair',
        quantity: 3,
    },
    {
        name: 'Level Skip',
        id: 'level_skip',
        description: 'increases your level randomly by 1 to 4',
        icon: 'level_skip',
        quantity: 1,
    },
    {
        name: 'Free Staff Contract',
        id: 'free_staff_contract',
        description: 'hires a random staff member at no cost',
        icon: 'free_staff',
        quantity: 1,
    },
    {
        name: 'Gift Token Bundle',
        id: 'gift_token_bundle',
        description: 'preloaded ingredients to gift without using your own stock',
        icon: 'gift_token',
        quantity: 3,
    }
]