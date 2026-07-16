import { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import config from '../../../config.js';
import { formatNumber } from '../../helpers/renderHelper.js';
import { renderPrestige } from '../../renders/renderPrestige.js';
import {
    UPGRADE_STATS,
    isPrestigeReady,
    PRESTIGE_STARTING_CASH,
    PRESTIGE_STARTING_LEVEL,
    prestigeIncomeMultiplier,
    getStorageCapacity,
} from '../../data/upgrades.js';

const statEmoji = (stat) => config.emojis.stand?.[stat] ?? '';
const enabled = () => config.emojis.misc.enabled;
const disabled = () => config.emojis.misc.disabled;

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
            return interaction.editReply({ files: [attachment] });
        }

        const nextPrestige = (profile.prestige?.level ?? 0) + 1;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prestige_confirm').setLabel('Prestige').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('prestige_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary),
        );

        const warning = `**Ready to move up to Prestige ${nextPrestige}.** This resets all four upgrades and your stand level, and sets your cash to **$${formatNumber(PRESTIGE_STARTING_CASH)}**. Your drinks and ingredients are trimmed to your reset storage; recipes, mastery, and coins are kept.\nPress **Prestige** to confirm.`;

        await interaction.editReply({ content: warning, files: [attachment], components: [row] });
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
                content: `${config.emojis.misc.warning} **Prestige cancelled** — you took too long to confirm. Nothing was changed.`,
                components: [],
                attachments: [],
            });
        }

        if (choice.customId === 'prestige_cancel') {
            return choice.update({
                content: `${disabled()} **Prestige cancelled** — nothing was changed.`,
                components: [],
                attachments: [],
            });
        }

        const fresh = await PlayerProfile.findOne({ discordId: interaction.user.id });
        if (!fresh || !isPrestigeReady(fresh)) {
            return choice.update({
                content: `${disabled()} **Prestige failed** — your requirements are no longer met. Nothing was changed.`,
                components: [],
                attachments: [],
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

        const successContent = [
            `## ${enabled()} Prestige complete!`,
            `Welcome to **Prestige ${newLevel}**! ${statEmoji('prestige')}`,
            '',
            `> All four upgrades reset to level 0 (ceilings raised to Prestige ${newLevel})`,
            `> Stand level reset to ${PRESTIGE_STARTING_LEVEL}`,
            `> Storage trimmed to **${capacity}**`,
            `> Cash set to **$${formatNumber(PRESTIGE_STARTING_CASH)}**`,
            '',
            'Time to build it all back up — stronger this time. Head to `/upgrade`.',
        ].join('\n');

        return choice.update({
            content: successContent,
            components: [],
            attachments: [],
        });
    },
};
