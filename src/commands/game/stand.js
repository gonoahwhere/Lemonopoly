import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { renderStandDisplay } from '../../renders/renderStandDisplay.js';
import { errorEmbed, successEmbed } from '../../utils/embed.js';
import { advanceEvents } from '../../helpers/weatherEvents.js';
import { formatNumber } from '../../helpers/renderHelper.js';
import { calculateRepairCost, repairStandFully, FULL_HEALTH } from '../../helpers/standRepair.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('stand')
        .setDescription('View your current stand.')
        .addSubcommand((sub) => sub.setName('view').setDescription('View how well your stand is doing.'))
        .addSubcommand((sub) => sub
            .setName('rename')
            .setDescription('Give your stand a new name.')
            .addStringOption((opt) => opt
                .setName('name')
                .setDescription('The name you want your stand to be.')
                .setRequired(true)
                .setMinLength(4)
                .setMaxLength(32)
            )
        )
        .addSubcommand((sub) => sub
            .setName('repair')
            .setDescription('Repair your stand back to full health.')
            .addStringOption((opt) => opt
                .setName('method')
                .setDescription('How to pay for the repair')
                .setRequired(true)
                .addChoices(
                    { name: 'Cash', value: 'cash' },
                    { name: 'Repair Token', value: 'token' },
                )
            )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply();
        const profile = interaction.playerProfile;

        if (subcommand === 'view') {
            const { active, next, changed, expired } = advanceEvents(profile.events);

            if (changed) {
                for (const ev of expired) {
                    profile.events.history.push({ key: ev.key, outcome: ev.optionId });
                }

                profile.events.active = active;
                profile.events.next = next;
                await profile.save();
            }

            const buffer = await renderStandDisplay(profile);
            await interaction.editReply({ files: [{ attachment: buffer, name: 'stand.png' }] });
        }

        if (subcommand === 'rename') {
            const rawName = interaction.options.getString('name');
            const standName = rawName.trim().replace(/\s+/g, ' ');

            if (standName.length < 4 || standName.length > 32) {
                return interaction.editReply({
                    components: [errorEmbed('Invalid length provided!', 'Your stand name needs to be between **4** and **32** characters.')],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const oldName = profile.stand.name;
            profile.stand.name = standName;
            await profile.save();

            return interaction.editReply({
                components: [successEmbed('Stand name updated!', `Your stand has been renamed from **${oldName}** to **${standName}**.`)],
                flags: MessageFlags.IsComponentsV2
            });
        }

        if (subcommand === 'repair') {
            const method = interaction.options.getString('method', true);

            if (profile.stand.health >= FULL_HEALTH) {
                return interaction.editReply({
                    components: [errorEmbed('Already at full health!', 'Your stand doesn\'t need repairing right now.')],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            if (method === 'cash') {
                const cost = calculateRepairCost(profile);

                if (profile.economy.cash < cost) {
                    return interaction.editReply({
                        components: [errorEmbed('Not enough cash!', `Repairing your stand costs **$${formatNumber(cost)}**, but you only have **$${formatNumber(profile.economy.cash)}**.`)],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                profile.economy.cash -= cost;
                profile.economy.lifetimeSpent.cash += cost;
                repairStandFully(profile);
                await profile.save();

                return interaction.editReply({
                    components: [successEmbed('Stand repaired!', `You paid **$${formatNumber(cost)}** to restore your stand to **100%** health.`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            if (method === 'token') {
                const tokens = profile.premiumBonuses?.standRepair ?? 0;

                if (tokens <= 0) {
                    return interaction.editReply({
                        components: [errorEmbed('No repair tokens!', 'You don\'t have any **Stand Repair Tokens** banked — check `/the-vault view`.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                profile.premiumBonuses.standRepair -= 1;
                repairStandFully(profile);
                await profile.save();

                return interaction.editReply({
                    components: [successEmbed('Stand repaired!', 'You used a **Stand Repair Token** to restore your stand to **100%** health.')],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
        }
    }
}