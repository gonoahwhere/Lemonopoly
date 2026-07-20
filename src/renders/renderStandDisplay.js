import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { RECIPES } from "../data/recipes.js";
import { getDrinkImageFromCache } from "../data/drinkImages.js";
import { getIconFromCache } from "../data/iconImages.js";
import { getIngredientFromCache } from "../data/ingredientImages.js";
import { getMasteryBonuses, canMaster, getStarProgressFraction, calculateStars } from "../utils/recipeMastery.js";
import { UPGRADE_ICON_KEYS } from "../data/iconKeys.js";
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { wrapText, formatNumber } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    progressBg: '#F1E6BE',
    progressFillA: '#B7E75A',
    progressFillB: '#5FCB4F',
    starEmpty: '#8A754859',
    premium: '#9B4FD1',
    seasonal: '#3B82C4',
    beta: '#F0664E',
    eventBg: '#F0664E1A',
    eventBorder: '#F0664E66',
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

const THEME_LABELS = {
    lemonade: 'Lemonade Stand',
    ice_cream: 'Ice Cream Stand',
    both: 'Lemonade & Ice Cream Stand',
};

const EVENT_LABELS = {
    heatwave: 'Heatwave',
    local_festival: 'Local Festival',
    sudden_rain: 'Sudden Rain',
    thunderstorm: 'Thunderstorm',
    wind_storm: 'Wind Storm',
    weekend_rush: 'Weekend Rush',
};

const UPGRADE_LABELS = {
    speed: 'Speed',
    storage: 'Storage',
    resilience: 'Resilience',
    appeal: 'Appeal',
};

export function fillTextWithKernedDollars(ctx, text, x, y, align = 'left', kernPx = 4) {
    const parts = text.split('$');
    const dollarWidth = ctx.measureText('$').width;

    let totalWidth = ctx.measureText(parts[0]).width;
    for (let i = 1; i < parts.length; i++) {
        totalWidth += dollarWidth - kernPx + ctx.measureText(parts[i]).width;
    }

    let cursor = x;
    if (align === 'center') cursor = x - totalWidth / 2;
    else if (align === 'right') cursor = x - totalWidth;

    ctx.fillText(parts[0], cursor, y);
    cursor += ctx.measureText(parts[0]).width;

    for (let i = 1; i < parts.length; i++) {
        ctx.fillText('$', cursor, y);
        cursor += dollarWidth - kernPx;
        ctx.fillText(parts[i], cursor, y);
        cursor += ctx.measureText(parts[i]).width;
    }
}

// layout constants
const HEADER_H = 150;
const STAT_ROW_H = 76;
const UPGRADES_ROW_H = 76;
const ECONOMY_ROW_H = 76;
const EVENT_BANNER_H = 70;
const RECIPE_CARD_H = 340;
const FOOTER_H = 74;
const GAP = 24;

export async function renderStandDisplay(profile) {
    const width = 900;

    const height = HEADER_H + STAT_ROW_H + GAP + UPGRADES_ROW_H + GAP + ECONOMY_ROW_H + GAP + EVENT_BANNER_H + GAP + RECIPE_CARD_H + GAP + FOOTER_H;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, width, height);
    drawHeader(ctx, width, profile);

    let cursorY = HEADER_H;
    drawStatRow(ctx, width, profile, cursorY);
    cursorY += STAT_ROW_H + GAP;

    drawUpgradesRow(ctx, width, profile, cursorY);
    cursorY += UPGRADES_ROW_H + GAP;

    drawEconomyRow(ctx, width, profile, cursorY);
    cursorY += ECONOMY_ROW_H + GAP;

    drawEventRow(ctx, profile, cursorY);
    cursorY += EVENT_BANNER_H + GAP;

    await drawActiveRecipeCard(ctx, profile, 50, cursorY, 800, RECIPE_CARD_H);
    cursorY += RECIPE_CARD_H + GAP;
    drawFooter(ctx, width, height, profile);

    return canvas.toBuffer('image/png');
}

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

function roundedRect(ctx, x, y, w, h, r, fill) {
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
}

function roundedRectWithShadow(ctx, x, y, w, h, r, fill, shadowColor, blur = 18, offsetY = 8) {
    ctx.save();
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetY = offsetY;
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
}

