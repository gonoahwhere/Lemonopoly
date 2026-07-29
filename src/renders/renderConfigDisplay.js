import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { RECIPES } from "../data/recipes.js";
import { getSprite } from '../data/sprites.js';
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    redSoft: '#F0664E1F',
    premium: '#9B4FD1',
    premiumSoft: '#9B4FD11F',
    seasonal: '#3B82C4',
    seasonalSoft: '#3B82C41F',
    beta: '#F0664E',
    betaSoft: '#F0664E1F',
    lockedGrey: '#A1A1AA',
    lockedGreySoft: '#A1A1AA1F',
    starEmpty: '#8A754859',
    teal: '#2BAFA0',
};

const RARITY_COLOURS = {
    common: { text: '#8A7548', bg: '#8A75481F', border: '#8A754866' },
    uncommon: { text: '#4FBF5B', bg: '#4FBF5B1F', border: '#4FBF5B66' },
    rare: { text: '#3B82C4', bg: '#3B82C41F', border: '#3B82C466' },
    epic: { text: '#9B4FD1', bg: '#9B4FD11F', border: '#9B4FD166' },
    legendary: { text: '#E7A800', bg: '#E7A8001F', border: '#E7A80066' },
    mythic: { text: '#F0664E', bg: '#F0664E1F', border: '#F0664E66' },
    divine: { gradient: ['#F8FAFC', '#8B5CF6'], border: '#8B5CF673' },
    cosmic: { gradient: ['#5D5FEF', '#FF61D2'], border: '#FF61D273' },
    transcendent: { gradient: ['#00C6FF', '#7F00FF'], border: '#00C6FF73' },
    ancient: { gradient: ['#D6D6D6', '#5B5B5B'], border: '#5B5B5B73' },
    primal: { gradient: ['#F46FFF', '#FF4B2B'], border: '#FF416C73' },
    eternal: { gradient: ['#2AF598', '#009EFD'], border: '#009EFD73' },
    exotic: { gradient: ['#FF9966', '#00F2FE'], border: '#FF996673' },
};

function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function dashedRoundedRectPath(ctx, x, y, w, h, r) {
    ctx.save();
    ctx.setLineDash([6, 6]);
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.stroke();
    ctx.restore();
}

function roundedRect(ctx, x, y, w, h, r, fill) {
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
}

function roundedRectWithShadow(ctx, x, y, w, h, r, fill, shadowColor, blur = 14, offsetY = 6) {
    ctx.save();
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetY = offsetY;
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
}

function drawIconCircle(ctx, cx, cy, size, iconKey) {
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4D6';
    ctx.fill();
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const icon = getSprite(`icon.${iconKey}`);
    if (icon) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2 - 3, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(icon.sheet, icon.x, icon.y, icon.w, icon.h, cx - size / 2 + 3, cy - size / 2 + 3, size - 6, size - 6);
        ctx.restore();
    }
}

function drawPill(ctx, x, y, label, colour, bg, borderColour) {
    ctx.font = '13px FredokaOne';
    const w = ctx.measureText(label).width + 20;
    const h = 26;
    roundedRect(ctx, x, y, w, h, h / 2, bg);
    ctx.strokeStyle = borderColour ?? colour + '77';
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, h / 2);
    ctx.stroke();
    ctx.fillStyle = colour;
    ctx.fillText(label, x + 10, y + h / 2 + 4.5);
    return w;
}

function drawHeader(ctx, width, profile) {
    ctx.font = "42px FredokaOne";
    const titleGrad = ctx.createLinearGradient(50, 20, 450, 20);
    titleGrad.addColorStop(0, COLOURS.title);
    titleGrad.addColorStop(1, '#FFDD70');

    ctx.strokeStyle = COLOURS.text;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeText('STAND CONFIGURATION', 50, 62);

    ctx.fillStyle = titleGrad;
    ctx.fillText('STAND CONFIGURATION', 50, 62);

    ctx.font = '20px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(profile.stand.name, 54, 90);

    const divGrad = ctx.createLinearGradient(45, 0, width - 45, 0);
    divGrad.addColorStop(0, '#E7A80000');
    divGrad.addColorStop(0.5, '#E7A80080');
    divGrad.addColorStop(1, '#E7A80000');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 112);
    ctx.lineTo(width - 45, 112);
    ctx.stroke();
}

