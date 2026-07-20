import { planCommandPages, planFeaturePages } from '../renders/renderInstructionGuide.js';

export function buildGuideManifest(categories, features) {
    const pages = [];

    const commandChapters = [];
    const featureChapters = [];

    let cursor = 2; // page 1 is the table of contents

    // Command pages
    categories.forEach((category) => {
        const chunks = planCommandPages(category.commands);
        const fromPage = cursor;

        chunks.forEach((chunk, i) => {
            pages.push({
                type: 'commands',
                category,
                commands: chunk,
                part: {
                    index: i + 1,
                    totalParts: chunks.length,
                },
            });

            cursor += 1;
        });

        commandChapters.push({
            label: category.title,
            iconKey: category.iconKey,
            accent: category.accent,
            fromPage,
            toPage: cursor - 1,
        });
    });

    // Feature pages
    features.forEach((feature) => {
        const parts = planFeaturePages(feature);
        const fromPage = cursor;

        parts.forEach((part) => {
            pages.push({
                type: 'feature',
                feature,
                part,
            });

            cursor += 1;
        });

        featureChapters.push({
            label: feature.title,
            iconKey: feature.iconKey,
            accent: feature.accent,
            fromPage,
            toPage: cursor - 1,
        });
    });

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