import { SlashCommandBuilder, MessageFlags, AttachmentBuilder } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { errorEmbed } from '../../utils/embed.js';
import { renderLeaderboard } from '../../renders/renderLeaderboard.js';

const LEADERBOARD_SIZE = 10;

const BOARDS = {
    cash: { label: 'Cash', field: 'economy.cash', prefix: '$', icon: 'cash', accent: '#2E8B39', value: (p) => p.economy?.cash ?? 0 },
    level: { label: 'Level', field: 'stand.level', prefix: '', icon: 'level', accent: '#3B82C4', value: (p) => p.stand?.level ?? 0 },
    prestige: { label: 'Prestige', field: 'prestige.level', prefix: '', icon: 'prestige', accent: '#9B4FD1', value: (p) => p.prestige?.level ?? 0 },
};

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View leaderboards')
        .addSubcommandGroup((group) => group
            .setName('all')
            .setDescription('View the leaderboards accessible to all members.')
            .addSubcommand(sub => sub
                .setName('cash')
                .setDescription('View the top 10 richest players')
            )
            .addSubcommand(sub => sub
                .setName('level')
                .setDescription('View the top 10 highest-level players')
            )
            .addSubcommand(sub => sub
                .setName('prestige')
                .setDescription('View the top 10 most prestigious players')
            )
        )
        .addSubcommandGroup((group) => group
            .setName('premium')
            .setDescription('View the leaderboards accessible to premium members.')
            .addSubcommand(sub => sub
                .setName('cash')
                .setDescription('View the top 10 richest premium players')
            )
            .addSubcommand(sub => sub
                .setName('level')
                .setDescription('View the top 10 highest-level premium players')
            )
            .addSubcommand(sub => sub
                .setName('prestige')
                .setDescription('View the top 10 most prestigious premium players')
            )
        ),

    async execute(interaction) {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const board = BOARDS[subcommand];

        if (group === 'all') {
            await interaction.deferReply();

            const viewerProfile = interaction.playerProfile;
            const viewerValue = viewerProfile ? board.value(viewerProfile) : null;
            const sort = { [board.field]: -1, createdAt: 1, _id: 1 };
            const higherFilter = viewerProfile
                ? {
                    $or: [
                        { [board.field]: { $gt: viewerValue } },
                        { [board.field]: viewerValue, createdAt: { $lt: viewerProfile.createdAt } },
                        { [board.field]: viewerValue, createdAt: viewerProfile.createdAt, _id: { $lt: viewerProfile._id } },
                    ],
                }
                : null;

            const [players, total, higherThanViewer] = await Promise.all([
                PlayerProfile.find().sort(sort).limit(LEADERBOARD_SIZE),
                PlayerProfile.countDocuments(),
                higherFilter ? PlayerProfile.countDocuments(higherFilter) : Promise.resolve(null),
            ]);

            if (players.length === 0) {
                return interaction.editReply({
                    components: [errorEmbed('Nothing here!', 'There are no ranked players yet.')],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const rows = players.map((player, index) => ({
                rank: index + 1,
                name: player.stand?.name ?? player.username,
                value: board.value(player),
                isViewer: player.discordId === interaction.user.id,
                showBadge: Boolean(player.entitlements?.premium && player.settings.visibleLeaderboardBadge),
            }));

            const viewer = viewerProfile ? { rank: higherThanViewer + 1, value: viewerValue } : null;

            const image = await renderLeaderboard({
                label: `${board.label}: Freebie`,
                prefix: board.prefix,
                iconKey: board.icon,
                accent: board.accent,
                total,
                rows,
                viewer,
                viewerProfile
            });
            const attachment = new AttachmentBuilder(image, { name: 'leaderboard.png' });

            return interaction.editReply({ files: [attachment] });
        }

        if (group === 'premium') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const premiumFilter = { 'entitlements.premium': true };
            const viewerProfile = interaction.playerProfile;
            const viewerIsPremium = Boolean(viewerProfile?.entitlements?.premium);

            if (!viewerIsPremium) {
                return interaction.editReply({
                    components: [errorEmbed('Premium pass required!', 'Premium leaderboards are a premium perk. Use `/premium-perks` to learn more.')],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            const viewerValue = viewerProfile && viewerIsPremium ? board.value(viewerProfile) : null;
            const sort = { [board.field]: -1, createdAt: 1, _id: 1 };
            const higherFilter = viewerProfile && viewerIsPremium
                ? {
                    ...premiumFilter,
                    $or: [
                        { [board.field]: { $gt: viewerValue } },
                        { [board.field]: viewerValue, createdAt: { $lt: viewerProfile.createdAt } },
                        { [board.field]: viewerValue, createdAt: viewerProfile.createdAt, _id: { $lt: viewerProfile._id } },
                    ],
                }
                : null;

            const [players, total, higherThanViewer] = await Promise.all([
                PlayerProfile.find(premiumFilter).sort(sort).limit(LEADERBOARD_SIZE),
                PlayerProfile.countDocuments(premiumFilter),
                higherFilter ? PlayerProfile.countDocuments(higherFilter) : Promise.resolve(null),
            ]);

            if (players.length === 0) {
                return interaction.editReply({
                    components: [errorEmbed('Nothing here!', 'There are no ranked premium players yet.')],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const rows = players.map((player, index) => ({
                rank: index + 1,
                name: player.stand?.name ?? player.username,
                value: board.value(player),
                isViewer: player.discordId === interaction.user.id,
            }));

            const viewer = viewerProfile && viewerIsPremium ? { rank: higherThanViewer + 1, value: viewerValue } : null;

            const image = await renderLeaderboard({
                label: `${board.label}: Premium`,
                prefix: board.prefix,
                iconKey: board.icon,
                accent: board.accent,
                total,
                rows,
                viewer,
                viewerProfile
            });
            const attachment = new AttachmentBuilder(image, { name: 'premium-leaderboard.png' });

            return interaction.editReply({ files: [attachment] });
        }
    }
}