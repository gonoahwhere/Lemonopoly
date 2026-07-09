import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { renderStandDisplay } from '../../renders/renderStandDisplay.js';
import { errorEmbed, successEmbed } from '../../utils/embed.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('stand')
        .setDescription('View your current stand.')
        .addSubcommand((sub) => sub.setName('view').setDescription('View how well your stand is doing.'))
        .addSubcommand((sub) => sub
            .setName('rename')
            .setDescription('Give your stand a new name.')
            .addStringOption((opt) => opt
                .setName('name')
                .setDescription('The name you want your stand to be.')
                .setRequired(true)
                .setMinLength(4)
                .setMaxLength(32)
            )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply();
        const profile = interaction.playerProfile;

        if (subcommand === 'view') {
            const buffer = await renderStandDisplay(profile);
            await interaction.editReply({ files: [{ attachment: buffer, name: 'stand.png' }] });
        }

        if (subcommand === 'rename') {
            const rawName = interaction.options.getString('name');
            const standName = rawName.trim().replace(/\s+/g, ' ');

            if (standName.length < 4 || standName.length > 32) {
                return interaction.editReply({
                    components: [errorEmbed('Invalid length provided!', 'Your stand name needs to be between **4** and **32** characters.')],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const oldName = profile.stand.name;
            profile.stand.name = standName;
            await profile.save();

            return interaction.editReply({
                components: [successEmbed('Stand name updated!', `Your stand has been renamed from **${oldName}** to **${standName}**.`)],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
}