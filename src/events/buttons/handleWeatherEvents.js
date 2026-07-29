
import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import config from '../../../config.js';
import PlayerProfile from '../../models/player.js';
import { EVENT_DETAILS } from '../../data/eventKeys.js';
import { renderWeatherEvent } from '../../renders/renderWeatherEvents.js';
import { errorEmbed } from '../../utils/embed.js';

const weatherEventMap = new Map();

export default async function handleWeatherEvents(interaction) {
    if (!interaction.customId.startsWith('weather_event_')) return;

    if (interaction.user.id !== interaction.message.interaction?.user.id) {
        return interaction.reply({ content: `${config.emojis.misc.disabled} Only the original user can interact with this.`, flags: MessageFlags.Ephemeral });
    }

    const profile = await PlayerProfile.findOne({ discordId: interaction.user.id });

    if (!profile) {
        return interaction.reply({
            components: [errorEmbed('You don\'t have a stand open yet!', 'You need to open your stand first - run `/start` to get going.')],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    let page = weatherEventMap.get(interaction.user.id) ?? 1;
    const totalPages = EVENT_DETAILS.length;

    if (interaction.customId === 'weather_event_previous') {
        page = Math.max(1, page - 1);
    }

    if (interaction.customId === 'weather_event_next') {
        page = Math.min(totalPages, page + 1);
    }

    weatherEventMap.set(interaction.user.id, page);
    const event = EVENT_DETAILS[page - 1];
    const image = await renderWeatherEvent(event, profile, page, totalPages);
    const attachment = new AttachmentBuilder(image, { name: `${event.id}.png` });

    const previousPage = new ButtonBuilder()
        .setCustomId('weather_event_previous')
        .setEmoji(config.emojis.misc.left_arrow)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1);

    const eventPage = new ButtonBuilder()
        .setCustomId('weather_event_page')
        .setLabel(`${page} / ${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextPage = new ButtonBuilder()
        .setCustomId('weather_event_next')
        .setEmoji(config.emojis.misc.right_arrow)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === totalPages);

    const row = new ActionRowBuilder().addComponents(previousPage, eventPage, nextPage);
    await interaction.update({ files: [attachment], components: [row] });
    return true;
}