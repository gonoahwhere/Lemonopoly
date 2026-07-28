export const FULL_HEALTH = 100;
export const MIX_BLOCK_HEALTH_THRESHOLD = 10;

// Repair cost curve
// Cost = missingHealth * BASE_COST_PER_POINT + missingHealth^2 * SEVERITY_FACTOR
// The squared term means cost per missing point grows the lower health gets,
// so a stand at 5% health costs disproportionately more per-point to fix than
// one at 80%. Tune these two constants against your economy.
const BASE_COST_PER_POINT = 1;
const SEVERITY_FACTOR = 0.03;

export function calculateRepairCost(profile) {
    const missingHealth = FULL_HEALTH - profile.stand.health;
    if (missingHealth <= 0) return 0;

    const linearComponent = missingHealth * BASE_COST_PER_POINT;
    const severityComponent = Math.pow(missingHealth, 2) * SEVERITY_FACTOR;

    return Math.round(linearComponent + severityComponent);
}

export function repairStandFully(profile) {
    profile.stand.health = FULL_HEALTH;
    profile.stand.repairCost = 0;
}

export function isStandTooDamagedToMix(profile) {
    return profile.stand.health <= MIX_BLOCK_HEALTH_THRESHOLD;
}