function drawPremiumChip(ctx, x, y, w, h, isPremium) {
    roundedRectWithShadow(ctx, x, y, w, h, 18, COLOURS.card, COLOURS.cardShadow);
    ctx.strokeStyle = isPremium ? COLOURS.premium + '77' : COLOURS.border;
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, 18);
    ctx.stroke();

    const iconSize = 40;
    drawIconCircle(ctx, x + 14 + iconSize / 2, y + h / 2, iconSize, 'premium');

    const textX = x + 14 + iconSize + 12;
    ctx.font = '13px FredokaOne';
    ctx.fillStyle = COLOURS.premium;
    ctx.fillText('PREMIUM PASS', textX, y + h / 2 - 8);

    drawPill(ctx, textX, y + h / 2 - 1, isPremium ? 'ACTIVE' : 'FREE TIER', isPremium ? COLOURS.premium : COLOURS.muted, isPremium ? COLOURS.premiumSoft : '#A8934F1A');
}

function drawMixAllCapChip(ctx, x, y, w, h, cap, isPremium) {
    roundedRectWithShadow(ctx, x, y, w, h, 18, COLOURS.card, COLOURS.cardShadow);
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, 18);
    ctx.stroke();

    const iconSize = 40;
    drawIconCircle(ctx, x + 14 + iconSize / 2, y + h / 2, iconSize, 'mix_all');

    const textX = x + 14 + iconSize + 12;
    ctx.font = '13px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText("MIX 'ALL' CAP", textX, y + h / 2 - 8);

    drawPill(ctx, textX, y + h / 2 - 1, `${cap} CUPS`, COLOURS.muted, '#A8934F1A');

    if (isPremium) {
        ctx.font = '13px FredokaOne';
        const pillW = ctx.measureText('x2').width + 20;
        const pillX = x + w - pillW - 16;
        const pillY = y + 16;
        drawPill(ctx, pillX, pillY, 'x2', COLOURS.premium, COLOURS.premiumSoft);
    }
}

function drawEntitlementChip(ctx, x, y, w, h, iconKey, label, active, accent, accentSoft) {
    roundedRectWithShadow(ctx, x, y, w, h, 18, COLOURS.card, COLOURS.cardShadow);
    ctx.strokeStyle = active ? accent + '77' : COLOURS.border;
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, 18);
    ctx.stroke();

    if (!active) {
        roundedRect(ctx, x, y, w, h, 18, '#FFFFFF59');
    }

    const iconSize = 40;
    drawIconCircle(ctx, x + 14 + iconSize / 2, y + h / 2, iconSize, iconKey);

    const textX = x + 14 + iconSize + 12;
    ctx.font = '13px FredokaOne';
    ctx.fillStyle = accent;
    ctx.fillText(label.toUpperCase(), textX, y + h / 2 - 8);

    drawPill(ctx, textX, y + h / 2 - 1, active ? 'ACTIVE' : 'INACTIVE', active ? accent : COLOURS.muted, active ? accentSoft : '#A8934F1A');
}

function drawToggleChip(ctx, x, y, w, h, iconKey, label, enabled, locked, accent = COLOURS.subtitle) {
    roundedRectWithShadow(ctx, x, y, w, h, 18, COLOURS.card, COLOURS.cardShadow);
    ctx.strokeStyle = locked ? COLOURS.lockedGrey + '55' : (enabled ? COLOURS.green + '77' : COLOURS.border);
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, 18);
    ctx.stroke();

    const iconSize = 40;
    drawIconCircle(ctx, x + 14 + iconSize / 2, y + h / 2, iconSize, iconKey);

    const textX = x + 14 + iconSize + 12;
    ctx.font = '13px FredokaOne';
    ctx.fillStyle = accent;
    ctx.fillText(label.toUpperCase(), textX, y + h / 2 - 8);

    if (locked) {
        drawPill(ctx, textX, y + h / 2 - 1, 'PREMIUM ONLY', COLOURS.premium, COLOURS.premiumSoft);
        return;
    }

    const pillLabel = enabled ? 'ACTIVE' : 'INACTIVE';
    const pillColour = enabled ? COLOURS.green : COLOURS.muted;
    const pillBg = enabled ? COLOURS.greenSoft : '#A8934F1A';
    drawPill(ctx, textX, y + h / 2 - 1, pillLabel, pillColour, pillBg);
}

