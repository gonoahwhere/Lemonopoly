import { SlashCommandBuilder, MessageFlags, AttachmentBuilder } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { errorEmbed } from '../../utils/embed.js';
import { renderMonthlyClaim } from '../../renders/renderPremiumMonthly.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('lemon-illuminati')
        .setDescription('View and earn monthly rewards for having the premium pass.')
        .addSubcommand((sub) => sub.setName('view').setDescription('Take a look at the monthly rewards you could earn!'))
        .addSubcommand((sub) => sub
            .setName('claim')
            .setDescription('Take a look at the monthly rewards you could earn!')
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();

        const profile = interaction.playerProfile;
        const userIsPremium = Boolean(profile?.entitlements?.premium);
        let daysUntilClaim = 30;

        if (subcommand === 'view') {            
            if (!userIsPremium) {
                const buffer = await renderMonthlyClaim(profile, { hasPremium: false });
                const attachment = new AttachmentBuilder(buffer, { name: 'premium-view.png' });
                return interaction.editReply({ files: [attachment ]});
            }

            const buffer = await renderMonthlyClaim(profile, { hasPremium: true, mode: 'view', daysUntilClaim });
            const attachment = new AttachmentBuilder(buffer, { name: 'premium-view.png' });
            return interaction.editReply({ files: [attachment ]});
        }

        if (subcommand === 'claim') {
            if (!userIsPremium) {
                return interaction.editReply({
                    components: [errorEmbed('Premium pass required!', 'Monthly rewards are a premium perk. Use `/premium-perks` to learn more.')],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            if (daysUntilClaim !== 0) {
                return interaction.editReply({
                    components: [errorEmbed('Monthly bonus not ready!', `You have \`${daysUntilClaim}\` ${daysUntilClaim === 1 ? 'day' : 'days'} till you can claim your monthly reward again.`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            const buffer = await renderMonthlyClaim(profile, { hasPremium: true, mode: 'claimed' });
            const attachment = new AttachmentBuilder(buffer, { name: 'premium-claim.png' });
            return interaction.editReply({ files: [attachment ]});
        }
    }
}