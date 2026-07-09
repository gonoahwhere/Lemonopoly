import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { errorEmbed } from '../../utils/embed.js';
import SilentContainer from 'silent-container';
import fs from 'fs';
import config from "../../../config.js";

const commandInfo = {
    help: {
        permission: '`Everyone`',
        requiredArgs: '`none`',
        optionalArgs: '`cmd`',
        usage: '`/help`',
        useCount: '`multi-use`'
    },
    stand: {
        permission: '`Everyone`',
        requiredArgs: '`none`',
        optionalArgs: '`none`',
        usage: '`/stand`',
        useCount: '`multi-use`'
    },
    start: {
        permission: '`Everyone`',
        requiredArgs: '`none`',
        optionalArgs: '`none`',
        usage: '`/start`',
        useCount: '`single-use`'
    },
};

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Util',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('A display of the commands that I have.')
        .addStringOption(option => option
            .setName('cmd')
            .setDescription('The command that you want detailed information for.') 
            .setRequired(false)
            .addChoices(
                { name: 'help', value: 'help' },
                { name: 'stand', value: 'stand' },
                { name: 'start', value: 'start' },
            )
        ),
    async execute(interaction) {
        const command = interaction.options.getString('cmd');

        const container = new SilentContainer()
            .setColor(config.containers.color)
            .addHeading(`${config.emojis.misc.info} The Curbside Command Guide`)
            .addText(`-# Here is a list of all the commands that I have to offer!`)
            .addDivider()
            .addText(`-# \`help\`, \`stand\`, \`start\``)
            .addDivider()
            .addText(`-# Use \`/help [cmd]\` for more detailed information about a specific command!`)

        if (!command) {
            return interaction.reply({ ...container.toMessagePayload() });
        }

        const info = commandInfo[command];
        if (!info) {
            return interaction.reply({
                components: [errorEmbed('Not enough data!', `No detailed information found for \`${command}\` yet.`)],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const detailContainer = new SilentContainer()
            .setColor(config.containers.color)
            .addHeading(`${config.emojis.misc.info} \`${command}\``)
            .addText(`-# • Permission: ${info.permission}`)
            .addDivider();

        if (info.subcommands) {
            for (const [subName, sub] of Object.entries(info.subcommands)) {
                detailContainer.addLongText(
                    `**\`/${command} ${subName}**\n` +
                    `-# • Required: ${sub.requiredArgs}\n` +
                    `-# • Optional: ${sub.optionalArgs}\n` +
                    `-# • Usage: ${sub.usage}\n` + 
                    `-# • Use Count: ${sub.useCount}`
                );
            }
        } else {
            detailContainer.addLongText(
                `-# • Required: ${info.requiredArgs}\n` +
                `-# • Optional: ${info.optionalArgs}\n` +
                `-# • Usage: ${info.usage}\n` + 
                `-# • Use Count: ${info.useCount}`
            );
        }

        return interaction.reply({ ...detailContainer.toMessagePayload() })
    },
};