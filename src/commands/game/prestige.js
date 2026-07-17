import { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } from 'discord.js';
import { errorEmbed, successEmbed } from '../../utils/embed.js';
import PlayerProfile from '../../models/player.js';
import config from '../../../config.js';
import { formatNumber } from '../../helpers/renderHelper.js';
import { renderPrestige } from '../../renders/renderPrestige.js';
import { UPGRADE_STATS, isPrestigeReady, PRESTIGE_STARTING_CASH, PRESTIGE_STARTING_LEVEL, prestigeIncomeMultiplier, getStorageCapacity } from '../../data/upgrades.js';

const statEmoji = (stat) => config.emojis.stand?.[stat] ?? '';
const enabled = () => config.emojis.misc.enabled;

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('prestige')
        .setDescription('Reset your maxed upgrades for a permanent prestige boost.'),

    async execute(interaction) {
        await interaction.deferReply();

        const profile = interaction.playerProfile;

        const image = await renderPrestige(profile);
        const attachment = new AttachmentBuilder(image, { name: 'prestige.png' });

        if (!isPrestigeReady(profile)) {
            return interaction.editReply({
                files: [attachment],
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prestige_confirm')
                .setEmoji(config.emojis.stand.prestige)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('prestige_cancel')
                .setEmoji(config.emojis.misc.disabled)
                .setStyle(ButtonStyle.Secondary),
        );

        await interaction.editReply({
            files: [attachment],
            components: [row],
        });

        const message = await interaction.fetchReply();

        let choice;
        try {
            choice = await message.awaitMessageComponent({
                filter: (i) => i.user.id === interaction.user.id,
                componentType: ComponentType.Button,
                time: 60_000,
            });
        } catch {
            return interaction.editReply({
                components: [errorEmbed('Prestige cancelled', 'You took too long to confirm. Nothing was changed.')],
                attachments: [],
                files: [],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        if (choice.customId === 'prestige_cancel') {
            return choice.update({
                components: [errorEmbed('Prestige cancelled', 'Nothing was changed.')],
                attachments: [],
                files: [],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const fresh = await PlayerProfile.findOne({ discordId: interaction.user.id });

        if (!fresh || !isPrestigeReady(fresh)) {
            return choice.update({
                components: [
                    errorEmbed('Prestige failed', 'Your requirements are no longer met. Nothing was changed.')],
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

        return choice.update({
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
    },
};