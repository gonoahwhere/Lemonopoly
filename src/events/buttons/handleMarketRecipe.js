import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import config from '../../../config.js';
import PlayerProfile from '../../models/player.js';
import { renderRecipeMarket, getMarketRecipes } from '../../renders/renderRecipeMarket.js';
import { RECIPES } from '../../data/recipes.js';
import { errorEmbed } from '../../utils/embed.js';

const marketViewRecipe = new Map();

export default async function handleMarketRecipe(interaction) {
    if (!interaction.customId.startsWith('market_recipe_')) return;

    if (interaction.user.id !== interaction.message.interaction?.user.id) {
        return interaction.reply({ content: `${config.emoji('misc', 'disabled')} Only the original user can interact with this.`, flags: MessageFlags.Ephemeral });
    }

    const profile = await PlayerProfile.findOne({ discordId: interaction.user.id });

    if (!profile) {
        return interaction.reply({
            components: [errorEmbed('You don\'t have a stand open yet!', 'You need to open your stand first - run `/start` to get going.')],
            flags: MessageFlags.IsComponentsV2,
        });
    }
    
    let page = marketViewRecipe.get(interaction.user.id) ?? 1;
    let recipes = getMarketRecipes(profile); 
    let totalPages = Math.max(1, Math.ceil(recipes.length / 3));

    if (interaction.customId === 'market_recipe_previous') {
        page = Math.max(1, page - 1);
    }

    if (interaction.customId === 'market_recipe_next') {
        page = Math.min(totalPages, page + 1);
    }

    marketViewRecipe.set(interaction.user.id, page);
    const image = await renderRecipeMarket(profile, page);
    const attachment = new AttachmentBuilder(image, { name: 'recipe-market.png' });

    const previousPage = new ButtonBuilder()
        .setCustomId(`market_recipe_previous`)
        .setEmoji(config.emoji('misc', 'left_arrow'))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1)
    
    const recipeMarketPage = new ButtonBuilder()
        .setCustomId(`market_recipe_page`)
        .setLabel(`${page} / ${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextPage = new ButtonBuilder()
        .setCustomId(`market_recipe_next`)
        .setEmoji(config.emoji('misc', 'right_arrow'))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === totalPages)
    
    const row = new ActionRowBuilder().addComponents(previousPage, recipeMarketPage, nextPage)
    await interaction.update({ files: [attachment], components: [row] });
    return true;
}