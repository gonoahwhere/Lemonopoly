import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { errorEmbed, warningEmbed, successEmbed } from '../../utils/embed.js';
import { formatNumber } from '../../helpers/renderHelper.js';
import { ensureEventsCurrent } from '../../helpers/eventEffects.js';
import { attemptSell, SELL_FAILURE } from '../../helpers/sellEngine.js';

export default {
    devOnly: false,
    cooldown: 0,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell your active recipe to the customers.'),
    async execute(interaction) {
        const profile = interaction.playerProfile;

        // Auto-sell (premium-only) takes over manual selling entirely while it's on.
        if (profile.settings?.autoServe && profile.entitlements?.premium) {
            return interaction.reply({
                components: [errorEmbed('Auto-sell is running!', 'Auto-sell is enabled, so your stand sells automatically in the background. Turn it off with `/autosell mode:disabled` to sell manually again.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        if (profile.settings?.autoServe && !profile.entitlements?.premium && !profile.settings?.autoServeLapseNoticeShown) {
            try {
                await interaction.reply({
                    components: [warningEmbed('Premium pass expired!', 'Your premium pass expired, so auto-sell has paused. You\'re back to selling manually with `/sell` — re-sub to premium to have it pick back up automatically.')],
                    flags: MessageFlags.IsComponentsV2,
                });
                profile.settings.autoServeLapseNoticeShown = true;
                profile.settings.autoServe = false;
                await profile.save();
            } catch (err) {
                logger.error('[sell] Failed to send/save lapse notice:', err);
            }
            return;
        }

        const { active: liveEvent } = await ensureEventsCurrent(profile);
        const result = attemptSell(profile, liveEvent);

        if (!result.ok) {
            switch (result.reason) {
                case SELL_FAILURE.NO_ACTIVE_RECIPE:
                    return interaction.reply({
                        components: [errorEmbed('No active recipe!', 'You don\'t have an active recipe set. Set one, then mix some up with `/mix`.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
                case SELL_FAILURE.RECIPE_NOT_FOUND:
                    return interaction.reply({
                        components: [errorEmbed('Drink not found!', 'Your active recipe couldn\'t be found. Please try again later.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
                case SELL_FAILURE.PREMIUM_REQUIRED:
                    return interaction.reply({
                        components: [errorEmbed('Premium required!', `**${result.recipe.name}** is a premium recipe. Your premium pass has expired, so you can't sell this one until it's renewed. Set a different active recipe with \`/my-recipes\` in the meantime.`)],
                        flags: MessageFlags.IsComponentsV2,
                    });
                case SELL_FAILURE.OUT_OF_STOCK:
                    return interaction.reply({
                        components: [errorEmbed('Nothing to sell!', `You're out of **${result.recipe.name}** — make more with \`/mix\`.`)],
                        flags: MessageFlags.IsComponentsV2,
                    });
                case SELL_FAILURE.ON_COOLDOWN:
                    return interaction.reply({
                        components: [warningEmbed('Hold on!', `Your next customer isn't ready yet — you can sell again in **${(result.remainingMs / 1000).toFixed(1)}s**.`)],
                        flags: MessageFlags.IsComponentsV2,
                    });
                case SELL_FAILURE.SALE_FAILED:
                    await profile.save();
                    return interaction.reply({
                        components: [warningEmbed('Sale fell through!', `The weather scared off your customer before they could buy any **${result.recipe.name}s**.`)],
                        flags: MessageFlags.IsComponentsV2,
                    });
                default:
                    return interaction.reply({
                        components: [errorEmbed('Something went wrong!', 'Please try again later.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
            }
        }

        await profile.save();

        const { recipe, cupsSold, earnings, tip, doubled, bonusCup, eventCustomer } = result;
        const title = eventCustomer ? `A ${eventCustomer.name} stopped by!` : (bonusCup ? 'Bonus sale!' : (doubled ? 'Double sale!' : 'Drink sold!'));
        let detail = eventCustomer ? `A **${eventCustomer.name}** showed up — they ${eventCustomer.job}.\n` : '';
        detail += `You sold **${cupsSold}× ${recipe.name}** for **$${formatNumber(earnings)}**`;
        if (tip > 0) detail += ` **+$${formatNumber(tip)} tip**`;
        detail += `.\nYou now have **$${formatNumber(profile.economy.cash)}**.`;

        return interaction.reply({
            components: [successEmbed(title, detail)],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
