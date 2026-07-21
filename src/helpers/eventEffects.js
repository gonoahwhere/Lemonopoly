export const OUTCOME_EFFECTS = {
    // -- HEATWAVE (beneficial) --
    heatwave_one: { category: 'ingredientConsumptionMultiplier', value: 1.15 },
    heatwave_two: { category: 'sellCooldownMultiplier', value: 0.75 },
    heatwave_three: { category: 'tipChanceBonus', value: 0.15 },
    heatwave_four: { category: 'bonusSaleChance', value: 0.10 },
    heatwave_five: { category: 'customerChanceModifier', customer: 'tourist', value: 0.15 },
    heatwave_six: { category: 'customerChanceModifier', customer: 'kid', value: 0.15 },
    heatwave_seven: { category: 'customerChanceModifier', customer: 'angry', value: -0.15 },
    heatwave_eight: { category: 'ingredientCostMultiplier', value: 1.10 },
    heatwave_nine: { category: 'sellPriceMultiplier', value: 1.20 },
    heatwave_ten: { category: 'guaranteedCustomer', customer: 'tourist' },
    heatwave_eleven: { category: 'customerChanceModifier', customer: 'worker', value: 0.15 },

    // -- LOCAL FESTIVAL (beneficial) --
    local_festival_one: { category: 'sellCooldownMultiplier', value: 0.80 },
    local_festival_two: { category: 'tipChanceBonus', value: 0.15 },
    local_festival_three: { category: 'bonusSaleChance', value: 0.08 },
    local_festival_four: { category: 'customerChanceModifier', customer: 'tourist', value: 0.15 },
    local_festival_five: { category: 'customerChanceModifier', customer: 'rich', value: 0.15 },
    local_festival_six: { category: 'customerChanceModifier', customer: 'kid', value: 0.10 },
    local_festival_seven: { category: 'customerChanceModifier', customer: 'angry', value: -0.15 },
    local_festival_eight: { category: 'sellCooldownMultiplier', value: 0.50 },
    local_festival_nine: { category: 'ingredientCostMultiplier', value: 0.80 },
    local_festival_ten: { category: 'bulkTipChanceBonus', value: 0.20 },
    local_festival_eleven: { category: 'customerChanceModifier', customer: 'worker', value: 0.10 },

    // -- SUDDEN RAIN (risky) --
    sudden_rain_one: { category: 'sellCooldownMultiplier', value: 1.25 },
    sudden_rain_two: { category: 'ingredientCostMultiplier', value: 0.85 },
    sudden_rain_three: { category: 'ingredientConsumptionMultiplier', value: 0.85 },
    sudden_rain_four: { category: 'saleFailChance', value: 0.15 },
    sudden_rain_five: { category: 'tipAmountMultiplier', value: 0.80 },
    sudden_rain_six: { category: 'customerChanceModifier', customer: 'angry', value: 0.15 },
    sudden_rain_seven: { category: 'customerChanceModifier', customer: 'tourist', value: -0.15 },
    sudden_rain_eight: { category: 'customerChanceModifier', customer: 'rich', value: -0.15 },
    sudden_rain_nine: { category: 'customerChanceModifier', customer: 'kid', value: -0.10 },
    sudden_rain_ten: { category: 'bonusSaleChance', value: 0.10, discounted: true, discountMultiplier: 0.5 },
    sudden_rain_eleven: { category: 'customerChanceModifier', customer: 'worker', value: -0.10 },

    // -- THUNDERSTORM (harmful) --
    thunderstorm_one: { category: 'standDamageChance', value: 0.10 },
    thunderstorm_two: { category: 'sellCooldownMultiplier', value: 1.50 },
    thunderstorm_three: { category: 'ingredientStockLossChance', value: 0.15, lossPercent: 0.10 },
    thunderstorm_four: { category: 'saleFailChance', value: 0.25 },
    thunderstorm_five: { category: 'tipAmountMultiplier', value: 0.70 },
    thunderstorm_six: { category: 'customerChanceModifier', customer: 'angry', value: 0.20 },
    thunderstorm_seven: { category: 'customerChanceModifier', customer: 'tourist', value: -0.20 },
    thunderstorm_eight: { category: 'customerChanceModifier', customer: 'rich', value: -0.20 },
    thunderstorm_nine: { category: 'customerChanceModifier', customer: 'kid', value: -0.15 },
    thunderstorm_ten: { category: 'drinkStockLossChance', value: 0.15, lossPercent: 0.10 },
    thunderstorm_eleven: { category: 'customerChanceOverride', customer: 'worker', value: 0 },

    // -- WIND STORM (harmful) --
    wind_storm_one: { category: 'ingredientStockLossChance', value: 0.12, lossPercent: 0.10 },
    wind_storm_two: { category: 'drinkStockLossChance', value: 0.12, lossPercent: 0.10 },
    wind_storm_three: { category: 'standDamageChance', value: 0.05 },
    wind_storm_four: { category: 'sellCooldownMultiplier', value: 1.30 },
    wind_storm_five: { category: 'saleFailChance', value: 0.20 },
    wind_storm_six: { category: 'tipAmountMultiplier', value: 0.75 },
    wind_storm_seven: { category: 'customerChanceModifier', customer: 'angry', value: 0.20 },
    wind_storm_eight: { category: 'customerChanceModifier', customer: 'rich', value: -0.15 },
    wind_storm_nine: { category: 'customerChanceModifier', customer: 'tourist', value: -0.15 },
    wind_storm_ten: { category: 'customerChanceModifier', customer: 'kid', value: -0.10 },
    wind_storm_eleven: { category: 'customerChanceOverride', customer: 'worker', value: 0 },
};

