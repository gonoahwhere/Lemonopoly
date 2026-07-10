import { SlashCommandBuilder, MessageFlags, AttachmentBuilder } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { errorEmbed } from '../../utils/embed.js';
import { renderMonthlyClaim } from '../../renders/renderPremiumMonthly.js';
import { MONTHLY_CLAIMS } from '../../data/passBenefits.js';

function isSameMonth(date, now) {
    return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth();
}

function daysUntilNextMonth(now) {
    const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const diffMs = nextMonthStart - now;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export const CLAIM_ID_TO_FIELD = {
    premium_tokens: 'premiumTokens',
    recipe_tickets: 'recipeTickets',
    ingredient_crate: 'ingredientCrate',
    storage_expansion_token: 'storageExpansion',
    free_stand_repair: 'standRepair',
    free_staff_contract: 'freeStaff',
    gift_token_bundle: 'giftToken',
};

function grantMonthlyRewards(profile) {
    for (const reward of MONTHLY_CLAIMS) {
        const field = CLAIM_ID_TO_FIELD[reward.id];
        if (!field) continue;
        profile.premiumBonuses[field] += reward.quantity;
    }

    const levelGain = Math.floor(Math.random() * 4) + 1;
    profile.stand.level += levelGain;

    return { levelGain };
}

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Util',
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
        
        const now = new Date();
        const lastClaimedAt = profile?.premiumBonuses?.lastClaimedAt ? new Date(profile.premiumBonuses.lastClaimedAt) : null;
        const alreadyClaimedThisMonth = lastClaimedAt ? isSameMonth(lastClaimedAt, now) : false;
        const daysUntilClaim = alreadyClaimedThisMonth ? daysUntilNextMonth(now) : 0;

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

            const { levelGain } = grantMonthlyRewards(profile);
            profile.premiumBonuses.lastClaimedAt = now;
            await profile.save();

            const buffer = await renderMonthlyClaim(profile, { hasPremium: true, mode: 'claimed', levelGain });
            const attachment = new AttachmentBuilder(buffer, { name: 'premium-claim.png' });
            return interaction.editReply({ files: [attachment ]});
        }
    }
}