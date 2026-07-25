import { MessageFlags } from 'discord.js';
import PlayerProfile from '../models/player.js';
import { errorEmbed, successEmbed } from '../utils/embed.js';
import { rollRandomIngredients, applyIngredientGains, applyStorageExpansion, applyRecipeTicket } from './premiumRedeem.js';
import { getIngredientEmoji, getRecipeEmoji } from '../helpers/emojiLookup.js';

const CRATE_INGREDIENT_COUNT = 4;
const GIFT_INGREDIENT_COUNT = 3;

export async function redeemIngredientCrate(interaction, profile, field) {
    const gains = rollRandomIngredients(CRATE_INGREDIENT_COUNT);
    const results = applyIngredientGains(profile, gains);

    profile.premiumBonuses[field] -= 1;
    await profile.save();

    const lines = results.map((r) => {
        const emoji = getIngredientEmoji(r.key);
        return r.overflow > 0 ? `+${r.added} ${emoji} (${r.overflow} lost, stock full)` : `+${r.added} ${emoji}`;
    });

    return interaction.editReply({
        components: [successEmbed('Ingredient crate opened!', lines.join('\n'))],
        flags: MessageFlags.IsComponentsV2,
    });
}

export async function redeemStorageExpansion(interaction, profile, field) {
    const result = applyStorageExpansion(profile);

    profile.premiumBonuses[field] -= 1;
    await profile.save();

    const emoji = result.kind === 'drink' ? getRecipeEmoji(result.key) : getIngredientEmoji(result.key);

    return interaction.editReply({
        components: [successEmbed('Storage expanded!', `Your ${emoji} capacity permanently increased by \`${result.amount}\` (now \`${result.newCapacity}\`).`)],
        flags: MessageFlags.IsComponentsV2,
    });
}

export async function redeemGiftToken(interaction, profile, field) {
    const target = interaction.options.getUser('target');

    if (!target) {
        return interaction.editReply({
            components: [errorEmbed('Missing recipient', 'Use the `target` option to pick who receives the gift.')],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    if (target.id === interaction.user.id) {
        return interaction.editReply({
            components: [errorEmbed('Nice try!', 'You can\'t gift ingredients to yourself, try redeeming an **Ingredient Crate** instead.')],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    if (target.bot) {
        return interaction.editReply({
            components: [errorEmbed('Invalid recipient', 'You can\'t gift ingredients to a bot.')],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    const targetProfile = await PlayerProfile.findOne({ discordId: target.id });
    if (!targetProfile) {
        return interaction.editReply({
            components: [errorEmbed('Recipient not found', `${target.username} doesn't have a stand yet!`)],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    const gains = rollRandomIngredients(GIFT_INGREDIENT_COUNT);
    const results = applyIngredientGains(targetProfile, gains);

    profile.premiumBonuses[field] -= 1;
    await profile.save();
    await targetProfile.save();

    const lines = results.map((r) => {
        const emoji = getIngredientEmoji(r.key);
        return r.overflow > 0 ? `+${r.added} ${emoji} (${r.overflow} lost, their stock full)` : `+${r.added} ${emoji}`;
    });

    return interaction.editReply({
        components: [successEmbed(`Gift sent to ${target.username}!`, lines.join('\n'))],
        flags: MessageFlags.IsComponentsV2,
    });
}

export async function redeemRecipeTicket(interaction, profile, field) {
    const recipeId = interaction.options.getString('recipe');

    if (!recipeId) {
        return interaction.editReply({
            components: [errorEmbed('Missing recipe', 'Use the `recipe` option to pick one of your unlocked recipes.')],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    const result = applyRecipeTicket(profile, recipeId);
    if (!result) {
        return interaction.editReply({
            components: [errorEmbed('Invalid recipe', 'You don\'t own that recipe — pick one from the autocomplete list.')],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    profile.premiumBonuses[field] -= 1;
    await profile.save();

    const emoji = getRecipeEmoji(result.recipeId);
    const message = result.overflow > 0 ? `+${result.added} ${emoji} ready to serve (${result.overflow} lost, stock full)` : `+${result.added} ${emoji} ready to serve`;

    return interaction.editReply({
        components: [successEmbed('Recipe ticket used!', message)],
        flags: MessageFlags.IsComponentsV2,
    });
}