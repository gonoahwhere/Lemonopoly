export const RECIPES = [
    {
        id: 'classic_lemonade',
        name: 'Classic Lemonade',
        description: 'A timeless blend of lemons, white sugar, and ice.',
        rarity: 'Common',
        sellPrice: 6,
        unlock: {
            type: 'default'
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'white_sugar', amount: 1 },
            { id: 'water', amount: 1 },
            { id: 'ice', amount: 1 },
        ],
        marketPrice: 50
    },
    {
        id: 'sweet_lemonade',
        name: 'Sweet Lemonade',
        description: 'A drizzle of honey gives this refreshing classic a naturally sweet finish.',
        rarity: 'Common',
        sellPrice: 7,
        unlock: {
            type: 'playerLevel',
            value: 3
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'white_sugar', amount: 4 },
            { id: 'water', amount: 4 },
            { id: 'ice', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'extra_sour_lemonade',
        name: 'Extra Sour',
        description: 'Double the lemons for customers who enjoy a bold citrus kick.',
        rarity: 'Common',
        sellPrice: 7,
        unlock: {
            type: 'customersServed',
            value: 350
        },
        ingredients: [
            { id: 'lemon', amount: 5 },
            { id: 'white_sugar', amount: 1 },
            { id: 'water', amount: 3 },
            { id: 'ice', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'light_lemonade',
        name: 'Light Lemonade',
        description: 'Sparkling water and stevia create a crisp, lighter alternative.',
        rarity: 'Common',
        sellPrice: 8,
        unlock: {
            type: 'lifetimeRevenue',
            value: 180
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'stevia', amount: 1 },
            { id: 'water', amount: 4 },
            { id: 'ice', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'strawberry_lemonade',
        name: 'Strawberry Lemonade',
        description: 'Juicy strawberries bring a fruity twist to the original favourite.',
        rarity: 'Common',
        sellPrice: 9,
        unlock: {
            type: 'playerLevel',
            value: 8
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'strawberry', amount: 4 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 2 }
        ],
        marketPrice: 50
    },
    {
        id: 'blueberry_lemonade',
        name: 'Blueberry Lemonade',
        description: 'Sweet blueberries balance perfectly with sharp citrus notes.',
        rarity: 'Common',
        sellPrice: 10,
        unlock: {
            type: 'sellCups',
            value: 120
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'blueberry', amount: 5 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 2 },
        ],
        marketPrice: 50
    },
    {
        id: 'raspberry_lemonade',
        name: 'Raspberry Lemonade',
        description: 'A vibrant berry blend with a pleasantly tart finish.',
        rarity: 'Common',
        sellPrice: 10,
        unlock: {
            type: 'lifetimeRevenue',
            value: 900
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'raspberry', amount: 3 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 2 },
        ],
        marketPrice: 50
    },
    {
        id: 'cherry_lemonade',
        name: 'Cherry Lemonade',
        description: 'Rich cherries add a smooth sweetness to every sip.',
        rarity: 'Common',
        sellPrice: 11,
        unlock: {
            type: 'customersServed',
            value: 600
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'cherry', amount: 5 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 2 },
        ],
        marketPrice: 50
    },
    {
        id: 'peach_lemonade',
        name: 'Peach Lemonade',
        description: 'Fresh peaches and honey make for a mellow summer refreshment.',
        rarity: 'Common',
        sellPrice: 12,
        unlock: {
            type: 'playerLevel',
            value: 14
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'peach_tea', amount: 3 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 2 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'mango_lemonade',
        name: 'Mango Lemonade',
        description: 'Tropical mango transforms lemonade into a sunny delight.',
        rarity: 'Common',
        sellPrice: 12,
        unlock: {
            type: 'sellCups',
            value: 400
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'mango', amount: 2 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 2 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'pineapple_lemonade',
        name: 'Pineapple Lemonade',
        description: 'Bright pineapple adds an island-inspired sweetness.',
        rarity: 'Common',
        sellPrice: 13,
        unlock: {
            type: 'lifetimeRevenue',
            value: 3200
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'pineapple', amount: 3 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 2 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'watermelon_lemonade',
        name: 'Watermelon Lemonade',
        description: 'Cool watermelon keeps customers refreshed on the hottest days.',
        rarity: 'Common',
        sellPrice: 13,
        unlock: {
            type: 'upgradeSpeed',
            value: 3
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'watermelon', amount: 4 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 4 },
            { id: 'water', amount: 1 },
        ],
        marketPrice: 50
    },
    {
        id: 'kiwi_lemonade',
        name: 'Kiwi Lemonade',
        description: 'Tangy kiwi creates a vibrant, refreshing flavour.',
        rarity: 'Common',
        sellPrice: 14,
        unlock: {
            type: 'customersServed',
            value: 1000
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'kiwi', amount: 3 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 2 },
            { id: 'water', amount: 2 },
        ],
        marketPrice: 50
    },
    {
        id: 'passion_fruit_lemonade',
        name: 'Passion Fruit Lemonade',
        description: 'Exotic passionfruit pairs beautifully with honey and citrus.',
        rarity: 'Common',
        sellPrice: 15,
        unlock: {
            type: 'playerLevel',
            value: 28
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'passionfruit', amount: 2 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 2 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'dragon_fruit_lemonade',
        name: 'Dragon Fruit Lemonade',
        description: 'A colourful tropical recipe that\'s as striking as it is refreshing.',
        rarity: 'Common',
        sellPrice: 16,
        unlock: {
            type: 'sellCups',
            value: 900
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'dragonfruit', amount: 2 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 2 },
        ],
        marketPrice: 50
    },
    {
        id: 'limeade',
        name: 'Limeade',
        description: 'A sharp, zesty alternative made entirely with fresh limes.',
        rarity: 'Common',
        sellPrice: 16,
        unlock: {
            type: 'upgradeStorage',
            value: 4
        },
        ingredients: [
            { id: 'lime', amount: 5 },
            { id: 'white_sugar', amount: 3 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 4 },
        ],
        marketPrice: 50
    },
    {
        id: 'orange_lemonade',
        name: 'Orange Lemonade',
        description: 'Sweet oranges soften the lemon\'s bite for a balanced drink.',
        rarity: 'Common',
        sellPrice: 17,
        unlock: {
            type: 'lifetimeRevenue',
            value: 11000
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'orange', amount: 3 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 2 },
            { id: 'water', amount: 2 },
        ],
        marketPrice: 50
    },
    {
        id: 'triple_citrus',
        name: 'Triple Citrus',
        description: 'Lemon, lime and orange combine for the ultimate citrus explosion.',
        rarity: 'Common',
        sellPrice: 18,
        unlock: {
            type: 'playerLevel',
            value: 45
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'lime', amount: 1 },
            { id: 'orange', amount: 2 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 2 },
        ],
        marketPrice: 50
    },
    {
        id: 'mint_lemonade',
        name: 'Mint Lemonade',
        description: 'Cooling mint leaves make this recipe wonderfully refreshing.',
        rarity: 'Common',
        sellPrice: 18,
        unlock: {
            type: 'customersServed',
            value: 1600
        },
        ingredients: [
            { id: 'lemon', amount: 3 },
            { id: 'mint_leaf', amount: 5 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'lavender_lemonade',
        name: 'Lavender Lemonade',
        description: 'Delicate floral notes create a calming, elegant drink.',
        rarity: 'Common',
        sellPrice: 19,
        unlock: {
            type: 'lifetimeRevenue',
            value: 25000
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'lavender', amount: 1 },
            { id: 'honey', amount: 2 },
            { id: 'ice', amount: 2 },
            { id: 'water', amount: 4 },
        ],
        marketPrice: 50
    },
    {
        id: 'rosemary_lemonade',
        name: 'Rosemary Lemonade',
        description: 'Aromatic rosemary gives this lemonade a sophisticated flavour.',
        rarity: 'Common',
        sellPrice: 20,
        unlock: {
            type: 'playerLevel',
            value: 67
        },
        ingredients: [
            { id: 'lemon', amount: 3 },
            { id: 'rosemary', amount: 2 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 2 },
            { id: 'water', amount: 4 },
        ],
        marketPrice: 50
    },
    {
        id: 'basil_lemonade',
        name: 'Basil Lemonade',
        description: 'Fresh basil adds a subtle herbal freshness to every glass.',
        rarity: 'Common',
        sellPrice: 20,
        unlock: {
            type: 'sellCups',
            value: 2000
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'basil', amount: 4 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 2 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'arnold_palmer',
        name: 'Arnold Palmer',
        description: 'The famous combination of iced tea and lemonade.',
        rarity: 'Common',
        sellPrice: 21,
        unlock: {
            type: 'customersServed',
            value: 3000
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'black_tea', amount: 2 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'peach_tea_lemonade',
        name: 'Peach Tea Lemonade',
        description: 'Sweet peach tea meets citrus for a smooth afternoon favourite.',
        rarity: 'Common',
        sellPrice: 22,
        unlock: {
            type: 'lifetimeRevenue',
            value: 75000
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'peach_tea', amount: 2 },
            { id: 'black_tea', amount: 2 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'green_tea_lemonade',
        name: 'Green Tea Lemonade',
        description: 'Refreshing green tea keeps this recipe light and balanced.',
        rarity: 'Common',
        sellPrice: 22,
        unlock: {
            type: 'playerLevel',
            value: 90
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'green_tea', amount: 3 },
            { id: 'honey', amount: 1 },
            { id: 'ice', amount: 2 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'hibiscus_lemonade',
        name: 'Hibiscus Lemonade',
        description: 'Floral hibiscus creates a beautifully vibrant lemonade.',
        rarity: 'Common',
        sellPrice: 23,
        unlock: {
            type: 'sellCups',
            value: 5000
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'hibiscus_tea', amount: 2 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'island_splash',
        name: 'Island Splash',
        description: 'Mango, pineapple and coconut water bring tropical paradise to your stand.',
        rarity: 'Common',
        sellPrice: 24,
        unlock: {
            type: 'lifetimeRevenue',
            value: 250000
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'pineapple', amount: 3 },
            { id: 'coconut', amount: 1 },
            { id: 'mango', amount: 2 },
            { id: 'ice', amount: 4 },
        ],
        marketPrice: 50
    },
    {
        id: 'tropical_sunrise',
        name: 'Tropical Sunrise',
        description: 'Layers of citrus and tropical fruit create a stunning flavour.',
        rarity: 'Common',
        sellPrice: 25,
        unlock: {
            type: 'playerLevel',
            value: 146
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'orange', amount: 2 },
            { id: 'mango', amount: 2 },
            { id: 'pomegranate', amount: 3 },
            { id: 'ice', amount: 4 },
        ],
        marketPrice: 50
    },
    {
        id: 'coconut_lemonade',
        name: 'Coconut Lemonade',
        description: 'Coconut water gives this lemonade a smooth island finish.',
        rarity: 'Common',
        sellPrice: 25,
        unlock: {
            type: 'customersServed',
            value: 7500
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'coconut', amount: 2 },
            { id: 'coconut_water', amount: 3 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'pink_lemonade',
        name: 'Pink Lemonade',
        description: 'A colourful blend of strawberries and raspberries loved by every customer.',
        rarity: 'Common',
        sellPrice: 26,
        unlock: {
            type: 'lifetimeRevenue',
            value: 1000000
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'cranberry', amount: 4 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 1 },
        ],
        marketPrice: 50
    },
    {
        id: 'creamy_lemonade',
        name: 'Creamy Lemonade',
        description: 'Cream and vanilla create an indulgent dessert-inspired drink.',
        rarity: 'Common',
        sellPrice: 27,
        unlock: {
            type: 'playerLevel',
            value: 204
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'cream', amount: 3 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 1 },
        ],
        marketPrice: 50
    },
    {
        id: 'vanilla_lemonade',
        name: 'Vanilla Lemonade',
        description: 'Sweet vanilla softens the citrus into a smooth refreshment.',
        rarity: 'Common',
        sellPrice: 27,
        unlock: {
            type: 'sellCups',
            value: 10000
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'vanilla', amount: 1 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'caramel_lemonade',
        name: 'Caramel Lemonade',
        description: 'Rich caramel adds a surprisingly delicious twist to lemonade.',
        rarity: 'Common',
        sellPrice: 28,
        unlock: {
            type: 'lifetimeRevenue',
            value: 100000000
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'caramel_syrup', amount: 2 },
            { id: 'white_sugar', amount: 1 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 2 },
        ],
        marketPrice: 50
    },
    {
        id: 'ginger_lemonade',
        name: 'Ginger Lemonade',
        description: 'Fresh ginger delivers a warming zing with every sip.',
        rarity: 'Common',
        sellPrice: 29,
        unlock: {
            type: 'playerLevel',
            value: 300
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'ginger', amount: 2 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 2 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'spiced_lemonade',
        name: 'Spiced Lemonade',
        description: 'Cinnamon and cloves make this the perfect cosy lemonade.',
        rarity: 'Common',
        sellPrice: 30,
        unlock: {
            type: 'customersServed',
            value: 15000
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'cinnamon', amount: 1 },
            { id: 'nutmeg', amount: 1 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: 50
    },
    {
        id: 'royal_lemonade',
        name: 'Royal Lemonade',
        description: 'A luxurious blend of organic lemon and wild honey, served over diamond ice for a smooth, noble finish.',
        rarity: 'Rare',
        sellPrice: 50,
        unlock: {
            type: 'premium',
            requiresPass: true
        },
        ingredients: [
            { id: 'organic_lemon', amount: 4 },
            { id: 'wild_honey', amount: 3 },
            { id: 'gold_leaf', amount: 1 },
            { id: 'diamond_ice', amount: 3 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: null
    },
    {
        id: 'golden_lemonade',
        name: 'Golen Lemonade',
        description: 'Fresh organic lemon balanced with rich golden honey and premium sugar for a refined, regal sweetness.',
        rarity: 'Rare',
        sellPrice: 50,
        unlock: {
            type: 'premium',
            requiresPass: true
        },
        ingredients: [
            { id: 'organic_lemon', amount: 3 },
            { id: 'premium_sugar', amount: 4 },
            { id: 'gold_leaf', amount: 2 },
            { id: 'ice', amount: 3 },
            { id: 'water', amount: 3 },
        ],
        marketPrice: null
    },
    {
        id: 'diamond_fizz',
        name: 'Diamond Fizz',
        description: 'Sparkling water poured over diamond ice and rainbow syrup, creating a crisp, effervescent glow in every glass.',
        rarity: 'Rare',
        sellPrice: 50,
        unlock: {
            type: 'premium',
            requiresPass: true
        },
        ingredients: [
            { id: 'organic_lemon', amount: 3 },
            { id: 'premium_sugar', amount: 2 },
            { id: 'diamond_ice', amount: 4 },
            { id: 'sparkling_water', amount: 3 },
        ],
        marketPrice: null
    },
    {
        id: 'galaxy_lemonade',
        name: 'Galaxy Lemonade',
        description: 'A cosmic fusion of dragonfruit and rainbow syrup, shimmering with edible glitter in every sip.',
        rarity: 'Rare',
        sellPrice: 50,
        unlock: {
            type: 'premium',
            requiresPass: true
        },
        ingredients: [
            { id: 'organic_lemon', amount: 2 },
            { id: 'rainbow_syrup', amount: 3 },
            { id: 'edible_glitter', amount: 2 },
            { id: 'diamond_ice', amount: 4 },
            { id: 'water', amount: 2 },
        ],
        marketPrice: null
    },
    {
        id: 'pumpkin_lemonade',
        name: 'Pumpkin Lemonade',
        description: 'A warm seasonal blend of pumpkin, cinnamon, and honey layered into a surprisingly smooth autumn citrus drink.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'fall_2026'
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'pumpkin', amount: 3 },
            { id: 'cinnamon', amount: 2 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
        ],
        marketPrice: null
    },
    {
        id: 'candy_cane_lemonade',
        name: 'Candy Cany Lemonade',
        description: 'A festive mix of lemon and peppermint with crushed candy cane pieces, delivering a cool winter sparkle.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'winter_2026'
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'candy_cane', amount: 3 },
            { id: 'peppermint', amount: 2 },
            { id: 'white_sugar', amount: 1 },
            { id: 'snowflake_ice', amount: 4 },
        ],
        marketPrice: null
    },
    {
        id: 'hot_chocolate_lemonade',
        name: 'Hot Chocolate Lemonade',
        description: 'A bold seasonal experiment combining rich chocolate, peppermint, and marshmallow with a citrus twist.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'summer_2026'
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'chocolate', amount: 3 },
            { id: 'marshmallow', amount: 2 },
            { id: 'milk', amount: 4 },
            { id: 'water', amount: 1 },
        ],
        marketPrice: null
    },
    {
        id: 'valentine_punch',
        name: 'Valentine Punch',
        description: 'A romantic blend of strawberry and raspberry with heart sprinkles, crafted for a sweet, celebratory finish.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'spring_2026'
        },
        ingredients: [
            { id: 'lemon', amount: 1 },
            { id: 'heart_sprinkles', amount: 3 },
            { id: 'cranberry', amount: 3 },
            { id: 'white_sugar', amount: 2 },
            { id: 'ice', amount: 3 },
        ],
        marketPrice: null
    },
    {
        id: 'rainbow_overload',
        name: 'Rainbow Overload',
        description: 'Every fruit in the pantry was added "for balance." Against all scientific expectation, it somehow tastes incredible.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'pride_2026'
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'water', amount: 2 },
            { id: 'strawberry', amount: 2 },
            { id: 'orange', amount: 2 },
            { id: 'green_apple', amount: 2 },
            { id: 'blueberry', amount: 2 },
            { id: 'grape', amount: 2 },
            { id: 'prism_dust', amount: 3 },
            { id: 'rainbow_sprinkles', amount: 3 },
            { id: 'pride_confetti', amount: 3 }
        ],
        marketPrice: null
    },
    {
        id: 'flux_capacitea',
        name: 'Flux Capacitea',
        description: 'Changes flavour every sip depending on who is holding the glass. The recipe refuses to elaborate.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'pride_2026'
        },
        ingredients: [
            { id: 'water', amount: 2 },
            { id: 'black_tea', amount: 2 },
            { id: 'hibiscus_tea', amount: 3 },
            { id: 'peach_tea', amount: 1 },
            { id: 'lavender', amount: 2 },
            { id: 'blueberry', amount: 1 },
            { id: 'white_sugar', amount: 3 },
            { id: 'prism_dust', amount: 1 },
            { id: 'rainbow_sprinkles', amount: 1 },
            { id: 'pride_confetti', amount: 1 }
        ],
        marketPrice: null
    },
    {
        id: 'binary_exception',
        name: 'Binary Exception',
        description: 'A lemonade that rejected the concept of two ingredients and kept adding more until everyone was happy.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'pride_2026'
        },
        ingredients: [
            { id: 'lemon', amount: 3 },
            { id: 'banana', amount: 2 },
            { id: 'black_tea', amount: 1 },
            { id: 'cream', amount: 3 },
            { id: 'grape', amount: 2 },
            { id: 'white_sugar', amount: 4 },
            { id: 'prism_dust', amount: 1 },
            { id: 'rainbow_sprinkles', amount: 1 },
            { id: 'pride_confetti', amount: 1 }
        ],
        marketPrice: null
    },
    {
        id: 'ace_in_the_glass',
        name: 'Ace In The Glass',
        description: 'A mysteriously elegant blend with rich vanilla notes that prefers quiet confidence over unnecessary sweetness.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'pride_2026'
        },
        ingredients: [
            { id: 'water', amount: 3 },
            { id: 'vanilla', amount: 3 },
            { id: 'vanilla_syrup', amount: 2 },
            { id: 'cream', amount: 2 },
            { id: 'black_tea', amount: 1 },
            { id: 'stevia', amount: 1 },
            { id: 'prism_dust', amount: 1 },
            { id: 'rainbow_sprinkles', amount: 1 },
            { id: 'pride_confetti', amount: 1 }
        ],
        marketPrice: null
    },
    {
        id: 'double_trouble',
        name: 'Double Trouble',
        description: 'Can\'t decide between berry or citrus, so it aggressively became both. Zero regrets.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'pride_2026'
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'raspberry', amount: 3 },
            { id: 'blackberry', amount: 2 },
            { id: 'blueberry', amount: 3 },
            { id: 'white_sugar', amount: 2 },
            { id: 'prism_dust', amount: 1 },
            { id: 'rainbow_sprinkles', amount: 1 },
            { id: 'pride_confetti', amount: 1 }
        ],
        marketPrice: null
    },
    {
        id: 'kitchen_sink_deluxe',
        name: 'Kitchen Sink Deluxe',
        description: 'A glorious kitchen catastrophe featuring almost every fruit within arm\'s reach. Pure delicious chaos.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'pride_2026'
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'water', amount: 1 },
            { id: 'strawberry', amount: 3 },
            { id: 'mango', amount: 1 },
            { id: 'pineapple', amount: 4 },
            { id: 'blueberry', amount: 2 },
            { id: 'white_sugar', amount: 2 },
            { id: 'prism_dust', amount: 1 },
            { id: 'rainbow_sprinkles', amount: 1 },
            { id: 'pride_confetti', amount: 1 }
        ],
        marketPrice: null
    },
    {
        id: 'character_customizer',
        name: 'Character Customizer',
        description: 'Layers of pastel sweetness swirl together into something completely different from where they started.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'pride_2026'
        },
        ingredients: [
            { id: 'water', amount: 2 },
            { id: 'coconut', amount: 2 },
            { id: 'strawberry', amount: 2 },
            { id: 'blueberry', amount: 2 },
            { id: 'cream', amount: 3 },
            { id: 'white_sugar', amount: 1 },
            { id: 'prism_dust', amount: 1 },
            { id: 'rainbow_sprinkles', amount: 1 },
            { id: 'pride_confetti', amount: 1 }
        ],
        marketPrice: null
    },
    {
        id: 'raspberry_revolution',
        name: 'Raspberry Revolution',
        description: 'Sweet, bold, and unapologetically fruity. Decorated with enough berries to make the blender nervous.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'pride_2026'
        },
        ingredients: [
            { id: 'lemon', amount: 2 },
            { id: 'raspberry', amount: 4 },
            { id: 'strawberry', amount: 2 },
            { id: 'cherry', amount: 2 },
            { id: 'orange', amount: 2 },
            { id: 'maraschino_cherry', amount: 3 },
            { id: 'white_sugar', amount: 2 },
            { id: 'prism_dust', amount: 1 },
            { id: 'rainbow_sprinkles', amount: 1 },
            { id: 'pride_confetti', amount: 1 }
        ],
        marketPrice: null
    },
    {
        id: 'mint_condition',
        name: 'Mint Condition',
        description: 'A cool blend of mint, lime, and citrus so fresh it immediately gains +10 confidence.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'pride_2026'
        },
        ingredients: [
            { id: 'lime', amount: 3 },
            { id: 'lemon', amount: 1 },
            { id: 'mint', amount: 3 },
            { id: 'blueberry', amount: 2 },
            { id: 'blackberry', amount: 2 },
            { id: 'sparkling_water', amount: 2 },
            { id: 'white_sugar', amount: 1 },
            { id: 'prism_dust', amount: 1 },
            { id: 'rainbow_sprinkles', amount: 1 },
            { id: 'pride_confetti', amount: 1 }
        ],
        marketPrice: null
    },
    {
        id: 'sunburst_splash',
        name: 'Sunburst Splash',
        description: 'A vibrant fusion of golden fruit and juicy citrus that shines as brightly as summer sunshine.',
        rarity: 'Epic',
        sellPrice: 75,
        unlock: {
            type: 'seasonal',
            eventKey: 'pride_2026'
        },
        ingredients: [
            { id: 'orange', amount: 3 },
            { id: 'mango', amount: 2 },
            { id: 'pineapple', amount: 1 },
            { id: 'lemon', amount: 2 },
            { id: 'blackberry', amount: 2 },
            { id: 'honey', amount: 2 },
            { id: 'orange_slice', amount: 1 },
            { id: 'prism_dust', amount: 1 },
            { id: 'rainbow_sprinkles', amount: 1 },
            { id: 'pride_confetti', amount: 1 }
        ],
        marketPrice: null
    },
];