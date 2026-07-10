import { SlashCommandBuilder, MessageFlags, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { renderRecipeMarket, getMarketRecipes } from '../../renders/renderRecipeMarket.js';
import { renderIngredientMarket, getMarketIngredients, getIngredientMarketPageCount } from '../../renders/renderIngredientMarket.js';
import { errorEmbed, successEmbed } from '../../utils/embed.js';
import { RECIPES } from "../../data/recipes.js";
import { INGREDIENTS } from '../../data/ingredients.js';
import config from '../../../config.js';
import { formatNumber } from '../../helpers/renderHelper.js';

function toSchemaRarity(rarity) {
    return typeof rarity === 'string' ? rarity.toLocaleLowerCase() : 'common';
}

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('View the market for recipes or ingredients.')
        .addSubcommand((sub) => sub
            .setName('view')
            .setDescription('View the recipes currently available on the market.')
            .addStringOption((opt) => opt
                .setName('type')
                .setDescription('Which market do you want to browse?')
                .addChoices(
                    { name: 'Recipes', value: 'recipe_market' },
                    { name: 'Ingredients', value: 'ingredient_market' }
                )
                .setRequired(true)
            )
        )
        .addSubcommandGroup((group) => group
            .setName('purchase')
            .setDescription('Purchase items from the market')
            .addSubcommand((sub) => sub
                .setName('recipe')
                .setDescription('Purchase a recipe from the market.')
                .addStringOption((opt) => opt
                    .setName('recipe')
                    .setDescription('The recipe you want to purchase.')
                    .setRequired(true)
                    .setAutocomplete(true)
                )
            )
            .addSubcommand((sub) => sub
                .setName('ingredient')
                .setDescription('Purchase ingredients from the market.')
                .addStringOption((opt) => opt
                    .setName('ingredient')
                    .setDescription('The ingredient you want to purchase.')
                    .setRequired(true)
                )
                .addIntegerOption((opt) => opt
                    .setName('amount')
                    .setDescription('How many ingredients you want to purchase.')
                    .setRequired(true)
                    .setMinValue(1)
                )
            )
        ),
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        const profile = interaction.playerProfile ??
            (await PlayerProfile.findOne({ discordId: interaction.user.id }));

        if (!profile) {
            return interaction.respond([]);
        }

        const recipes = getMarketRecipes(profile);

        const choices = recipes
            .filter((recipe) => recipe.name.toLowerCase().includes(focused))
            .slice(0, 25)
            .map((recipe) => ({
                name: `${recipe.name} - $${recipe.marketPrice}`,
                value: recipe.id,
            }));

        await interaction.respond(choices);
    },
    async execute(interaction) {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const profile = interaction.playerProfile;
        
        await interaction.deferReply();

        if (subcommand === 'view') {
            const choice = interaction.options.getString('type');

            if (choice === 'recipe_market') {
                let page = 1;
                
                const recipes = getMarketRecipes(profile); 
                const totalPages = Math.max(1, Math.ceil(recipes.length / 3));
                const buffer = await renderRecipeMarket(profile);
                const attachment = new AttachmentBuilder(buffer, { name: 'recipe-market.png' });
                const components = [];

                if (totalPages > 1) {
                    const previousPage = new ButtonBuilder()
                        .setCustomId(`market_recipe_previous`)
                        .setEmoji(config.emojis.misc.left_arrow)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 1);

                    const recipeMarketPage = new ButtonBuilder()
                        .setCustomId(`market_recipe_page`)
                        .setLabel(`${page} / ${totalPages}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);

                    const nextPage = new ButtonBuilder()
                        .setCustomId(`market_recipe_next`)
                        .setEmoji(config.emojis.misc.right_arrow)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === totalPages);

                    components.push(new ActionRowBuilder().addComponents(previousPage, recipeMarketPage, nextPage));
                }
                await interaction.editReply({ files: [attachment], components });
            }

            if (choice === 'ingredient_market') {
                let page = 1;
                
                const totalPages = getIngredientMarketPageCount(profile);
                const buffer = await renderIngredientMarket(profile);
                const attachment = new AttachmentBuilder(buffer, { name: 'ingredient-market.png' });
                const components = [];

                if (totalPages > 1) {
                    const previousPage = new ButtonBuilder()
                        .setCustomId(`market_ingredient_previous`)
                        .setEmoji(config.emojis.misc.left_arrow)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 1);

                    const ingredientMarketPage = new ButtonBuilder()
                        .setCustomId(`market_ingredient_page`)
                        .setLabel(`${page} / ${totalPages}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);

                    const nextPage = new ButtonBuilder()
                        .setCustomId(`market_ingredient_next`)
                        .setEmoji(config.emojis.misc.right_arrow)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === totalPages);

                    components.push(new ActionRowBuilder().addComponents(previousPage, ingredientMarketPage, nextPage));
                }
                await interaction.editReply({ files: [attachment], components });
            }
        }

        if (group === 'purchase') {
            if (subcommand === 'recipe') {
                const id = interaction.options.getString('recipe', true);
                const recipe = RECIPES.find((r) => r.id === id);

                if (!recipe) {
                    return interaction.editReply({
                        components: [errorEmbed('Invalid recipe!', `That recipe doesn't exist.`)],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                const price = recipe.marketPrice;
                if (profile.economy.cash < price) {
                    return interaction.editReply({
                        components: [errorEmbed('Insufficient funds!', `You need **$${formatNumber(price)}** to purchase the recipe for **${recipe.name}**, but you only have **${formatNumber(profile.economy.cash)}**.`)],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                profile.economy.cash -= price;
                profile.economy.lifetimeSpent.cash += price;

                profile.recipes.unlocked.push({
                    key: recipe.id,
                    rarity: toSchemaRarity(recipe.rarity),
                });

                await profile.save();
                return interaction.editReply({
                    components: [successEmbed('Recipe purchased', `You purchased **${recipe.name}** for **${formatNumber(price)}**! It's been added to \`/my-recipes\`.`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            if (subcommand === 'ingredient') {
                const ingredientId = interaction.options.getString('ingredient', true);
                const amount = interaction.options.getInteger('amount', true);

                const marketIngredients = getMarketIngredients(profile);
                const ingredient = marketIngredients.find((i) => i.id === ingredientId);

                if (!ingredient) {
                    return interaction.editReply({
                        components: [errorEmbed('Invalid ingredient!', `That ingredient doesn't exist.`)],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const stock = profile.ingredients.find((i) => i.key === ingredient.id);

                const currentQuantity = stock?.quantity ?? 0;
                const capacity = stock?.capacity ?? 40;

                if (currentQuantity + amount > capacity) {
                    return interaction.editReply({
                        components: [errorEmbed('Exceeds storage capacity!', `You can only purchase **${capacity - currentQuantity}** more **${ingredient.name}**.`)],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const totalPrice = ingredient.marketPrice * amount;

                if (profile.economy.cash < totalPrice) {
                    return interaction.editReply({
                        components: [errorEmbed('Insufficient funds!', `You need **$${formatNumber(totalPrice)}** to purchase the ingredient **${ingredient.name}**, but you only have **${profile.economy.cash}**.`)],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                profile.economy.cash -= totalPrice;
                profile.economy.lifetimeSpent.cash += totalPrice;

                if (stock) {
                    stock.quantity += amount;
                } else {
                    profile.ingredients.push({
                        key: ingredient.id,
                        quantity: amount,
                        capacity: 40,
                    });
                }

                await profile.save();

                return interaction.editReply({
                    components: [successEmbed('Ingredient purchased', `You purchased **${amount}x ${ingredient.name}** for a total of **$${formatNumber(totalPrice)}**! This has been added to \`/ingredient-stock\`.`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
        }
    }
}