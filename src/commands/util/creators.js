import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { CREATOR_DETAILS } from '../../data/creatorKeys.js';
import { renderCreators } from '../../renders/renderCreators.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Util',
    data: new SlashCommandBuilder()
        .setName('creators')
        .setDescription('View the creators behind my creation!'),

    async execute(interaction) {
        await interaction.deferReply();

        const creators = await Promise.all(
            CREATOR_DETAILS.map(async (creator) => {
                let avatarUrl = null;

                try {
                    const user = await interaction.client.users.fetch(creator.id);
                    avatarUrl = user.displayAvatarURL({ extension: 'png', size: 128 });
                } catch (_) {
                    // User couldn't be fetched - fallback silently
                }

                return { ...creator, avatarUrl };
            })
        );

        const viewerProfile = interaction.playerProfile;
        const buffer = await renderCreators({ label: 'Meet the Team', creators, viewerProfile });

        const attachment = new AttachmentBuilder(buffer, { name: 'creators.png' });
        await interaction.editReply({ files: [attachment] });
    },
};