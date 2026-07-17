import { SlashCommandBuilder, MessageFlags, AttachmentBuilder } from 'discord.js';
import { errorEmbed, successEmbed } from '../../utils/embed.js';
import config from '../../../config.js';
import { formatNumber } from '../../helpers/renderHelper.js';
import { renderUpgrades } from '../../renders/renderUpgrades.js';
import { UPGRADE_LEVEL_CAP, upgradeCostRange, formatUpgradeEffect } from '../../data/upgrades.js';

const STAT_LABELS = {
    speed: 'Speed',
    storage: 'Storage',
    appeal: 'Appeal',
    resilience: 'Resilience',
};

const cash = () => config.emojis.currency.cash;

export default {
    devOnly: false,
    cooldown: 3,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('upgrade')
        .setDescription('View and purchase stand upgrades.')
        .addSubcommand((sub) => sub
            .setName('view')
            .setDescription('View your upgrades, effects, and next costs.')
        )
        .addSubcommand((sub) => sub
            .setName('buy')
            .setDescription('Purchase levels for an upgrade.')
            .addStringOption((opt) => opt
                .setName('stat')
                .setDescription('Which upgrade to buy.')
                .setRequired(true)
                .addChoices(
                    { name: 'Speed', value: 'speed' },
                    { name: 'Storage', value: 'storage' },
                    { name: 'Appeal', value: 'appeal' },
                    { name: 'Resilience', value: 'resilience' },
                )
            )
            .addIntegerOption((opt) => opt
                .setName('amount')
                .setDescription('How many levels to buy (default 1).')
                .setMinValue(1)
                .setMaxValue(UPGRADE_LEVEL_CAP)
            )
        ),
    async execute(interaction) {
        const profile = interaction.playerProfile;
        const subcommand = interaction.options.getSubcommand();
        const prestige = profile.prestige?.level ?? 0;

        if (subcommand === 'view') {
            await interaction.deferReply();
            const image = await renderUpgrades(profile);
            return interaction.editReply({
                files: [new AttachmentBuilder(image, { name: 'upgrades.png' })],
            });
        }

        // buy
        const stat = interaction.options.getString('stat', true);
        const amount = interaction.options.getInteger('amount') ?? 1;
        const label = STAT_LABELS[stat];

        const track = profile.upgrades[stat] ?? (profile.upgrades[stat] = { level: 0 });
        const level = track.level ?? 0;

        if (level >= UPGRADE_LEVEL_CAP) {
            return interaction.reply({
                components: [errorEmbed('Already maxed!', `Your **${label}** upgrade is already at the level **${UPGRADE_LEVEL_CAP}** cap.`)],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const buying = Math.min(amount, UPGRADE_LEVEL_CAP - level);
        const totalCost = upgradeCostRange(stat, level, buying, prestige);

        if (profile.economy.cash < totalCost) {
            const plural = buying === 1 ? 'level' : 'levels';
            return interaction.reply({
                components: [errorEmbed('Insufficient funds!', `Upgrading **${label}** by **${buying} ${plural}** costs ${cash()} **${formatNumber(totalCost)}**, but you only have ${cash()} **${formatNumber(profile.economy.cash)}**.`)],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        profile.economy.cash -= totalCost;
        profile.economy.lifetimeSpent.cash += totalCost;
        track.level = level + buying;
        track.purchasedAt = new Date();

        await profile.save();

        const reachedMax = track.level >= UPGRADE_LEVEL_CAP ? ' (MAX)' : '';
        const description = `Upgraded **${label}** to **Lv. ${track.level}**${reachedMax} for ${cash()} **${formatNumber(totalCost)}**.\n> Now: ${formatUpgradeEffect(stat, track.level, prestige)}\n\nYou have ${cash()} **${formatNumber(profile.economy.cash)}** left.`;

        return interaction.reply({
            components: [successEmbed('Upgrade purchased!', description)],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};