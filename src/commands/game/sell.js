import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { errorEmbed, warningEmbed, successEmbed } from '../../utils/embed.js';
import { RECIPES } from '../../data/recipes.js';
import { calculateStars } from '../../utils/recipeMastery.js';
import { formatNumber } from '../../helpers/renderHelper.js';
import { getSellCooldownMs, getTipChance, getDoubleChance, TIP_RATE } from '../../data/upgrades.js';

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

        const doubled = stock.quantity >= 2 && Math.random() < getDoubleChance(profile);
        const cupsSold = doubled ? 2 : 1;

        const saleValue = recipe.sellPrice * cupsSold;
        const tipped = Math.random() < getTipChance(profile);
        const tip = tipped ? Math.round(saleValue * TIP_RATE) : 0;
        const earnings = saleValue + tip;

        stock.quantity -= cupsSold;
        if (stock.quantity <= 0) {
            profile.drinks = profile.drinks.filter((d) => d.key !== activeRecipe.key);
        }

        profile.economy.cash += earnings;
        profile.economy.lifetimeEarned.cash += earnings;
        profile.stand.lastSoldAt = new Date();

        profile.customers.cupsSold += cupsSold;
        profile.customers.totalServed += cupsSold;
        if (tip > 0) profile.customers.totalTipsEarned += tip;

        activeRecipe.timesServed += cupsSold;
        activeRecipe.progress.customersServed += cupsSold;
        activeRecipe.progress.revenueEarned += earnings;
        activeRecipe.stars = calculateStars(activeRecipe);

        await profile.save();

        const title = doubled ? 'Double sale!' : 'Drink sold!';
        let detail = `You sold **${cupsSold}× ${recipe.name}** for **$${formatNumber(earnings)}**`;
        if (tip > 0) detail += ` **+$${formatNumber(tip)} tip**`;
        detail += `.\nYou now have **$${formatNumber(profile.economy.cash)}**.`;

        return interaction.reply({
            components: [successEmbed(title, detail)],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