function drawHeader(ctx, width, profile) {
    ctx.font = "50px FredokaOne";
    const titleGrad = ctx.createLinearGradient(50, 30, 520, 30);
    titleGrad.addColorStop(0, COLOURS.title);
    titleGrad.addColorStop(1, '#FFDD70');

    ctx.strokeStyle = COLOURS.text;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.strokeText(profile.stand.name, 50, 70);

    ctx.fillStyle = titleGrad;
    ctx.fillText(profile.stand.name, 50, 70);

    ctx.font = "22px FredokaOne";
    ctx.fillStyle = COLOURS.subtitle;
    const subtitle = `${THEME_LABELS[profile.stand.theme] ?? profile.stand.theme} • ${profile.stand.location}`;
    ctx.fillText(subtitle, 54, 100);

    const badges = [];
    if (profile.entitlements?.premium) badges.push({ label: 'PREMIUM', colour: COLOURS.premium });
    if (profile.entitlements?.seasonal) badges.push({ label: 'SEASONAL', colour: COLOURS.seasonal });
    if (profile.entitlements?.betaTester) badges.push({ label: 'BETA', colour: COLOURS.beta });

    if (badges.length) {
        ctx.font = '13px FredokaOne';
        let bx = width - 50;
        const by = 34;
        const bh = 26;
        for (let i = badges.length - 1; i >= 0; i--) {
            const { label, colour } = badges[i];
            const bw = ctx.measureText(label).width + 20;
            bx -= bw;
            roundedRect(ctx, bx, by, bw, bh, bh / 2, colour + '1F');
            ctx.strokeStyle = colour + '77';
            ctx.lineWidth = 1.2;
            roundedRectPath(ctx, bx, by, bw, bh, bh / 2);
            ctx.stroke();
            ctx.fillStyle = colour;
            ctx.fillText(label, bx + 10, by + bh / 2 + 4.5);
            bx -= 8;
        }
    }

    const divGrad = ctx.createLinearGradient(45, 0, width - 45, 0);
    divGrad.addColorStop(0, '#E7A80000');
    divGrad.addColorStop(0.5, '#E7A80080');
    divGrad.addColorStop(1, '#E7A80000');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 125);
    ctx.lineTo(width - 45, 125);
    ctx.stroke();
}

function drawStatChip(ctx, x, y, w, h, iconKey, label, value, accent) {
    roundedRectWithShadow(ctx, x, y, w, h, 18, COLOURS.card, COLOURS.cardShadow, 12, 5);
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, 18);
    ctx.stroke();

    const iconSize = 40;
    const iconX = x + 16;
    const iconY = y + h / 2 - iconSize / 2;
    ctx.beginPath();
    ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4D6';
    ctx.fill();
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const icon = getIconFromCache(iconKey);
    if (icon) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 - 3, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(icon, iconX + 3, iconY + 3, iconSize - 6, iconSize - 6);
        ctx.restore();
    }

    const textX = iconX + iconSize + 14;
    ctx.font = '13px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(label.toUpperCase(), textX, y + h / 2 - 6);

    ctx.font = '22px FredokaOne';
    ctx.fillStyle = accent ?? COLOURS.text;
    ctx.fillText(value, textX, y + h / 2 + 22);
}

function drawStatRow(ctx, width, profile, y) {
    const h = STAT_ROW_H;
    const gap = 22;
    const chipW = 176;
    const startX = (width - (chipW * 4 + gap * 3)) / 2;

    drawStatChip(ctx, startX, y, chipW, h, 'level', 'Level', `Lv. ${profile.stand.level}`);
    drawStatChip(ctx, startX + (chipW + gap), y, chipW, h, 'heart', 'Health', `${profile.stand.health}/100`, profile.stand.health < 40 ? COLOURS.red : COLOURS.text);
    drawStatChip(ctx, startX + (chipW + gap) * 2, y, chipW, h, 'cash', 'Cash', `$${formatNumber(profile.economy.cash)}`, '#2E8B39');
    drawStatChip(ctx, startX + (chipW + gap) * 3, y, chipW, h, 'coins', 'Coins', formatNumber(profile.economy.coins), '#B8860B');

    if (profile.stand.repairCost > 0) {
        ctx.font = '12px FredokaOne';
        ctx.fillStyle = COLOURS.red;
        ctx.fillText(`Repairs cost $${formatNumber(profile.stand.repairCost)}`, startX + (chipW + gap) + 16, y + h + 16);
    }
}

