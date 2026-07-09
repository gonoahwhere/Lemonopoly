export function getRecipeUnlock(recipe, player) {
    const unlock = recipe.unlock;

    switch (unlock.type) {
        case 'default':
            return {
                unlocked: true,
                progress: 100,
                text: 'Unlocked',
            };
        
        case 'playerLevel': {
            const current = player.stand.level ?? 1;
            const required = unlock.value;

            return {
                unlocked: current >= required,
                progress: Math.min(100, Math.floor((current / required) * 100)),
                text: `Reach Level ${required}`
            };
        }

        case 'customersServed': {
            const current = player.customers.totalServed ?? 0;
            const required = unlock.value;

            return {
                unlocked: current >= required,
                progress: Math.min(100, Math.floor((current / required) * 100)),
                text: `Serve ${required} Customers`
            };
        }

        case 'sellCups': {
            const current = player.customers.cupsSold ?? 0;
            const required = unlock.value;

            return {
                unlocked: current >= required,
                progress: Math.min(100, Math.floor((current / required) * 100)),
                text: `Sell ${required} Cups`
            };
        }

        case 'lifetimeRevenue': {
            const current = player.economy.lifetimeEarned.cash ?? 0;
            const required = unlock.value;

            return {
                unlocked: current >= required,
                progress: Math.min(100, Math.floor((current / required) * 100)),
                text: `Earn A Lifetime Of ${required} Cash`
            };
        }

        case 'upgradeSpeed': {
            const current = player.upgrades.speed?.level ?? 0;
            const required = unlock.value;

            return {
                unlocked: current >= required,
                progress: Math.min(100, Math.floor((current / required) * 100)),
                text: `Upgrade Speed To Level ${required}`
            };
        }

        case 'upgradeStorage': {
            const current = player.upgrades.speed?.level ?? 0;
            const required = unlock.value;

            return {
                unlocked: current >= required,
                progress: Math.min(100, Math.floor((current / required) * 100)),
                text: `Upgrade Storage To Level ${required}`
            };
        }

        case 'prestige': {
            const current = player.prestige.level ?? 0;
            const required = unlock.value;

            return {
                unlocked: current >= required,
                progress: Math.min(100, Math.floor((current / required) * 100)),
                text: `Reach Prestige ${required}`
            };
        }

        case 'seasonal': {
            const activeSeason = player.events?.active?.key;
            const isActive = activeSeason && activeSeason === unlock.eventKey;

            return {
                unlocked: isActive,
                progress: isActive ? 100 : 0,
                text: `Seasonal Event`
            };
        }

        case 'premium': {
            const hasAccess = player.entitlements?.premiumPass === true;

            return {
                unlocked: hasAccess,
                progress: hasAccess ? 100 : 0,
                text: `Premium Pass Required`
            };
        }

        default:
            return {
                unlocked: false,
                progress: 0,
                text: 'Unknown Requirement'
            };
    }
}