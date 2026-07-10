import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { errorEmbed, warningEmbed, successEmbed } from '../../utils/embed.js';
import { RECIPES } from '../../data/recipes.js';
import { calculateStars } from '../../utils/recipeMastery.js';
import { formatNumber } from '../../helpers/renderHelper.js';

const BASE_SELL_COOLDOWN_MS = 10_000;

function getSellCooldownMs(profile) {
    if (profile.upgrades.speed.level === 0) {
        return BASE_SELL_COOLDOWN_MS;
    }
}

export default {
    devOnly: false,
    cooldown: 0,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell your active recipe to the customers.'),
    async execute(interaction) {
        const profile = interaction.playerProfile;

        const activeRecipe = profile.recipes.unlocked.find((r) => r.isActive);
        if (!activeRecipe) {
            return interaction.reply({
                components: [errorEmbed('No active recipe!', 'You don\'t have an active recipe set. Set one, then mix some up with `/mix`.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const recipe = RECIPES.find((r) => r.id === activeRecipe.key);
        if (!recipe) {
            return interaction.reply({
                components: [errorEmbed('Drink not found!', 'Your active recipe couldn\'t be found. Please try again later.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const stock = profile.drinks.find((d) => d.key === activeRecipe.key);
        if (!stock || stock.quantity <= 0) {
            return interaction.reply({
                components: [errorEmbed('Nothing to sell!', `You're out of **${recipe.name}** — make more with \`/mix\`.`)],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const cooldownMs = getSellCooldownMs(profile);
        const lastSold = profile.stand.lastSoldAt ? profile.stand.lastSoldAt.getTime() : 0;
        const remainingMs = lastSold + cooldownMs - Date.now();

        if (remainingMs > 0) {
            return interaction.reply({
                components: [warningEmbed('Hold on!', `Your next customer isn't ready yet — you can sell again in **${(remainingMs / 1000).toFixed(1)}s**.`)],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const earnings = recipe.sellPrice;
        
        stock.quantity -= 1;
        if (stock.quantity === 0) {
            profile.drinks = profile.drinks.filter((d) => d.key !== activeRecipe.key);
        }

        profile.economy.cash += earnings;
        profile.economy.lifetimeEarned.cash += earnings;
        profile.stand.lastSoldAt = new Date();
        profile.customers.cupsSold += 1;
        profile.customers.totalServed += 1;

        activeRecipe.progress.timesServed += 1;
        activeRecipe.progress.customersServed += 1;
        activeRecipe.progress.revenueEarned += earnings;
        activeRecipe.stars = calculateStars(activeRecipe);

        await profile.save();

        return interaction.reply({
            components: [successEmbed('Drink sold!', `You sold a **${recipe.name}** for **$${formatNumber(earnings)}**.\nYou now have **$${formatNumber(profile.economy.cash)}**.`)],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}