function drawUpgradesRow(ctx, width, profile, y) {
    const h = UPGRADES_ROW_H;
    const gap = 22;
    const chipW = 176;
    const startX = (width - (chipW * 4 + gap * 3)) / 2;
    const keys = ['speed', 'storage', 'resilience', 'appeal'];

    keys.forEach((key, i) => {
        const x = startX + (chipW + gap) * i;
        const level = profile.upgrades?.[key]?.level ?? 0;
        drawUpgradeChip(ctx, x, y, chipW, h, key, level);
    });
}

function drawUpgradeChip(ctx, x, y, w, h, key, level) {
    roundedRectWithShadow(ctx, x, y, w, h, 16, COLOURS.card, COLOURS.cardShadow, 10, 4);
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, 16);
    ctx.stroke();

    const iconSize = 40;
    const iconX = x + 16;
    const iconY = y + h / 2 - iconSize / 2;
    ctx.beginPath();
    ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4D6';
    ctx.fill();
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const icon = getIconFromCache(UPGRADE_ICON_KEYS[key]);
    if (icon) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 - 3, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(icon, iconX + 3, iconY + 3, iconSize - 6, iconSize - 6);
        ctx.restore();
    }

    const textX = iconX + iconSize + 14;
    ctx.font = '13px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(UPGRADE_LABELS[key].toUpperCase(), textX, y + h / 2 - 6);

    ctx.font = '22px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText(`Lv. ${level}`, textX, y + h / 2 + 22);
}

function drawEconomyRow(ctx, width, profile, y) {
    const h = ECONOMY_ROW_H;
    const gap = 22;
    const chipW = 176;
    const startX = (width - (chipW * 4 + gap * 3)) / 2;

    drawEconomyChip(ctx, startX, y, chipW, h, 'cash', 'Cash Earned', profile.economy.lifetimeEarned.cash, COLOURS.green, '$');
    drawEconomyChip(ctx, startX + (chipW + gap), y, chipW, h, 'cash', 'Cash Spent', profile.economy.lifetimeSpent.cash, COLOURS.red, '$');
    drawEconomyChip(ctx, startX + (chipW + gap) * 2, y, chipW, h, 'coins', 'Coins Earned', profile.economy.lifetimeEarned.coins, COLOURS.green);
    drawEconomyChip(ctx, startX + (chipW + gap) * 3, y, chipW, h, 'coins', 'Coins Spent', profile.economy.lifetimeSpent.coins, COLOURS.red);
}

function drawEconomyChip(ctx, x, y, w, h, iconKey, label, value, accent, prefix = '') {
    roundedRectWithShadow(ctx, x, y, w, h, 16, COLOURS.card, COLOURS.cardShadow, 10, 4);
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, 16);
    ctx.stroke();

    const iconSize = 40;
    const iconX = x + 16;
    const iconY = y + h / 2 - iconSize / 2;
    ctx.beginPath();
    ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4D6';
    ctx.fill();
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const icon = getIconFromCache(iconKey);
    if (icon) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 - 3, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(icon, iconX + 3, iconY + 3, iconSize - 6, iconSize - 6);
        ctx.restore();
    }

    const textX = iconX + iconSize + 14;
    ctx.font = '13px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(label.toUpperCase(), textX, y + h / 2 - 6);

    ctx.font = '22px FredokaOne';
    ctx.fillStyle = accent;
    ctx.fillText(`${prefix}${formatNumber(value)}`, textX, y + h / 2 + 22);
}

function drawCurrentEventChip(ctx, x, y, w, h, profile) {
    const active = profile.events?.active;
    const hasEvent = Boolean(active?.key);

    roundedRectWithShadow(ctx, x, y, w, h, 16, hasEvent ? COLOURS.eventBg : COLOURS.card, COLOURS.cardShadow, 10, 4);
    ctx.strokeStyle = hasEvent ? COLOURS.eventBorder : COLOURS.border;
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, x, y, w, h, 16);
    ctx.stroke();

    ctx.font = '13px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText('CURRENT EVENT', x + 20, y + 22);

    if (hasEvent) {
        const label = EVENT_LABELS[active.key] ?? active.key;
        ctx.font = '18px FredokaOne';
        ctx.fillStyle = COLOURS.red;
        ctx.fillText(`⚡ ${label}`, x + 20, y + h - 14);

        if (active.endsAt) {
            const msLeft = new Date(active.endsAt).getTime() - Date.now();
            if (msLeft > 0) {
                const minsLeft = Math.max(1, Math.round(msLeft / 60000));
                ctx.font = '13px FredokaOne';
                ctx.fillStyle = COLOURS.muted;
                ctx.textAlign = 'right';
                ctx.fillText(`ENDS IN ${minsLeft}M`, x + w - 18, y + h - 14);
                ctx.textAlign = 'left';
            }
        }
    } else {
        ctx.font = '16px FredokaOne';
        ctx.fillStyle = COLOURS.muted;
        ctx.fillText('NO ACTIVE EVENT', x + 20, y + h - 14);
    }
}

