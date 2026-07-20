import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } from 'discord.js';
import { errorEmbed, warningEmbed, successEmbed } from '../../utils/embed.js';
import { renderMasteryBook } from '../../renders/renderMasteryBook.js';
import { renderConfigDisplay } from '../../renders/renderConfigDisplay.js';
import config from "../../../config.js";
import { RECIPES } from "../../data/recipes.js";

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
        )
    ,
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

        switch (subcommand) {
            case 'view': {
                const buffer = await renderConfigDisplay(profile);
                return interaction.editReply({ files: [{ attachment: buffer, name: 'config.png' }] });
            }

            case 'active_recipe': {
                if (group === 'edit') {
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

                break;
            }
        }
    }
}