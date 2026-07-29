import { EVENT_DETAILS, EVENT_CUSTOMERS } from '../data/eventKeys.js'; // adjust to wherever these actually live
import { OUTCOME_EFFECTS, getCustomerChanceModifier, getCustomerChanceOverride, getGuaranteedCustomer } from './eventEffects.js';
import { getPreferredRecipes } from '../data/customerPreference.js';

const BASE_CUSTOMER_CHANCE = 0.05;
const WORKER_WINDOW_MS = 5 * 60 * 1000;

const EVENT_CUSTOMER_ELIGIBILITY = Object.fromEntries(
    EVENT_DETAILS.map((event) => {
        const ids = new Set();
        for (const option of event.options) {
            const effect = OUTCOME_EFFECTS[option.id];
            if (effect?.customer) ids.add(effect.customer);
        }
        return [event.id, ids];
    })
);

function getEventId(activeEvent) {
    const optionId = activeEvent?.optionId;
    if (!optionId) return null;
    const event = EVENT_DETAILS.find((e) => optionId.startsWith(`${e.id}_`));
    return event?.id ?? null;
}

function isWorkerWindowOpen(activeEvent) {
    if (!activeEvent?.startsAt) return false;
    return Date.now() - new Date(activeEvent.startsAt).getTime() <= WORKER_WINDOW_MS;
}

function getCustomerChance(customerId, activeEvent, eventId) {
    if (!EVENT_CUSTOMER_ELIGIBILITY[eventId]?.has(customerId)) return 0;
    if (customerId === 'worker' && !isWorkerWindowOpen(activeEvent)) return 0;

    const override = getCustomerChanceOverride(activeEvent, customerId);
    if (override !== null) return Math.max(0, override); // e.g. thunderstorm_eleven / wind_storm_eleven blocking worker

    const modifier = getCustomerChanceModifier(activeEvent, customerId);
    return Math.max(0, BASE_CUSTOMER_CHANCE + modifier);
}

export function rollEventCustomer(activeEvent, activeRecipeId, recipes) {
    if (!activeEvent) return null;
    const eventId = getEventId(activeEvent);
    if (!eventId) return null;

    const preferredMatch = (customerId) => {
        const pool = getPreferredRecipes(customerId, recipes);
        return pool.some((r) => r.id === activeRecipeId);
    };

    const guaranteed = getGuaranteedCustomer(activeEvent);
    if (guaranteed && EVENT_CUSTOMER_ELIGIBILITY[eventId]?.has(guaranteed) && preferredMatch(guaranteed)) {
        return guaranteed;
    }

    const candidates = [...EVENT_CUSTOMERS].sort(() => Math.random() - 0.5);

    for (const customer of candidates) {
        const chance = getCustomerChance(customer.id, activeEvent, eventId);
        if (chance <= 0) continue;
        if (Math.random() >= chance) continue;
        if (preferredMatch(customer.id)) return customer.id;
    }

    return null;
}