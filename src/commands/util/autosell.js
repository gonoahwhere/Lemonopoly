import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { errorEmbed, successEmbed } from '../../utils/embed.js';

export default {
    devOnly: false,
    cooldown: 0,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('autosell')
        .setDescription('Enable or disable automatic selling (premium only).')
        .addStringOption((option) =>
            option
                .setName('mode')
                .setDescription('Turn auto-sell on or off')
                .setRequired(true)
                .addChoices(
                    { name: 'enabled', value: 'enabled' },
                    { name: 'disabled', value: 'disabled' },
                )
        ),
    async execute(interaction) {
        const profile = interaction.playerProfile;
        const mode = interaction.options.getString('mode', true);
        const enabling = mode === 'enabled';

        if (enabling && !profile.entitlements?.premium) {
            return interaction.reply({
                components: [errorEmbed('Premium required!', 'Auto-sell is a premium perk. Grab a premium pass to have your stand sell drinks automatically in the background.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        if (profile.settings.autoServe === enabling) {
            return interaction.reply({
                components: [successEmbed('No change', `Auto-sell is already **${mode}**.`)],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        profile.settings.autoServe = enabling;
        await profile.save();

        const detail = enabling ? 'Your stand will now sell your active recipe automatically whenever the cooldown is up. Manual `/sell` is disabled while this is on.' : 'Auto-sell is off. Manual `/sell` is available again — but you\'ll still need to wait out any cooldown left from your last sale.';

        return interaction.reply({
            components: [successEmbed(`Auto-sell ${mode}`, detail)],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}