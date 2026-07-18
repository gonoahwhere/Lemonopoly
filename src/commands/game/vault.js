import { SlashCommandBuilder, MessageFlags, AttachmentBuilder } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { errorEmbed, warningEmbed, successEmbed } from '../../utils/embed.js';
import { renderPremiumInventory } from '../../renders/renderPremiumInventory.js';
import { MONTHLY_CLAIMS } from '../../data/passBenefits.js';
import { CLAIM_ID_TO_FIELD } from '../util/premium-claim.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('the-vault')
        .setDescription('View redeemable items you have accumulated through your premium pass monthlies.')
        .addSubcommand((sub) => sub.setName('view').setDescription('Take a look at the items banked in your vault!'))
        .addSubcommand((sub) => sub
            .setName('redeem')
            .setDescription('Redeem one of your items for additional perks/bonuses!')
            .addStringOption((option) => option
                .setName('item')
                .setDescription('The item to redeem')
                .setRequired(true)
                .setAutocomplete(true))
        ),
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused()?.toLowerCase() ?? '';
        const profile = interaction.playerProfile ?? await PlayerProfile.findOne({ userId: interaction.user.id });
        const bonuses = profile?.premiumBonuses ?? {};

        const choices = MONTHLY_CLAIMS
            .filter((claim) => CLAIM_ID_TO_FIELD[claim.id])
            .map((claim) => ({
                claim,
                quantity: bonuses[CLAIM_ID_TO_FIELD[claim.id]] ?? 0,
            }))
            .filter((entry) => entry.quantity > 0)
            .filter((entry) => entry.claim.name.toLowerCase().includes(focused) || entry.claim.id.toLowerCase().includes(focused))
            .slice(0, 25)
            .map((entry) => ({
                name: `${entry.claim.name} (x${entry.quantity})`,
                value: entry.claim.id,
            }));

        return interaction.respond(choices);
    },
    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();

        const profile = interaction.playerProfile;

        if (!profile.entitlements?.premium) {
            return interaction.editReply({
                components: [errorEmbed('Premium pass required!', 'The vault is a premium perk. Use `/premium-perks` to learn more.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        if (subcommand === 'view') {
            const buffer = await renderPremiumInventory(profile);
            const attachment = new AttachmentBuilder(buffer, { name: 'the-vault.png' });
            return interaction.editReply({ files: [attachment] });
        }

        if (subcommand === 'redeem') {
            return interaction.editReply({
                components: [warningEmbed('This command is unfinished!', 'Come back later when this feature is complete.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }
    }
}

/*
async function applyRedeemEffect(claimId, profile) {
    switch (claimId) {
        // TODO: wire to wherever your spendable currency actually lives
        // e.g. profile.economy.tokens += SOME_VALUE;
        case 'premium_tokens':
            return 'Tokens have been added to your balance.';

        // TODO: hook into utils/recipeMastery.js if tickets feed mastery progress
        case 'recipe_tickets':
            return 'A recipe ticket has been applied.';

        // TODO: grant a randomized/fixed ingredient bundle to profile.inventory
        case 'ingredient_crate':
            return 'An ingredient crate has been opened into your inventory.';

        // TODO: profile.stand.storageCapacity += SOME_VALUE;
        case 'storage_expansion_token':
            return 'Your stand storage capacity has increased.';

        case 'free_stand_repair':
        // TODO: profile.stand.durability = profile.stand.maxDurability;
            return 'Your stand has been fully repaired.';

        // TODO: grant a free staff hire, bypassing cost
        case 'free_staff_contract':
            return 'A free staff contract has been issued.';
        
            // TODO: profile.giftTokens += SOME_VALUE;
        case 'gift_token_bundle':
            return 'Gift tokens have been added to your account.';

        default:
            return 'Item redeemed.';
    }
}

            const claimId = interaction.options.getString('item', true);
            const claim = MONTHLY_CLAIMS.find((c) => c.id === claimId);
            const field = CLAIM_ID_TO_FIELD[claimId];

            if (!claim || !field) {
                return interaction.editReply({
                    components: [errorEmbed('Unknown item', 'That item doesn\'t exist — pick one from the autocomplete list.')],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            const owned = profile?.premiumBonuses?.[field] ?? 0;

            if (owned <= 0) {
                return interaction.editReply({
                    components: [errorEmbed('Nothing to redeem', `You don't have any **${claim.name}** banked right now.`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            profile.premiumBonuses[field] = owned - 1;
            const resultMessage = await applyRedeemEffect(claimId, profile);
            await profile.save();

            const buffer = await renderPremiumInventory(profile);
            const attachment = new AttachmentBuilder(buffer, { name: 'the-vault.png' });

            return interaction.editReply({
                components: [successEmbed('Premium item redeemed!', `${resultMessage}`)],
                flags: MessageFlags.IsComponentsV2,
            });
*/