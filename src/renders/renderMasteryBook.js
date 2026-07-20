import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { RECIPES } from "../data/recipes.js";
import { getIngredientFromCache } from "../data/ingredientImages.js";
import { getDrinkImageFromCache } from "../data/drinkImages.js";
import { getMasteryBonuses, canMaster, getStarProgressFraction, calculateStars } from "../utils/recipeMastery.js";
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { wrapText } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    progressBg: '#F1E6BE',
    progressFillA: '#B7E75A',
    progressFillB: '#5FCB4F',
    starEmpty: '#8A754859',
};

// common -> mythic are flat colours. divine and up are gradients.
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

function getUnlockedRecipesForPlayer(player) {
    const unlockedMap = new Map(player.recipes.unlocked.map((r) => [r.key, r]));
    return RECIPES.filter((r) => unlockedMap.has(r.id)).map((r) => ({ ...r, entry: unlockedMap.get(r.id), }));
}

export async function renderMasteryBook(player, page = 1) {
    const recipesPerPage = 3;
    const unlockedRecipes = getUnlockedRecipesForPlayer(player);
    const start = (page - 1) * recipesPerPage;
    const pageRecipes = unlockedRecipes.slice(start, start + recipesPerPage);

    const width = 900;
    const height = 1200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, width, height);
    drawHeader(ctx, width, page, unlockedRecipes.length, recipesPerPage);
    await drawRecipes(ctx, pageRecipes, player);
    drawFooter(ctx, width, height, unlockedRecipes.length, recipesPerPage);

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

function drawHeader(ctx, width, page, totalRecipes, perPage) {
    const totalPages = Math.max(1, Math.ceil(totalRecipes / perPage));

    ctx.font = "58px FredokaOne";
    const titleGrad = ctx.createLinearGradient(50, 30, 520, 30);
    titleGrad.addColorStop(0, COLOURS.title);
    titleGrad.addColorStop(1, '#FFDD70');

    ctx.strokeStyle = COLOURS.text;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.strokeText('LEMONOPOLY', 50, 78);

    ctx.fillStyle = titleGrad;
    ctx.fillText("LEMONOPOLY", 50, 78);

    ctx.font = "26px FredokaOne";
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText("Mastery Book", 54, 112);

    const pageLabel = `PAGE ${page} / ${totalPages}`;
    ctx.font = "20px FredokaOne";
    const pillPadX = 20;
    const pillW = ctx.measureText(pageLabel).width + pillPadX * 2;
    const pillH = 42;
    const pillX = width - 50 - pillW;
    const pillY = 40;
    roundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, '#8A75481F');
    ctx.strokeStyle = '#8A754866';
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.stroke();
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(pageLabel, pillX + pillPadX, pillY + pillH / 2 + 7);

    const divGrad = ctx.createLinearGradient(45, 0, width - 45, 0);
    divGrad.addColorStop(0, '#E7A80000');
    divGrad.addColorStop(0.5, '#E7A80080');
    divGrad.addColorStop(1, '#E7A80000');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 145);
    ctx.lineTo(width - 45, 145);
    ctx.stroke();
}

function drawFooter(ctx, width, height, totalRecipes, perPage) {
    const totalPages = Math.max(1, Math.ceil(totalRecipes / perPage));
    ctx.font = '25px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';
    ctx.fillText(`\u2022 ${totalPages} page${totalPages === 1 ? '' : 's'} of mastered flavours \u2022`, width / 2, height - 24);
    ctx.textAlign = 'left';
}

async function drawRecipes(ctx, recipes, player) {
    const cardX = 50;
    const cardYStart = 175;
    const cardWidth = 800;
    const cardHeight = 305;
    const gap = 22;

    for (let i = 0; i < recipes.length; i++) {
        const y = cardYStart + i * (cardHeight + gap);
        await drawRecipeCard(ctx, recipes[i], player, cardX, y, cardWidth, cardHeight);
    }
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

async function drawRecipeCard(ctx, recipe, player, x, y, w, h) {
    const entry = recipe.entry;
    entry.stars = calculateStars(entry);
    const bonuses = getMasteryBonuses(entry);
    const effectivePrice = Math.round(recipe.sellPrice * bonuses.sellPriceMultiplier);
    const masterCheck = canMaster(entry, player.prestige.level);

    roundedRectWithShadow(ctx, x, y, w, h, 22, COLOURS.card, COLOURS.cardShadow);

    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, x, y, w, h, 22);
    ctx.stroke();

    const imgSize = 96;
    const imgX = x + 26;
    const imgY = y + 20;
    ctx.beginPath();
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4D6';
    ctx.fill();
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    const drinkImg = await getDrinkImageFromCache(recipe.image);
    if (drinkImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2 - 3, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(drinkImg, imgX + 3, imgY + 3, imgSize - 6, imgSize - 6);
        ctx.restore();
    }

    const textX = imgX + imgSize + 22;
    const textW = x + w - textX - 24;

    ctx.font = '28px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText(recipe.name, textX, y + 44);

    const tierPillW = drawTierPill(ctx, textX, y + 56, entry.rarity);

    ctx.font = '14px FredokaOne';
    const priceLabel = `$${effectivePrice}`;
    const priceX = textX + tierPillW + 10;
    const priceW = ctx.measureText(priceLabel).width + 20;
    roundedRect(ctx, priceX, y + 56, priceW, 26, 13, COLOURS.greenSoft);
    ctx.strokeStyle = COLOURS.green + '99';
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, priceX, y + 56, priceW, 26, 13);
    ctx.stroke();
    ctx.fillStyle = '#2E8B39';
    ctx.fillText(priceLabel, priceX + 10, y + 74);

    const starsX = priceX + priceW + 10;
    drawStarsRow(ctx, starsX, y + 69, entry.rarity, entry.stars);

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

    ctx.font = '15px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    const descLines = wrapText(ctx, recipe.description, textW, 2);
    for (let i = 0; i < descLines.length; i++) {
        ctx.fillText(descLines[i], textX, y + 108 + i * 20);
    }

    const barX = x + 34;
    const barY = y + imgSize + 68;
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

    ctx.font = '16px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText('INGREDIENTS', x + 34, barY + 42);

    const chipY = barY + 58;
    const chipSize = 46;
    const chipGap = 14;
    let chipX = x + 34;
    recipe.ingredients.slice(0, 8).forEach((ing) => {
        drawIngredientChip(ctx, chipX, chipY, chipSize, ing);
        chipX += chipSize + chipGap;
    });
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