function drawNextEventChip(ctx, x, y, w, h, profile) {
    roundedRectWithShadow(ctx, x, y, w, h, 16, COLOURS.card, COLOURS.cardShadow, 10, 4);
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, x, y, w, h, 16);
    ctx.stroke();

    ctx.font = '13px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText('NEXT EVENT', x + 20, y + 22);

    const nextAt = profile.events?.nextEventAt;
    const msLeft = nextAt ? new Date(nextAt).getTime() - Date.now() : null;

    if (msLeft != null && msLeft > 0) {
        const minsLeft = Math.max(1, Math.round(msLeft / 60000));
        ctx.font = '18px FredokaOne';
        ctx.fillStyle = COLOURS.text;
        ctx.fillText(`In ${minsLeft}m`, x + 20, y + h - 14);
    } else if (msLeft != null) {
        ctx.font = '16px FredokaOne';
        ctx.fillStyle = COLOURS.muted;
        ctx.fillText('DUE ANY MOMENT', x + 20, y + h - 14);
    } else {
        ctx.font = '16px FredokaOne';
        ctx.fillStyle = COLOURS.muted;
        ctx.fillText('NOT SCHEDULED', x + 20, y + h - 14);
    }
}

function drawEventRow(ctx, profile, y) {
    const x = 50;
    const totalW = 800;
    const gap = 22;
    const halfW = (totalW - gap) / 2;
    const h = EVENT_BANNER_H;

    drawCurrentEventChip(ctx, x, y, halfW, h, profile);
    drawNextEventChip(ctx, x + halfW + gap, y, halfW, h, profile);
}

function getRarityFill(ctx, rarity, x0, y0, x1, y1) {
    const def = RARITY_COLOURS[rarity] || RARITY_COLOURS.common;
    if (def.gradient) {
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, def.gradient[0]);
        grad.addColorStop(1, def.gradient[1]);
        return grad;
    }
    return def.text;
}

function drawPuffyStarShape(ctx, cx, cy, outerR, innerR, roundness = 0.65) {
    const points = 5;
    const verts = [];
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / points) * i - Math.PI / 2;
        verts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    }

    ctx.beginPath();
    const n = verts.length;
    for (let i = 0; i < n; i++) {
        const curr = verts[i];
        const next = verts[(i + 1) % n];
        const prev = verts[(i - 1 + n) % n];

        const distPrev = Math.hypot(curr.x - prev.x, curr.y - prev.y);
        const distNext = Math.hypot(next.x - curr.x, next.y - curr.y);
        const rPrev = distPrev * roundness * 0.5;
        const rNext = distNext * roundness * 0.5;

        const startX = curr.x + ((prev.x - curr.x) / distPrev) * rPrev;
        const startY = curr.y + ((prev.y - curr.y) / distPrev) * rPrev;
        const endX = curr.x + ((next.x - curr.x) / distNext) * rNext;
        const endY = curr.y + ((next.y - curr.y) / distNext) * rNext;

        if (i === 0) ctx.moveTo(startX, startY);
        else ctx.lineTo(startX, startY);
        ctx.quadraticCurveTo(curr.x, curr.y, endX, endY);
    }
    ctx.closePath();
}

