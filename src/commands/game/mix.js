import { SlashCommandBuilder, AttachmentBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { errorEmbed, successEmbed } from '../../utils/embed.js';
import config from "../../../config.js";
import { RECIPES } from "../../data/recipes.js";
import { INGREDIENTS } from "../../data/ingredients.js";
import { getStorageCapacity } from "../../data/upgrades.js";

function getIngredientEmoji(id) {
    const categories = config.emojis.ingredients;

    for (const category of Object.values(categories)) {
        if (category[id]) {
            return category[id];
        }
    }

    return '';
}

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('mix')
        .setDescription('Mix ingredients to create your active recipe')
        .addStringOption((opt) => opt
            .setName('amount')
            .setDescription('How many lemonade(s) to mix? (10 max | "all" for all)')
            .setRequired(true)
        ),
    async execute(interaction) {
        const amountInput = interaction.options.getString('amount');
        const player = interaction.playerProfile;
        const activeRecipe = player.recipes.unlocked.find((r) => r.isActive);
        const recipe = RECIPES.find((r) => r.id === activeRecipe.key);
        const amount = amountInput.toLowerCase() === 'all' ? 'all' : parseInt(amountInput, 10);

        if (!player) {
            return interaction.reply({
                components: [errorEmbed('You don\'t have a stand open yet!', 'You need to open your stand first - run `/start` to get going.')],
            });
        }

        if (amount !== 'all' && (isNaN(amount) || amount <= 0 || amount > 10)) {
            return interaction.reply({
                components: [errorEmbed('Invalid amount.', 'Please enter a number between **1** and **10**, or **"all"**.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        if (!activeRecipe) {
            return interaction.reply({
                components: [errorEmbed('No active recipe found.', 'Please set an active recipe first.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }
        
        if (!recipe || !recipe.ingredients?.length) {
            return interaction.reply({
                components: [errorEmbed('Something went wrong.', 'Your active recipe couldn\'t be found. Please try again later.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const ingredientStock = new Map(player.ingredients.map((s) => [s.key, s]));
        const quantityOf = (id) => ingredientStock.get(id)?.quantity || 0;
        const maxCraftable = recipe.ingredients.reduce((max, req) => Math.min(max, Math.floor(quantityOf(req.id) / req.amount)), 25);

        const drinkCap = getStorageCapacity(player);
        const currentDrinks = player.drinks.find((d) => d.key === recipe.id)?.quantity ?? 0;
        const drinkSpace = Math.max(0, drinkCap - currentDrinks);

        if (maxCraftable < 1) {
            const shortList = recipe.ingredients
                .filter((req) => quantityOf(req.id) < req.amount)
                .map((req) => `- ${getIngredientEmoji(req.id)} **(${quantityOf(req.id)}/${req.amount})**`)
                .join('\n');

            return interaction.reply({
                components: [errorEmbed('Not enough ingredients!', `You can't mix a **${recipe.name}** yet. You seem to be missing ingredients:\n${shortList}`)],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        if (drinkSpace < 1) {
            return interaction.reply({
                components: [errorEmbed('Storage full!', `Your storage is already holding **${currentDrinks}/${drinkCap} ${recipe.name}**. Sell some with \`/sell\` or upgrade storage with \`/upgrade buy\`.`)],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const craftLimit = Math.min(maxCraftable, drinkSpace);
        const count = amount === 'all' ? craftLimit : amount;

        if (count > maxCraftable) {
            return interaction.reply({
                components: [errorEmbed('Not enough ingredients!', `You can only mix **${maxCraftable} ${recipe.name}${maxCraftable === 1 ? '' : 's'}** with your current stock, not **${count}**.`)],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        if (count > drinkSpace) {
            return interaction.reply({
                components: [errorEmbed('Not enough storage!', `You currently have **${currentDrinks}/${drinkCap} ${recipe.name}** so you can only mix **${drinkSpace}** more. Sell some or upgrade storage with \`/upgrade buy\`.`)],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        for (const req of recipe.ingredients) {
            ingredientStock.get(req.id).quantity -= req.amount * count;
        }

        const drinkEntry = player.drinks.find((d) => d.key === recipe.id);
        if (drinkEntry) {
            drinkEntry.quantity += count;
        } else {
            player.drinks.push({ key: recipe.id, quantity: count });
        }

        await player.save();

        const usedList = recipe.ingredients
            .map((req) => `- ${getIngredientEmoji(req.id)} **x${req.amount * count}**`)
            .join('\n');
        const newTotal = player.drinks.find((d) => d.key === recipe.id).quantity;

        return interaction.reply({
            components: [successEmbed(`Mixed ${count} ${recipe.name}${count === 1 ? '' : 's'}!`, `Ingredients that were used:\n${usedList}\n\nYou now have **${newTotal}** in stock — check \`/drink-stock\` to see your inventory.`)],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}