function getEffect(activeEvent) {
    if (!activeEvent?.optionId) return null;
    return OUTCOME_EFFECTS[activeEvent.optionId] ?? null;
}

export function getSellCooldownMultiplier(activeEvent) {
    const e = getEffect(activeEvent);
    return e?.category === 'sellCooldownMultiplier' ? e.value : 1;
}

export function getSellPriceMultiplier(activeEvent) {
    const e = getEffect(activeEvent);
    return e?.category === 'sellPriceMultiplier' ? e.value : 1;
}

export function getIngredientConsumptionMultiplier(activeEvent) {
    const e = getEffect(activeEvent);
    return e?.category === 'ingredientConsumptionMultiplier' ? e.value : 1;
}

export function getIngredientCostMultiplier(activeEvent) {
    const e = getEffect(activeEvent);
    return e?.category === 'ingredientCostMultiplier' ? e.value : 1;
}

export function getTipChanceBonus(activeEvent) {
    const e = getEffect(activeEvent);
    return e?.category === 'tipChanceBonus' ? e.value : 0;
}

export function getBulkTipChanceBonus(activeEvent) {
    const e = getEffect(activeEvent);
    return e?.category === 'bulkTipChanceBonus' ? e.value : 0;
}

export function getTipAmountMultiplier(activeEvent) {
    const e = getEffect(activeEvent);
    return e?.category === 'tipAmountMultiplier' ? e.value : 1;
}

export function getBonusSaleChance(activeEvent) {
    const e = getEffect(activeEvent);
    if (e?.category !== 'bonusSaleChance') return { chance: 0, discounted: false, discountMultiplier: 1 };
    return {
        chance: e.value,
        discounted: !!e.discounted,
        discountMultiplier: e.discountMultiplier ?? 1,
    };
}

export function getSaleFailChance(activeEvent) {
    const e = getEffect(activeEvent);
    return e?.category === 'saleFailChance' ? e.value : 0;
}

export function getStandDamageChance(activeEvent) {
    const e = getEffect(activeEvent);
    return e?.category === 'standDamageChance' ? e.value : 0;
}

export function getStockLossChance(activeEvent, stockType) {
    const category = stockType === 'drink' ? 'drinkStockLossChance' : 'ingredientStockLossChance';
    const e = getEffect(activeEvent);
    if (e?.category !== category) return { chance: 0, lossPercent: 0 };
    return { chance: e.value, lossPercent: e.lossPercent ?? 0 };
}

export function getCustomerChanceModifier(activeEvent, customerId) {
    const e = getEffect(activeEvent);
    if (!e || e.customer !== customerId) return 0;
    if (e.category === 'customerChanceOverride') return null;
    if (e.category === 'customerChanceModifier') return e.value;
    return 0;
}

export function getCustomerChanceOverride(activeEvent, customerId) {
    const e = getEffect(activeEvent);
    if (e?.category === 'customerChanceOverride' && e.customer === customerId) return e.value;
    return null;
}

export function getGuaranteedCustomer(activeEvent) {
    const e = getEffect(activeEvent);
    return e?.category === 'guaranteedCustomer' ? e.customer : null;
}