function drawStarsRow(ctx, x, y, rarity, stars) {
    const outerR = 12;
    const innerR = 6.5;
    const spacing = 27;
    const fill = getRarityFill(ctx, rarity, x, y - outerR, x + spacing * 4 + outerR, y + outerR);

    for (let i = 0; i < 5; i++) {
        const cx = x + i * spacing + outerR;
        drawPuffyStarShape(ctx, cx, y, outerR, innerR);
        if (i < stars) {
            ctx.fillStyle = fill;
            ctx.fill();
        } else {
            ctx.strokeStyle = COLOURS.starEmpty;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }
}

function drawTierPill(ctx, x, y, rarity) {
    const label = rarity.toUpperCase();
    ctx.font = '14px FredokaOne';
    const w = ctx.measureText(label).width + 20;
    const h = 26;
    const def = RARITY_COLOURS[rarity] || RARITY_COLOURS.common;

    roundedRectPath(ctx, x, y, w, h, 13);
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
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, 13);
    ctx.stroke();

    ctx.fillStyle = def.gradient
        ? (() => {
              const textGrad = ctx.createLinearGradient(x, y, x + w, y);
              textGrad.addColorStop(0, def.gradient[0]);
              textGrad.addColorStop(1, def.gradient[1]);
              return textGrad;
          })()
        : def.text;
    ctx.fillText(label, x + 10, y + h / 2 + 5);

    return w;
}

async function drawActiveRecipeCard(ctx, profile, x, y, w, h) {
    const entry = profile.recipes.unlocked.find((r) => r.isActive);

    roundedRectWithShadow(ctx, x, y, w, h, 22, COLOURS.card, COLOURS.cardShadow);
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, x, y, w, h, 22);
    ctx.stroke();

    ctx.font = '16px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText('ACTIVE RECIPE', x + 34, y + 36);

    if (!entry) {
        ctx.font = '22px FredokaOne';
        ctx.fillStyle = COLOURS.muted;
        ctx.fillText('No recipe currently active', x + 34, y + 100);
        return;
    }

    const def = RECIPES.find((r) => r.id === entry.key);
    entry.stars = calculateStars(entry);
    const bonuses = getMasteryBonuses(entry);
    const effectivePrice = def ? Math.round(def.sellPrice * bonuses.sellPriceMultiplier) : null;

    const imgSize = 96;
    const imgX = x + 26;
    const imgY = y + 50;
    ctx.beginPath();
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4D6';
    ctx.fill();
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (def?.image) {
        const drinkImg = await getDrinkImageFromCache(def.image);
        if (drinkImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2 - 3, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(drinkImg, imgX + 3, imgY + 3, imgSize - 6, imgSize - 6);
            ctx.restore();
        }
    }

    const textX = imgX + imgSize + 22;
    const textW = x + w - textX - 24;

    ctx.font = '28px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText(def?.name ?? entry.key, textX, imgY + 24);

    const tierPillW = drawTierPill(ctx, textX, imgY + 36, entry.rarity);

    let priceW = 0;
    if (effectivePrice != null) {
        ctx.font = '14px FredokaOne';
        const priceLabel = `$${formatNumber(effectivePrice)}`;
        const priceX = textX + tierPillW + 10;
        priceW = ctx.measureText(priceLabel).width + 20;
        roundedRect(ctx, priceX, imgY + 36, priceW, 26, 13, COLOURS.greenSoft);
        ctx.strokeStyle = COLOURS.green + '99';
        ctx.lineWidth = 1.2;
        roundedRectPath(ctx, priceX, imgY + 36, priceW, 26, 13);
        ctx.stroke();
        ctx.fillStyle = '#2E8B39';
        ctx.fillText(priceLabel, priceX + 10, imgY + 54);
    }

    const starsX = textX + tierPillW + (priceW ? priceW + 20 : 10);
    drawStarsRow(ctx, starsX, imgY + 49, entry.rarity, entry.stars);

    // Mastery status badge, top-right
    if (entry.stars === 5) {
        const masterCheck = canMaster(entry, profile.prestige.level);

        let badgeLabel = null;
        let badgeColour = COLOURS.green;
        let badgeBg = COLOURS.greenSoft;

        if (masterCheck.ok) {
            badgeLabel = 'READY TO MASTER';
        } else if (masterCheck.reason === 'PRESTIGE_LOCKED') {
            badgeLabel = 'PRESTIGE LOCKED';
            badgeColour = COLOURS.red;
            badgeBg = '#F0664E1F';
        } else if (masterCheck.reason === 'MAX_TIER') {
            badgeLabel = 'MAX TIER';
            badgeColour = '#A1A1AA';
            badgeBg = '#A1A1AA1F';
        }

        if (badgeLabel) {
            ctx.font = '16px FredokaOne';
            const badgeTextW = ctx.measureText(badgeLabel).width;
            const badgePadX = 14;
            const badgeW = badgeTextW + badgePadX * 2;
            const badgeH = 32;
            const badgeX = x + w - badgeW - 24;
            const badgeY = y + 22;

            roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2, badgeBg);

            ctx.strokeStyle = badgeColour + '66';
            ctx.lineWidth = 1.5;
            roundedRectPath(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
            ctx.stroke();

            ctx.fillStyle = badgeColour;
            ctx.fillText(badgeLabel, badgeX + badgePadX, badgeY + badgeH / 2 + 5);
        }
    }

    if (def?.description) {
        ctx.font = '15px FredokaOne';
        ctx.fillStyle = COLOURS.subtitle;
        const lines = wrapText(ctx, def.description, textW, 2);
        lines.forEach((line, i) => {
            ctx.fillText(line, textX, imgY + 88 + i * 20);
        });
    }

    const barX = x + 34;
    const barY = imgY + imgSize + 40;
    const barW = w - 68;
    const barH = 16;
    roundedRect(ctx, barX, barY, barW, barH, barH / 2, COLOURS.progressBg);

    const fraction = getStarProgressFraction(entry);
    if (fraction > 0) {
        const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        fillGrad.addColorStop(0, COLOURS.progressFillA);
        fillGrad.addColorStop(1, COLOURS.progressFillB);
        ctx.save();
        roundedRectPath(ctx, barX, barY, barW, barH, barH / 2);
        ctx.clip();
        ctx.fillStyle = fillGrad;
        ctx.fillRect(barX, barY, barW * fraction, barH);
        ctx.restore();
    }
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1;
    roundedRectPath(ctx, barX, barY, barW, barH, barH / 2);
    ctx.stroke();

    // Ingredients label + chips
    let servedTextY = barY + 40;
    if (def?.ingredients?.length) {
        ctx.font = '16px FredokaOne';
        ctx.fillStyle = COLOURS.subtitle;
        ctx.fillText('INGREDIENTS', x + 34, barY + 40);

        const chipY = barY + 56;
        const chipSize = 46;
        const chipGap = 14;
        let chipX = x + 34;
        def.ingredients.slice(0, 10).forEach((ing) => {
            drawIngredientChip(ctx, chipX, chipY, chipSize, ing);
            chipX += chipSize + chipGap;
        });

        servedTextY = chipY + chipSize + 34;
    }

    ctx.font = '15px FredokaOne';
    ctx.fillStyle = COLOURS.muted;
    ctx.textAlign = 'center';
    ctx.fillText(`served ${formatNumber(entry.progress?.customersServed ?? 0)} customers  •  $${formatNumber(entry.progress?.revenueEarned ?? 0)} earned`, x + w / 2, servedTextY);
    ctx.textAlign = 'left';
}