function drawTimezoneChip(ctx, x, y, w, h, timezone) {
    roundedRectWithShadow(ctx, x, y, w, h, 18, COLOURS.card, COLOURS.cardShadow);
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, 18);
    ctx.stroke();

    const iconSize = 40;
    drawIconCircle(ctx, x + 14 + iconSize / 2, y + h / 2, iconSize, 'timezone');

    const textX = x + 14 + iconSize + 12;
    ctx.font = '13px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText('TIMEZONE', textX, y + h / 2 - 8);

    drawPill(ctx, textX, y + h / 2 - 1, timezone, COLOURS.muted, '#A8934F1A');
}

function drawRarityPill(ctx, x, y, rarity) {
    const def = RARITY_COLOURS[rarity] || RARITY_COLOURS.common;
    const label = rarity.toUpperCase();
    ctx.font = '13px FredokaOne';
    const w = ctx.measureText(label).width + 16;
    const h = 22;

    roundedRectPath(ctx, x, y, w, h, h / 2);
    if (def.gradient) {
        const grad = ctx.createLinearGradient(x, y, x + w, y);
        grad.addColorStop(0, def.gradient[0]);
        grad.addColorStop(1, def.gradient[1]);
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    } else {
        ctx.fillStyle = def.bg;
        ctx.fill();
    }
    ctx.strokeStyle = def.border;
    ctx.lineWidth = 1.1;
    roundedRectPath(ctx, x, y, w, h, h / 2);
    ctx.stroke();

    ctx.fillStyle = def.text ?? def.border;
    ctx.fillText(label, x + 8, y + h / 2 + 4);
    return w;
}

function drawFilledSlotCard(ctx, x, y, w, h, entry, slotNumber) {
    roundedRectWithShadow(ctx, x, y, w, h, 18, COLOURS.card, COLOURS.cardShadow);
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, 18);
    ctx.stroke();

    ctx.font = '13px FredokaOne';
    ctx.fillStyle = COLOURS.muted;
    ctx.fillText(`SLOT ${slotNumber}`, x + 18, y + 22);

    const def = RECIPES.find((r) => r.id === entry.key);
    const imgSize = 64;
    const imgX = x + 18;
    const imgY = y + 32;
    ctx.beginPath();
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4D6';
    ctx.fill();
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (def) {
        const drinkImg = getSprite(`drink.${def.id}`);
        if (drinkImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2 - 3, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(drinkImg.sheet, drinkImg.x, drinkImg.y, drinkImg.w, drinkImg.h, imgX + 3, imgY + 3, imgSize - 6, imgSize - 6);
            ctx.restore();
        }
    }

    const textX = imgX + imgSize + 16;
    ctx.font = '20px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText(def?.name ?? entry.key, textX, imgY + 22);

    drawRarityPill(ctx, textX, imgY + 34, entry.rarity);
}

function drawEmptySlotCard(ctx, x, y, w, h, slotNumber) {
    ctx.strokeStyle = COLOURS.starEmpty;
    ctx.lineWidth = 1.5;
    dashedRoundedRectPath(ctx, x, y, w, h, 18);

    ctx.font = '12px FredokaOne';
    ctx.fillStyle = COLOURS.muted;
    ctx.textAlign = 'center';
    ctx.fillText(`SLOT ${slotNumber}`, x + w / 2, y + h / 2 - 8);
    ctx.font = '16px FredokaOne';
    ctx.fillText('Empty — pick a recipe', x + w / 2, y + h / 2 + 16);
    ctx.textAlign = 'left';
}

