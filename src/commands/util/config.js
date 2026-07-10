import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } from 'discord.js';
import { errorEmbed, warningEmbed, successEmbed } from '../../utils/embed.js';
import { renderMasteryBook } from '../../renders/renderMasteryBook.js';
import { renderConfigDisplay } from '../../renders/renderConfigDisplay.js';
import config from "../../../config.js";
import { RECIPES } from "../../data/recipes.js";

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/;

function normaliseHex(input) {
    const clean = input.trim().replace(/^#/, '');
    return `#${clean.toUpperCase()}`;
}

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Util',
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('View or modify your game configuration.')
        .addSubcommand((sub) => sub.setName('view').setDescription('View the configuration that you have setup.'))
        .addSubcommandGroup((group) => group
            .setName('edit')
            .setDescription('Modify one or more of the configuration settings for your game.')
            .addSubcommand((sub) => sub
                .setName('active_recipe')
                .setDescription('Change which one of your recipes is set as active.')
                .addStringOption((opt) => opt
                    .setName('recipe')
                    .setDescription('The recipe to make active.')
                    .setRequired(true)
                    .setAutocomplete(true)
                )
            )
            .addSubcommand((sub) => sub
                .setName('card_border')
                .setDescription('Change the border colour around your recipe cards.')
                .addStringOption((opt) => opt
                    .setName('colour_1')
                    .setDescription('Primary colour (hex, e.g. #FF6B00)')
                    .setRequired(true)
                )
                .addStringOption((opt) => opt
                    .setName('colour_2')
                    .setDescription('Secondary colour (2 colour gradient)')
                    .setRequired(false)
                )
                .addStringOption((opt) => opt
                    .setName('colour_3')
                    .setDescription('Tertiary colour (3 colour gradient)')
                    .setRequired(false)
                )
            )
            .addSubcommand((sub) => sub
                .setName('name_gradient')
                .setDescription('Set a 2-colour gradient for your stand name.')
                .addStringOption((opt) => opt
                    .setName('colour_1')
                    .setDescription('Primary colour (hex, e.g. #FF6B00)')
                    .setRequired(true)
                )
                .addStringOption((opt) => opt
                    .setName('colour_2')
                    .setDescription('Secondary colour (2 colour gradient)')
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup((group) => group
            .setName('reset')
            .setDescription('Reset one or more of the configuration settings for your game.')
            .addSubcommand((sub) => sub
                .setName('all_customization')
                .setDescription('Reset all customization settings in a single command.')
            )
            .addSubcommand((sub) => sub
                .setName('colour_border')
                .setDescription('Clear your active colour/s for your card borders.')
            )
            .addSubcommand((sub) => sub
                .setName('name_gradient')
                .setDescription('Clear your active gradient for your stand name.')
            )
        ),
    async autocomplete(interaction) {
        const profile = interaction.playerProfile;
        const focused = interaction.options.getFocused().toLowerCase()

        const choices = profile.recipes.unlocked
            .map((entry) => {
                const recipe = RECIPES.find((r) => r.id === entry.key);
                if (!recipe) return null
                return { name: recipe.name, value: entry.key, entry };
            })
            .filter(Boolean)
            .filter((c) => c.name.toLowerCase().includes(focused))
            .slice(0, 25)
            .map(({ name, value }) => ({ name, value }));
        
        await interaction.respond(choices);
    },
    async execute(interaction) {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const profile = interaction.playerProfile;

        await interaction.deferReply();

        if (subcommand === 'view') {
            const buffer = await renderConfigDisplay(profile);
            return interaction.editReply({ files: [{ attachment: buffer, name: 'config.png' }] });
        }

        if (group === 'edit') {
            if (subcommand === 'active_recipe') {
                const recipeId = interaction.options.getString('recipe', true);
                const currentRecipe = profile.recipes.unlocked.find(r => r.isActive);
                const newRecipe = profile.recipes.unlocked.find(r => r.key === recipeId);

                if (!newRecipe) {
                    return interaction.editReply({
                        components: [errorEmbed('Recipe not unlocked!', `You haven't unlocked that recipe yet.`)],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                if (newRecipe.isActive) {
                    return interaction.editReply({
                        components: [errorEmbed('Already active!', 'This is already set as your currently active recipe.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                if (currentRecipe) {
                    currentRecipe.isActive = false;
                }

                newRecipe.isActive = true;
                await profile.save();

                const recipe = RECIPES.find(r => r.id === recipeId);

                return interaction.editReply({
                    components: [successEmbed('Active recipe updated!', `**${recipe.name}** is now your active recipe.`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            if (subcommand === 'card_border') {
                if (!profile.entitlements?.premium) {
                    return interaction.editReply({
                        components: [errorEmbed('Premium pass required!', 'Custom card borders are a premium perk. Use `/premium-perks` to learn more.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                const raw = [
                    interaction.options.getString('colour_1'),
                    interaction.options.getString('colour_2'),
                    interaction.options.getString('colour_3'),
                ].filter(Boolean);

                for (const c of raw) {
                    if (!HEX_RE.test(c)) {
                        return interaction.editReply({
                            components: [errorEmbed('Unsupported colour!', `\`${c}\` isn't a valid hex colour. Use format #RRGGBB`)],
                            flags: MessageFlags.IsComponentsV2,
                        });
                    }
                }

                profile.customization = profile.customization ?? {};
                profile.customization.cardBorderColours = raw.map(normaliseHex);

                await profile.save();
                return interaction.editReply({
                    components: [successEmbed('Card border updated!', `Your recipe cards now have a ${raw.length === 1 ? 'solid' : 'gradient'} border!`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            if (subcommand === 'name_gradient') {
                if (!profile.entitlements?.premium) {
                    return interaction.editReply({
                        components: [errorEmbed('Premium pass required!', 'Gradient stand names are a premium perk. Use `/premium-perks` to learn more.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                const colour_1 = interaction.options.getString('colour_1', true);
                const colour_2 = interaction.options.getString('colour_2', true);

                for (const c of [colour_1, colour_2]) {
                    if (!HEX_RE.test(c)) {
                        return interaction.editReply({
                            components: [errorEmbed('Unsupported colour!', `\`${c}\` isn't a valid hex colour. Use format #RRGGBB`)],
                            flags: MessageFlags.IsComponentsV2,
                        });
                    }
                }

                profile.customization = profile.customization ?? {};
                profile.customization.nameGradientColours = [colour_1, colour_2].map(normaliseHex);

                await profile.save();
                return interaction.editReply({
                    components: [successEmbed('Stand name gradient updated!', `Your stand name now has a custom gradient!`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
        }

        if (group === 'reset') {
            if (subcommand === 'all_customization') {
                if (!profile.entitlements?.premium) {
                    return interaction.editReply({
                        components: [errorEmbed('Premium pass required!', 'Customization settings are a premium perk. Use `/premium-perks` to learn more.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                profile.customization = profile.customization ?? {};
                profile.customization.cardBorderColours = [];
                profile.customization.nameGradientColours = [];

                await profile.save();
                return interaction.editReply({
                    components: [successEmbed('Customization settings reset!', `All customization settings have been reset back to their default values!`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            if (subcommand === 'colour_border') {
                if (!profile.entitlements?.premium) {
                    return interaction.editReply({
                        components: [errorEmbed('Premium pass required!', 'Custom card borders are a premium perk. Use `/premium-perks` to learn more.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                profile.customization = profile.customization ?? {};
                profile.customization.cardBorderColours = [];

                await profile.save();
                return interaction.editReply({
                    components: [successEmbed('Card border rest!', `The border colour for your recipe cards is back to the default colour!`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            if (subcommand === 'name_gradient') {
                if (!profile.entitlements?.premium) {
                    return interaction.editReply({
                        components: [errorEmbed('Premium pass required!', 'Gradient stand names are a premium perk. Use `/premium-perks` to learn more.')],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }

                profile.customization = profile.customization ?? {};
                profile.customization.nameGradientColours = [];

                await profile.save();
                return interaction.editReply({
                    components: [successEmbed('Stand name gradient reset!', `Your stand name is back to the default colour!`)],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
        }
    }
}