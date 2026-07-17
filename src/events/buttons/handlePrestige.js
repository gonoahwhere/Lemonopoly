import { MessageFlags } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { errorEmbed, successEmbed } from '../../utils/embed.js';
import { formatNumber } from '../../helpers/renderHelper.js';
import config from '../../../config.js';
import { UPGRADE_STATS, isPrestigeReady, PRESTIGE_STARTING_CASH, PRESTIGE_STARTING_LEVEL, prestigeIncomeMultiplier, getStorageCapacity } from '../../data/upgrades.js';

const statEmoji = (stat) => config.emojis.stand?.[stat] ?? '';
const prestigeMap = new Map();

export default async function handlePrestige(interaction) {
    if (!interaction.customId.startsWith('prestige_')) return;

    if (interaction.user.id !== interaction.message.interaction?.user.id) {
        return interaction.reply({ content: `${config.emojis.misc.disabled} Only the original user can interact with this.`, flags: MessageFlags.Ephemeral });
    }

    if (interaction.customId === 'prestige_cancel') {
        return interaction.update({
            components: [errorEmbed('Prestige cancelled', 'Nothing was changed.')],
            attachments: [],
            files: [],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    if (interaction.customId !== 'prestige_confirm') return;

    const fresh = await PlayerProfile.findOne({ discordId: interaction.user.id });

    if (!fresh || !isPrestigeReady(fresh)) {
        return interaction.update({
            components: [errorEmbed('Prestige failed', 'Your requirements are no longer met. Nothing was changed.')],
            attachments: [],
            files: [],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    const newLevel = (fresh.prestige?.level ?? 0) + 1;

    fresh.prestige.level = newLevel;
    fresh.prestige.lastPrestigeAt = new Date();
    fresh.prestige.lifetimeMultiplier.income = prestigeIncomeMultiplier(newLevel);

    for (const stat of UPGRADE_STATS) {
        fresh.upgrades[stat].level = 0;
        fresh.upgrades[stat].purchasedAt = new Date();
    }

    const capacity = getStorageCapacity(fresh);

    for (const item of fresh.ingredients) {
        item.capacity = capacity;
        if (item.quantity > capacity) item.quantity = capacity;
    }

    for (const drink of fresh.drinks) {
        drink.capacity = capacity;
        if (drink.quantity > capacity) drink.quantity = capacity;
    }

    fresh.stand.level = PRESTIGE_STARTING_LEVEL;
    fresh.economy.cash = PRESTIGE_STARTING_CASH;

    await fresh.save();

    return interaction.update({
        components: [
            successEmbed(
                'Prestige complete!',
                [
                    `Welcome to **Prestige ${newLevel}**! ${statEmoji('prestige')}`,
                    '',
                    `• All four upgrades reset to level 0 (ceilings raised to Prestige ${newLevel})`,
                    `• Stand level reset to **${PRESTIGE_STARTING_LEVEL}**`,
                    `• Storage trimmed to **${capacity}**`,
                    `• Cash set to **$${formatNumber(PRESTIGE_STARTING_CASH)}**`,
                    '',
                    'Time to build it all back up — stronger this time. Head to `/upgrade view`.',
                ].join('\n')
            ),
        ],
        attachments: [],
        files: [],
        flags: MessageFlags.IsComponentsV2,
    });
    return true;
}