export function renderConfigDisplay(profile) {
    const width = 900;

    const isPremium = Boolean(profile.entitlements?.premium);
    const isSeasonal = Boolean(profile.entitlements?.seasonal);
    const isBetaTester = Boolean(profile.entitlements?.betaTester);

    const mixAllCap = isPremium ? 30 : 15;
    const maxActiveSlots = profile.recipes?.activeSlotLimit ?? 1;
    const activeEntries = (profile.recipes?.unlocked ?? []).filter((r) => r.isActive);

    const timezone = profile.settings?.timezone ?? 'UTC';
    const notificationsEnabled = Boolean(profile.settings?.notificationsEnabled);
    const leaderboardOptIn = Boolean(profile.settings?.leaderboardOptIn);
    const autoServeEnabled = Boolean(profile.settings?.autoServe);

    const HEADER_H = 130;
    const STATUS_ROW_H = 78;
    const ENTITLEMENT_ROW_H = 78;
    const TOGGLE_ROW_H = 78;
    const TIMEZONE_ROW_H = 78;
    const SLOT_LABEL_H = 34;
    const SLOT_CARD_H = 110;
    const FOOTER_H = 40;
    const GAP = 18;

    const height = HEADER_H + STATUS_ROW_H + GAP + ENTITLEMENT_ROW_H + GAP + TOGGLE_ROW_H + GAP + TIMEZONE_ROW_H + GAP + SLOT_LABEL_H + maxActiveSlots * SLOT_CARD_H + Math.max(0, maxActiveSlots - 1) * 14 + GAP + FOOTER_H;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, width, height);
    drawHeader(ctx, width, profile);

    let y = HEADER_H;
    const twoChipW = (800 - 22) / 2;
    const threeChipW = (800 - 36) / 3;

    // Row: Premium Pass / Mix All Cap
    drawPremiumChip(ctx, 50, y, twoChipW, STATUS_ROW_H, isPremium);
    drawMixAllCapChip(ctx, 50 + twoChipW + 22, y, twoChipW, STATUS_ROW_H, mixAllCap, isPremium);
    y += STATUS_ROW_H + GAP;

    // Row: Seasonal / Beta Tester entitlement badges
    drawEntitlementChip(ctx, 50, y, twoChipW, ENTITLEMENT_ROW_H, 'seasonal', 'Seasonal Pass', isSeasonal, COLOURS.seasonal, COLOURS.seasonalSoft);
    drawEntitlementChip(ctx, 50 + twoChipW + 22, y, twoChipW, ENTITLEMENT_ROW_H, 'beta', 'Beta Tester', isBetaTester, COLOURS.beta, COLOURS.betaSoft);
    y += ENTITLEMENT_ROW_H + GAP;

    // Row: Leaderboard / Auto-Serve / Notifications toggles
    drawToggleChip(ctx, 50, y, threeChipW, TOGGLE_ROW_H, 'leaderboard', 'Leaderboard', leaderboardOptIn, false, COLOURS.teal);
    drawToggleChip(ctx, 50 + threeChipW + 18, y, threeChipW, TOGGLE_ROW_H, 'autoserve', 'Auto-Serve', autoServeEnabled, !isPremium, COLOURS.premium);
    drawToggleChip(ctx, 50 + (threeChipW + 18) * 2, y, threeChipW, TOGGLE_ROW_H, 'notifications', 'Notifications', notificationsEnabled, false, COLOURS.green);
    y += TOGGLE_ROW_H + GAP;

    // Row: Timezone
    drawTimezoneChip(ctx, 50, y, 800, TIMEZONE_ROW_H, timezone);
    y += TIMEZONE_ROW_H + GAP;

    ctx.font = '16px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(`ACTIVE RECIPE SLOTS (${activeEntries.length}/${maxActiveSlots})`, 50, y + 22);
    y += SLOT_LABEL_H;

    for (let i = 0; i < maxActiveSlots; i++) {
        const entry = activeEntries[i];
        if (entry) {
            drawFilledSlotCard(ctx, 50, y, 800, SLOT_CARD_H, entry, i + 1);
        } else {
            drawEmptySlotCard(ctx, 50, y, 800, SLOT_CARD_H, i + 1);
        }
        y += SLOT_CARD_H + 14;
    }

    ctx.font = '17px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';
    ctx.fillText(isPremium ? 'premium pass active — enjoy the higher mix cap and extra slot(s)' : 'upgrade to premium pass for auto-serve, a bigger mix cap, and more active slots', width / 2, height - FOOTER_H / 2 + 5);
    ctx.textAlign = 'left';

    return canvas.toBuffer('image/png');
}