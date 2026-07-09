export const RARITY_TIERS = [
    'common', 'uncommon', 'rare', 'epic', 'legendary',
    'mythic', 'divine', 'cosmic', 'transcendent', 'ancient',
    'primal', 'eternal', 'exotic',
];

export const MASTERY_DEFS = {
    // Normal Mastery Tiers
    common: { customersPerStar: 15, revenuePerStar: 3000, sellPriceBonusPerStar: 0.010, ingredientDiscountPerStar: 0.0008 },
    uncommon: { customersPerStar: 30, revenuePerStar: 7500, sellPriceBonusPerStar: 0.015, ingredientDiscountPerStar: 0.0012 },
    rare: { customersPerStar: 55, revenuePerStar: 16500, sellPriceBonusPerStar: 0.020, ingredientDiscountPerStar: 0.0016 },
    epic: { customersPerStar: 90, revenuePerStar: 33750, sellPriceBonusPerStar: 0.025, ingredientDiscountPerStar: 0.0020 },
    legendary: { customersPerStar: 140, revenuePerStar: 63750, sellPriceBonusPerStar: 0.030, ingredientDiscountPerStar: 0.0025 },
    mythic: { customersPerStar: 220, revenuePerStar: 120000, sellPriceBonusPerStar: 0.040, ingredientDiscountPerStar: 0.0031 },

    // Requires Prestiging
    divine: { customersPerStar: 350, revenuePerStar: 225000, sellPriceBonusPerStar: 0.050, ingredientDiscountPerStar: 0.0037, prestigeRequired: 1 },
    cosmic: { customersPerStar: 550, revenuePerStar: 412500, sellPriceBonusPerStar: 0.060, ingredientDiscountPerStar: 0.0043, prestigeRequired: 5 },
    transcendent: { customersPerStar: 850, revenuePerStar: 750000, sellPriceBonusPerStar: 0.075, ingredientDiscountPerStar: 0.0049, prestigeRequired: 10 },
    ancient: { customersPerStar: 1300, revenuePerStar: 1350000, sellPriceBonusPerStar: 0.090, ingredientDiscountPerStar: 0.0055, prestigeRequired: 15 },
    primal: { customersPerStar: 2000, revenuePerStar: 2400000, sellPriceBonusPerStar: 0.110, ingredientDiscountPerStar: 0.0061, prestigeRequired: 30 },
    eternal: { customersPerStar: 3000, revenuePerStar: 4125000, sellPriceBonusPerStar: 0.135, ingredientDiscountPerStar: 0.0068, prestigeRequired: 50 },
    exotic: { customersPerStar: 4500, revenuePerStar: 7125000, sellPriceBonusPerStar: 0.165, ingredientDiscountPerStar: 0.0074, prestigeRequired: 100 },
}