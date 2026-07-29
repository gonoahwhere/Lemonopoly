import { renderGuideContents, renderGuideCommands, renderGuideFeature } from '../renders/renderInstructionGuide.js';

export const guideSessionMap = new Map();

// Returns the ordered list of "page entries" for a given mode.
//  - full: contents page + every manifest page
//  - commands: only command category pages
//  - features: only feature pages
export function getModePages(manifest, mode) {
    if (mode === 'full') {
        return [{ type: 'contents' }, ...manifest.pages];
    }

    if (mode === 'commands') {
        return manifest.pages.filter(entry => entry.type === 'commands');
    }

    // features mode - anything that isn't a commands page
    return manifest.pages.filter(entry => entry.type !== 'commands');
}

export async function renderGuidePage(manifest, mode, page, profile) {
    const modePages = getModePages(manifest, mode);
    const totalPages = modePages.length;
    const entry = modePages[page - 1];

    if (mode === 'full' && page === 1) {
        return renderGuideContents(manifest.sections, profile, page, totalPages);
    }

    if (entry.type === 'commands') {
        return renderGuideCommands(entry.category, entry.commands, profile, page, totalPages, entry.part);
    }

    return renderGuideFeature(entry.feature, profile, page, totalPages, entry.part);
}