export const RARITY_TIERS = [
    'common', 'uncommon', 'rare', 'epic', 'legendary',
    'mythic', 'divine', 'cosmic', 'transcendent', 'ancient',
    'primal', 'eternal', 'exotic',
];

export const MASTERY_DEFS = {
    // Normal Mastery Tiers
    common: { customersPerStar: 15, revenuePerStar: 3000, sellPriceBonusPerStar: 0.010, ingredientDiscountPerStar: 0.004 },
    uncommon: { customersPerStar: 30, revenuePerStar: 7500, sellPriceBonusPerStar: 0.015, ingredientDiscountPerStar: 0.006 },
    rare: { customersPerStar: 55, revenuePerStar: 16500, sellPriceBonusPerStar: 0.020, ingredientDiscountPerStar: 0.008 },
    epic: { customersPerStar: 90, revenuePerStar: 33750, sellPriceBonusPerStar: 0.025, ingredientDiscountPerStar: 0.010 },
    legendary: { customersPerStar: 140, revenuePerStar: 63750, sellPriceBonusPerStar: 0.030, ingredientDiscountPerStar: 0.012 },
    mythic: { customersPerStar: 220, revenuePerStar: 120000, sellPriceBonusPerStar: 0.040, ingredientDiscountPerStar: 0.015 },
    
    // Requires Prestiging
    divine: { customersPerStar: 350, revenuePerStar: 225000, sellPriceBonusPerStar: 0.050, ingredientDiscountPerStar: 0.018, prestigeRequired: 1 },
    cosmic: { customersPerStar: 550, revenuePerStar: 412500, sellPriceBonusPerStar: 0.060, ingredientDiscountPerStar: 0.021, prestigeRequired: 5 },
    transcendent: { customersPerStar: 850, revenuePerStar: 750000, sellPriceBonusPerStar: 0.075, ingredientDiscountPerStar: 0.024, prestigeRequired: 10 },
    ancient: { customersPerStar: 1300, revenuePerStar: 1350000, sellPriceBonusPerStar: 0.090, ingredientDiscountPerStar: 0.027, prestigeRequired: 15 },
    primal: { customersPerStar: 2000, revenuePerStar: 2400000, sellPriceBonusPerStar: 0.110, ingredientDiscountPerStar: 0.030, prestigeRequired: 30 },
    eternal: { customersPerStar: 3000, revenuePerStar: 4125000, sellPriceBonusPerStar: 0.135, ingredientDiscountPerStar: 0.033, prestigeRequired: 50 },
    exotic: { customersPerStar: 4500, revenuePerStar: 7125000, sellPriceBonusPerStar: 0.165, ingredientDiscountPerStar: 0.036, prestigeRequired: 100 },
}