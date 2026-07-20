import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import config from '../../../config.js';
import PlayerProfile from '../../models/player.js';
import { renderIngredientMarket, getMarketIngredients, getIngredientMarketPageCount } from '../../renders/renderIngredientMarket.js';
import { RECIPES } from '../../data/recipes.js';
import { errorEmbed } from '../../utils/embed.js';

const marketViewIngredient = new Map();

export default async function handleMarketIngredient(interaction) {
    if (!interaction.customId.startsWith('market_ingredient_')) return;

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
    
    let page = marketViewIngredient.get(interaction.user.id) ?? 1;
    let ingredients = getMarketIngredients(profile); 
    const totalPages = getIngredientMarketPageCount(profile);

    if (interaction.customId === 'market_ingredient_previous') {
        page = Math.max(1, page - 1);
    }

    if (interaction.customId === 'market_ingredient_next') {
        page = Math.min(totalPages, page + 1);
    }

    marketViewIngredient.set(interaction.user.id, page);
    const image = await renderIngredientMarket(profile, page);
    const attachment = new AttachmentBuilder(image, { name: 'ingredient-market.png' });

    const previousPage = new ButtonBuilder()
        .setCustomId(`market_ingredient_previous`)
        .setEmoji(config.emoji('misc', 'left_arrow'))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1)
    
    const ingredientMarketPage = new ButtonBuilder()
        .setCustomId(`market_ingredient_page`)
        .setLabel(`${page} / ${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextPage = new ButtonBuilder()
        .setCustomId(`market_ingredient_next`)
        .setEmoji(config.emoji('misc', 'right_arrow'))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === totalPages)
    
    const row = new ActionRowBuilder().addComponents(previousPage, ingredientMarketPage, nextPage)
    await interaction.update({ files: [attachment], components: [row] });
    return true;
}