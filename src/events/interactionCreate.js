import { Collection, InteractionType, PermissionFlagsBits, MessageFlags } from "discord.js";
import { errorEmbed } from "../utils/embed.js";
import logger from "../utils/logger.js";
import config from "../../config.js";
import PlayerProfile from "../models/player.js";

const PROFILE_EXEMPT_COMMANDS = ['start', 'help', 'about'];

export default {
    name: "interactionCreate",
    async execute(interaction, client) {
        // Permission Guard
        if (interaction.guild) {
            const botMember = interaction.guild.members.me;
            const channelPermissions = interaction.channel?.permissionsFor(botMember);

            const requiredPermissions = [
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.EmbedLinks
            ];

            const permissionNames = {
                [PermissionFlagsBits.SendMessages]: "Send Messages",
                [PermissionFlagsBits.AttachFiles]: "Attach Files",
                [PermissionFlagsBits.EmbedLinks]: "Embed Links"
            };

            const missingPermissions = requiredPermissions.filter(perm => !channelPermissions?.has(perm));

            if (missingPermissions.length > 0) {
                logger.warn(`Missing permissions in #${interaction.channel?.name} (${interaction.guild.name}): ${missingPermissions.map(perm => permissionNames[perm]).join(", ")}`);
                if (interaction.isRepliable?.() && !interaction.replied && !interaction.deferred) {
                    return interaction.reply({
                        components: [errorEmbed("I seem to be lacking permissions I need!", `I need the following permissions in this channel: ${missingPermissions.map(perm => `\`${permissionNames[perm]}\``).join(", ")}.`)],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }
                return;
            }
        }

        // Chat Input Commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                logger.warn(`Unknown command received: /${interaction.commandName}`);
                return interaction.reply({
                    components: [errorEmbed("I don't know that command", `\`/${interaction.commandName}\` is not in my database.`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            if (!PROFILE_EXEMPT_COMMANDS.includes(command.data.name)) {
                let profile;
                try {
                    profile = await PlayerProfile.findOne({ discordId: interaction.user.id });
                } catch (err) {
                    logger.error(`Failed to look up profile for ${interaction.user.tag}: ${err.message}`);
                    return interaction.reply({
                        components: [errorEmbed('Something went wrong', 'Couldn\'t check your stand right now. Please try again shortly.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                if (!profile) {
                    return interaction.reply({
                        components: [errorEmbed('You don\'t have a stand open yet!', 'You need to open your stand first - run `/start` to get going.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                interaction.playerProfile = profile;
            }
            // Cooldown Check
            if (!client.cooldowns.has(command.data.name)) {
                client.cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = client.cooldowns.get(command.data.name);
            const cooldownMs = (command.cooldown ?? config.defaultCooldown) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expiry = timestamps.get(interaction.user.id) + cooldownMs;

                if (now < expiry) {
                    const remaining = ((expiry - now) / 1000).toFixed(1);
                    return interaction.reply({
                        components: [warningEmbed("Hold on!", `You still have **${remaining}s** before you can use \`/${command.data.name}\` again.`)],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownMs);

            // Execute Command
            try {
                // Dev Guard
                if (command.devOnly && config.owners.every(owner => owner.id !== interaction.user.id)) {
                    return interaction.reply({
                        components: [errorEmbed("Developer Only", "You do not have permission to use this command.")],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                await command.execute(interaction, client);
            } catch (err) {
                //logger.error(`Error executing /${interaction.commandName}: ${err.stack}`);
                logger.error(`Error executing /${interaction.commandName}: ${err.message}`);

                const payload = {
                    components: [errorEmbed("Something went wrong", "An unexpected error occurred while executing that command. Please try again later.")],
                    flags: MessageFlags.IsComponentsV2,
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(payload).catch(() => null);
                } else {
                    await interaction.reply(payload).catch(() => null);
                }
            }
        }

        // Autocomplete
        if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);
            if (!command?.autocomplete) return;

            try {
                if (!PROFILE_EXEMPT_COMMANDS.includes(command.data.name)) {
                    const profile = await PlayerProfile.findOne({ discordId: interaction.user.id });
                    if (!profile) return interaction.respond([]); // no stand yet, nothing to suggest
                    interaction.playerProfile = profile;
                }

                await command.autocomplete(interaction, client);
            } catch (err) {
                logger.error(`Error in autocomplete for /${interaction.commandName}: ${err.message}`);
            }
        }

        // Buttons
        if (interaction.isButton()) {
            for (const handler of client.buttonHandlers) {
                try {
                    const handled = await handler(interaction, client);

                    if (handled) return;
                } catch (err) {
                    logger.error(`Button handler failed: ${err.message}`);
                }
            }

            logger.warn(`No button handler found for ${interaction.customId}`);
        }
    },
};

import { warningEmbed } from "../utils/embed.js";