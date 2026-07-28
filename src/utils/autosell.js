import PlayerProfile from '../models/player.js';
import { ensureEventsCurrent } from '../helpers/eventEffects.js';
import { attemptSell, getRemainingCooldownMs } from '../helpers/sellEngine.js';
import logger from './logger.js';

const SCAN_INTERVAL_MS = 5_000;
let intervalHandle = null;
let running = false;

export function startAutoSellScheduler() {
    if (intervalHandle) return;
    intervalHandle = setInterval(tick, SCAN_INTERVAL_MS);
}

export function stopAutoSellScheduler() {
    if (intervalHandle) clearInterval(intervalHandle);
    intervalHandle = null;
}

async function tick() {
    if (running) return;
    running = true;
    try {
        const candidates = await PlayerProfile.find({ 'settings.autoServe': true, 'entitlements.premium': true });

        for (const profile of candidates) {
            try {
                await processProfile(profile);
            } catch (err) {
                logger.error(`[autoSellScheduler] Failed processing ${profile.discordId}:`, err);
            }
        }
    } catch (err) {
        logger.error('[autoSellScheduler] Scan failed:', err);
    } finally {
        running = false;
    }
}

async function processProfile(profile) {
    const { active: liveEvent } = await ensureEventsCurrent(profile);
    if (getRemainingCooldownMs(profile, liveEvent) > 0) return;
    const result = attemptSell(profile, liveEvent);
    if (!result.ok) return;
    await profile.save();
}