import { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EVENT_DETAILS } from '../../data/eventKeys.js';
import { renderWeatherEvent } from '../../renders/renderWeatherEvents.js';
import PlayerProfile from '../../models/player.js';
import config from '../../../config.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Util',
    data: new SlashCommandBuilder()
        .setName('weather-events')
        .setDescription('View the possible outcomes for each weather event.'),
    async execute(interaction) {
        await interaction.deferReply();
    
        const viewerProfile = interaction.playerProfile;
        const page = 1;
        const totalPages = EVENT_DETAILS.length;

        const event = EVENT_DETAILS[page - 1]
        const buffer = await renderWeatherEvent(event, viewerProfile, page, totalPages);
        const attachment = new AttachmentBuilder(buffer, { name: `${event.id}.png` });

        const previousPage = new ButtonBuilder()
            .setCustomId('weather_event_previous')
            .setEmoji(config.emojis.misc.left_arrow)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1)
            
        const eventPage = new ButtonBuilder()
            .setCustomId('weather_event_page')
            .setLabel(`${page} / ${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        
        const nextPage = new ButtonBuilder()
            .setCustomId('weather_event_next')
            .setEmoji(config.emojis.misc.right_arrow)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages)

        const row = new ActionRowBuilder().addComponents(previousPage, eventPage, nextPage)
        await interaction.editReply({ files: [attachment ], components: [row] });
    }
}