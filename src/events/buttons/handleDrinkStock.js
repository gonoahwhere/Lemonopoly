import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import config from '../../../config.js';
import PlayerProfile from '../../models/player.js';
import { renderDrinkStock } from '../../renders/renderDrinkStock.js';
import { RECIPES } from '../../data/recipes.js';
import { errorEmbed } from '../../utils/embed.js';

const OWNED_DRINKS_PER_PAGE = 12;
const drinkStockPageMap = new Map();

export default async function handleDrinkStock(interaction) {
    if (!interaction.customId.startsWith('drink_stock_')) return;

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

    const stockByKey = new Map((profile.drinks || []).map(stock => [stock.key, stock]));
    const ownedCount = RECIPES.filter(recipe => (stockByKey.get(recipe.id)?.quantity || 0) > 0).length;

    let page = drinkStockPageMap.get(interaction.user.id) ?? 1;
    const totalPages = Math.max(1, Math.ceil(ownedCount / OWNED_DRINKS_PER_PAGE));

    if (interaction.customId === 'drink_stock_previous') {
        page = Math.max(1, page - 1);
    }

    if (interaction.customId === 'drink_stock_next') {
        page = Math.min(totalPages, page + 1);
    }

    drinkStockPageMap.set(interaction.user.id, page);
    const image = renderDrinkStock(profile, page);
    const attachment = new AttachmentBuilder(image, { name: 'my-drinks.png' });

    const previousPage = new ButtonBuilder()
        .setCustomId(`drink_stock_previous`)
        .setEmoji(config.emoji('misc', 'left_arrow'))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1);

    const drinkPage = new ButtonBuilder()
        .setCustomId(`drink_stock_page`)
        .setLabel(`${page} / ${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextPage = new ButtonBuilder()
        .setCustomId(`drink_stock_next`)
        .setEmoji(config.emoji('misc', 'right_arrow'))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === totalPages);

    const row = new ActionRowBuilder().addComponents(previousPage, drinkPage, nextPage);
    await interaction.update({ files: [attachment], components: [row] });
    return true;
}