function drawIngredientChip(ctx, x, y, size, ing) {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4D6';
    ctx.fill();
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const img = getIngredientFromCache(ing.id);
    if (img) {
        const pad = size * 0.16;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2 - pad / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x + pad / 2, y + pad / 2, size - pad, size - pad);
        ctx.restore();
    }

    const qtyLabel = `${ing.amount}x`;
    ctx.font = "13px FredokaOne";
    const qtyW = ctx.measureText(qtyLabel).width;
    const qtyPadX = 6;
    const qtyPillW = qtyW + qtyPadX * 2;
    const qtyPillH = 18;
    const qtyX = x + size - qtyPillW + 6;
    const qtyY = y + size - qtyPillH + 6;
    roundedRect(ctx, qtyX, qtyY, qtyPillW, qtyPillH, qtyPillH / 2, COLOURS.title);
    ctx.fillStyle = '#FFFDF6';
    ctx.fillText(qtyLabel, qtyX + qtyPadX, qtyY + qtyPillH / 2 + 4.5);
}

function drawFooter(ctx, width, height, profile) {
    ctx.font = '17px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';

    const line1 = [
        `${formatNumber(profile.recipes.unlocked.length)} recipes unlocked`,
        `${formatNumber(profile.staff.length)} staff hired`,
        `${formatNumber(profile.achievements.length)} achievements`,
        `Prestige ${formatNumber(profile.prestige.level)}`,
    ].join('   •   ');

    const line2 = [
        `${formatNumber(profile.customers.totalServed)} customers served`,
        `${formatNumber(profile.customers.cupsSold)} cups sold`,
        `$${formatNumber(profile.customers.totalTipsEarned)} in tips`,
    ].join('   •   ');

    ctx.fillText(line1, width / 2, height - 44);
    ctx.fillText(line2, width / 2, height - 20);
    ctx.textAlign = 'left';
}