import { planCommandPages, planFeaturePages } from '../renders/renderInstructionGuide.js';

export function buildGuideManifest(categories, features) {
    const pages = [];

    const commandChapters = [];
    const featureChapters = [];

    let cursor = 2;

    const visibleCategories = categories
        .filter((category) => !category.hidden)
        .map((category) => ({
            ...category,
            commands: category.commands.filter((command) => !command.hidden),
        }));

    const visibleFeatures = features.filter((feature) => !feature.hidden);

    // Command pages
    for (const category of visibleCategories) {
        const chunks = planCommandPages(category.commands);
        const fromPage = cursor;

        for (let i = 0; i < chunks.length; i++) {
            pages.push({
                type: 'commands',
                category,
                commands: chunks[i],
                part: {
                    index: i + 1,
                    totalParts: chunks.length,
                },
            });

            cursor += 1;
        }

        commandChapters.push({
            label: category.title,
            iconKey: category.iconKey,
            accent: category.accent,
            fromPage,
            toPage: cursor - 1,
        });
    }

    // Feature pages
    for (const feature of visibleFeatures) {
        const parts = planFeaturePages(feature);
        const fromPage = cursor;

        for (const part of parts) {
            pages.push({
                type: 'feature',
                feature,
                part,
            });

            cursor += 1;
        }

        featureChapters.push({
            label: feature.title,
            iconKey: feature.iconKey,
            accent: feature.accent,
            fromPage,
            toPage: cursor - 1,
        });
    }

    const totalPages = cursor - 1;

    return {
        pages,
        totalPages,

        sections: [
            {
                title: 'COMMANDS',
                accent: '#4A3A1A',
                items: commandChapters,
            },
            {
                title: 'FEATURES',
                accent: '#4A3A1A',
                items: featureChapters,
            },
        ],
    };
}