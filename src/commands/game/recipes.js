import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } from 'discord.js';
import { errorEmbed, warningEmbed, successEmbed } from '../../utils/embed.js';
import { renderMasteryBook } from '../../renders/renderMasteryBook.js';
import config from "../../../config.js";
import { RECIPES } from "../../data/recipes.js";
import { canMaster, masterRecipe } from '../../utils/recipeMastery.js';

const RECIPES_PER_PAGE = 3;

function capitalize(str) {
    return str ? str[0].toUpperCase() + str.slice(1) : '';
}

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('my-recipes')
        .setDescription('View and master your unlocked recipes.')
        .addSubcommand((sub) => sub.setName('view').setDescription('View your recipe mastery book.'))
        .addSubcommand((sub) => sub
            .setName('master')
            .setDescription('Master a recipe that has reached 5 stars.')
            .addStringOption((opt) => opt
                .setName('recipe')
                .setDescription('The recipe you want to master.')
                .setRequired(true)
                .setAutocomplete(true)
            )
        ),
    async autocomplete(interaction) {
        const profile = interaction.playerProfile;
        const focused = interaction.options.getFocused().toLowerCase();

        const choices = profile.recipes.unlocked
            .map((entry) => {
                const recipe = RECIPES.find((r) => r.id === entry.key);
                if (!recipe) return null;
                return { name: `${recipe.name} (${capitalize(entry.rarity)} • ${entry.stars}/5)`, value: entry.key, entry };
            })
            .filter(Boolean)
            .filter((c) => c.name.toLowerCase().includes(focused))
            .slice(0, 25)
            .map(({ name, value }) => ({ name, value }));

        await interaction.respond(choices);
    },
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply()

        switch (subcommand) {
            case 'view': {
                const profile = interaction.playerProfile;
                const unlockedCount = profile.recipes.unlocked.length;
                const totalPages = Math.max(1, Math.ceil(unlockedCount / RECIPES_PER_PAGE));
                const page = 1;

                const image = renderMasteryBook(profile, page);
                const attachment = new AttachmentBuilder(image, { name: 'my-recipes.png' });

                const components = [];
                if (totalPages > 1) {
                    const previousPage = new ButtonBuilder()
                        .setCustomId(`recipe_view_previous`)
                        .setEmoji(config.emoji('misc', 'left_arrow'))
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 1);

                    const recipePage = new ButtonBuilder()
                        .setCustomId(`recipe_view_page`)
                        .setLabel(`${page} / ${totalPages}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);

                    const nextPage = new ButtonBuilder()
                        .setCustomId(`recipe_view_next`)
                        .setEmoji(config.emoji('misc', 'right_arrow'))
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === totalPages);

                    components.push(new ActionRowBuilder().addComponents(previousPage, recipePage, nextPage));
                }

                return await interaction.editReply({ files: [attachment], components });
            }

            case 'master': {
                const profile = interaction.playerProfile;
                const recipeKey = interaction.options.getString('recipe');

                const entry = profile.recipes.unlocked.find((r) => r.key === recipeKey);
                if (!entry) {
                    return interaction.editReply({ components: [errorEmbed('Recipe not unlocked!', 'You haven\'t unlocked that recipe yet.')], flags: MessageFlags.IsComponentsV2 });
                }

                const recipe = RECIPES.find((r) => r.id === recipeKey);
                const check = canMaster(entry, profile.prestige.level);

                if (!check.ok) {
                    const messages = {
                        NOT_ENOUGH_STARS: {
                            title: 'Not enough stars!',
                            description: `**${recipe.name}** isn't at **5** stars yet (**${entry.stars}/5**).`
                        },
                        MAX_TIER: {
                            title: 'Max tier reached!',
                            description: `**${recipe.name}** is already at the highest tier.`
                        },
                        PRESTIGE_LOCKED: {
                            title: 'Not enough prestiges!',
                            description: `**${recipe.name}** is ready to master into **${capitalize(check.nextTier)}**, but you haven't prestiged enough! (**${profile.prestige.level}/${check.required}**).`
                        },
                    };

                    const response = messages[check.reason] ?? {
                        title: 'Unable to master recipe!',
                        description: 'Can\'t master this recipe right now. Try again later!'
                    };

                    const embed = check.reason === 'PRESTIGE_LOCKED' ? warningEmbed(response.title, response.description) : errorEmbed(response.title, response.description);

                    return interaction.editReply({ components: [embed], flags: MessageFlags.IsComponentsV2 });
                }

                const result = masterRecipe(entry, profile.prestige.level);
                await profile.save();

                return interaction.editReply({ components: [successEmbed('Recipe mastered!', `**${recipe.name}** has been mastered into **${capitalize(result.newRarity)}**! Stars reset to **0/5** for the new tier.`)], flags: MessageFlags.IsComponentsV2 });
            }
        }
    },
};