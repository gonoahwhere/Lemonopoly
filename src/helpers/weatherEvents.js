
import { EVENT_DETAILS } from '../data/eventKeys.js';

const MIN_EVENT_DURATION_MS = 10 * 60 * 1000;
const MAX_EVENT_DURATION_MS = 20 * 60 * 1000;

function randomDurationMs() {
    return Math.floor(Math.random() * (MAX_EVENT_DURATION_MS - MIN_EVENT_DURATION_MS + 1)) + MIN_EVENT_DURATION_MS;
}


function pickWeightedOption(options) {
    const total = options.reduce((sum, o) => sum + (o.weight ?? 1), 0);
    let roll = Math.random() * total;

    for (const option of options) {
        roll -= option.weight ?? 1;
        if (roll <= 0) return option;
    }
    return options[options.length - 1];
}

function rollEvent(excludeType = null) {
    const pool = excludeType
        ? EVENT_DETAILS.filter((e) => e.type !== excludeType)
        : EVENT_DETAILS;

    // fallback in case every event shares the same type - avoid crashing on an empty pool
    const source = pool.length > 0 ? pool : EVENT_DETAILS;

    const event = source[Math.floor(Math.random() * source.length)];
    const option = pickWeightedOption(event.options);
    return {
        key: event.id,
        type: event.type,
        optionId: option.id,
    };
}

export function rollInitialEvents(now = new Date()) {
    const activeDuration = randomDurationMs();
    const nextDuration = randomDurationMs();

    const activeStarts = now;
    const activeEnds = new Date(activeStarts.getTime() + activeDuration);
    const nextEnds = new Date(activeEnds.getTime() + nextDuration);

    const active = {
        ...rollEvent(),
        startsAt: activeStarts,
        endsAt: activeEnds,
    };

    const next = {
        ...rollEvent(active.type),
        startsAt: activeEnds,
        endsAt: nextEnds,
    };

    return { active, next };
}

export function advanceEvents(events, now = new Date()) {
    // No events yet at all (e.g. very first load) - just create them.
    if (!events?.active?.key || !events?.active?.endsAt) {
        return { ...rollInitialEvents(now), changed: true, expired: [] };
    }

    let active = events.active;
    let next = events.next;
    const expired = [];
    let changed = false;

    while (active?.endsAt && new Date(active.endsAt).getTime() <= now.getTime()) {
        expired.push(active);
        changed = true;

        // promote "next" into "active"
        active = {
            key: next.key,
            type: next.type,
            optionId: next.optionId,
            startsAt: next.startsAt,
            endsAt: next.endsAt,
        };

        // roll a fresh "next" queued right after the new active ends, guaranteed a different type
        const duration = randomDurationMs();
        const startsAt = active.endsAt;
        const endsAt = new Date(new Date(startsAt).getTime() + duration);
        next = {
            ...rollEvent(active.type),
            startsAt,
            endsAt,
        };
    }

    return { active, next, changed, expired };
}

export function getEventOption(key, optionId) {
    const event = EVENT_DETAILS.find((e) => e.id === key);
    if (!event) return null;
    const option = event.options.find((o) => o.id === optionId);
    if (!option) return null;
    return {
        eventName: event.name,
        type: event.type,
        optionId: option.id,
        task: option.task,
    };
}