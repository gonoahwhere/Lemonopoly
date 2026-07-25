import { SlashCommandBuilder, MessageFlags, AttachmentBuilder } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { errorEmbed, warningEmbed } from '../../utils/embed.js';
import { renderPremiumInventory } from '../../renders/renderPremiumInventory.js';
import { MONTHLY_CLAIMS } from '../../data/passBenefits.js';
import { RECIPES } from '../../data/recipes.js';
import { CLAIM_ID_TO_FIELD } from '../util/premium-claim.js';
import { redeemIngredientCrate, redeemStorageExpansion, redeemGiftToken, redeemRecipeTicket, redeemFreeStaffContract, redeemStandRepair } from '../../data/redeemHandlers.js';

const REDEEM_HANDLERS = {
    ingredient_crate: redeemIngredientCrate,
    storage_expansion_token: redeemStorageExpansion,
    gift_token_bundle: redeemGiftToken,
    recipe_tickets: redeemRecipeTicket,
    free_staff_contract: redeemFreeStaffContract,
    free_stand_repair: redeemStandRepair,
};

const NON_REDEEMABLE_CLAIMS = new Set(['premium_tokens']);

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
            .addStringOption((option) => option
                .setName('recipe')
                .setDescription('Required for Recipe Tickets — the owned recipe to brew')
                .setRequired(false)
                .setAutocomplete(true))
            .addUserOption((option) => option
                .setName('target')
                .setDescription('Required for Gift Token Bundle — who receives the ingredients')
                .setRequired(false))
        ),
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused(true);
        const profile = interaction.playerProfile ?? await PlayerProfile.findOne({ discordId: interaction.user.id });

        if (focused.name === 'recipe') {
            const query = focused.value?.toLowerCase() ?? '';
            const unlocked = profile?.recipes?.unlocked ?? [];

            const choices = unlocked
                .map((u) => RECIPES.find((r) => r.id === u.key))
                .filter(Boolean)
                .filter((r) => r.name.toLowerCase().includes(query) || r.id.toLowerCase().includes(query))
                .slice(0, 25)
                .map((r) => ({ name: r.name, value: r.id }));

            return interaction.respond(choices);
        }

        const query = focused.value?.toLowerCase() ?? '';
        const bonuses = profile?.premiumBonuses ?? {};

        const choices = MONTHLY_CLAIMS
            .filter((claim) => CLAIM_ID_TO_FIELD[claim.id])
            .filter((claim) => !NON_REDEEMABLE_CLAIMS.has(claim.id))
            .map((claim) => ({ claim, quantity: bonuses[CLAIM_ID_TO_FIELD[claim.id]] ?? 0 }))
            .filter((entry) => entry.quantity > 0)
            .filter((entry) => entry.claim.name.toLowerCase().includes(query) || entry.claim.id.toLowerCase().includes(query))
            .slice(0, 25)
            .map((entry) => ({ name: `${entry.claim.name} (x${entry.quantity})`, value: entry.claim.id }));

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
            const claimId = interaction.options.getString('item', true);
            const claim = MONTHLY_CLAIMS.find((c) => c.id === claimId);
            const field = CLAIM_ID_TO_FIELD[claimId];

            if (!claim || !field || NON_REDEEMABLE_CLAIMS.has(claimId)) {
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

            const handler = REDEEM_HANDLERS[claimId];
            if (!handler) {
                return interaction.editReply({
                    components: [warningEmbed('This item can\'t be redeemed yet!', 'Come back later when this feature is complete.')],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            return handler(interaction, profile, field);
        }
    }
}