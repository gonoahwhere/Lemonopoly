import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { RECIPES } from "../data/recipes.js";
import { getRecipeUnlock } from "../data/recipeUnlocks.js";
import { getIngredientFromCache } from "../data/ingredientImages.js";
import { getDrinkImageFromCache } from "../data/drinkImages.js";
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { wrapText, formatNumber } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    progressBg: '#F1E6BE',
    progressFillA: '#B7E75A',
    progressFillB: '#5FCB4F',
    locked: 'rgba(74, 58, 26, 0.55)',
};

const RARITY_COLOURS = {
    Common: { 
        text: '#8A7548', 
        bg: 'rgba(138,117,72,0.12)', 
        border: 'rgba(138,117,72,0.4)' 
    },
    Rare: { 
        text: '#3B82C4', 
        bg: 'rgba(59,130,196,0.12)', 
        border: 'rgba(59,130,196,0.4)' 
    },
    Epic: { 
        text: '#9B4FD1', 
        bg: 'rgba(155,79,209,0.12)', 
        border: 'rgba(155,79,209,0.4)' 
    },
};

const RECIPE_COLOURS = {
    ancient: { gradient: ['#D6D6D6', '#5B5B5B'], border: 'rgba(91,91,91,0.45)' },
};

export async function renderRecipeBook(player, page = 1) {
    const recipesPerPage = 3;
    const start = (page - 1) * recipesPerPage;
    const pageRecipes = RECIPES.slice(start, start + recipesPerPage);

    const width = 900;
    const height = 1200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, width, height);
    drawHeader(ctx, width, page, RECIPES.length, recipesPerPage);
    drawRecipes(ctx, pageRecipes, player);
    drawFooter(ctx, width, height, page, RECIPES.length, recipesPerPage);

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
    ctx.fillText("Recipe Book", 54, 112);

    const pageLabel = `PAGE ${page} / ${totalPages}`;
    ctx.font = "20px FredokaOne";
    const pillPadX = 20;
    const pillW = ctx.measureText(pageLabel).width + pillPadX * 2;
    const pillH = 42;
    const pillX = width - 50 - pillW;
    const pillY = 40;
    roundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, 'rgba(138, 117, 72, 0.12)');
    ctx.strokeStyle = 'rgba(138, 117, 72, 0.4)';
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.stroke();
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(pageLabel, pillX + pillPadX, pillY + pillH / 2 + 7);

    const divGrad = ctx.createLinearGradient(45, 0, width - 45, 0);
    divGrad.addColorStop(0, 'rgba(231,168,0,0)');
    divGrad.addColorStop(0.5, 'rgba(231,168,0,0.5)');
    divGrad.addColorStop(1, 'rgba(231,168,0,0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 145);
    ctx.lineTo(width - 45, 145);
    ctx.stroke();
}

function drawFooter(ctx, width, height, page, totalRecipes, perPage) {
    const totalPages = Math.max(1, Math.ceil(totalRecipes / perPage));
    ctx.font = '25px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';
    ctx.fillText(`\u2022 ${totalPages} pages of recipes to discover \u2022`, width / 2, height - 24);
    ctx.textAlign = 'left';
}

function drawRecipes(ctx, recipes, player) {
    const cardX = 50;
    const cardYStart = 175;
    const cardWidth = 800;
    const cardHeight = 305;
    const gap = 22;

    recipes.forEach((recipe, i) => {
        const y = cardYStart + i * (cardHeight + gap);
        drawRecipeCard(ctx, recipe, player, cardX, y, cardWidth, cardHeight);
    });
}

function drawRecipeCard(ctx, recipe, player, x, y, w, h) {
    const unlock = getRecipeUnlock(recipe, player);
    const meetsRequirement = unlock.progress >= 100;
    const isOwned = (player?.recipes?.unlocked ?? []).some((r) => r.key === recipe.id);

    let stateFill;
    let stateBorder;

    if (isOwned) {
        stateFill = COLOURS.green;
        stateBorder = COLOURS.green + '66';
    } else if (meetsRequirement) {
        const grad = ctx.createLinearGradient(x, y, x + 120, y);
        grad.addColorStop(0, RECIPE_COLOURS.ancient.gradient[0]);
        grad.addColorStop(1, RECIPE_COLOURS.ancient.gradient[1]);
        stateFill = grad;
        stateBorder = RECIPE_COLOURS.ancient.border;
    } else {
        stateFill = COLOURS.red;
        stateBorder = COLOURS.red + '66';
    }

    roundedRectWithShadow(ctx, x, y, w, h, 22, COLOURS.card, COLOURS.cardShadow);

    ctx.save();
    roundedRectPath(ctx, x, y, w, h, 22);
    ctx.clip();
    ctx.fillStyle = stateFill;
    ctx.fillRect(x, y, 6, h);
    ctx.restore();

    ctx.strokeStyle = stateBorder;
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

    const drinkImg = getDrinkImageFromCache(recipe.image);
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

    const rarity = RARITY_COLOURS[recipe.rarity] || RARITY_COLOURS.Common;
    ctx.font = '14px FredokaOne';

    const rarityLabel = recipe.rarity.toUpperCase();
    const rarityW = ctx.measureText(rarityLabel).width + 20;
    roundedRect(ctx, textX, y + 56, rarityW, 26, 13, rarity.bg);
    ctx.strokeStyle = rarity.border;
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, textX, y + 56, rarityW, 26, 13);
    ctx.stroke();
    ctx.fillStyle = rarity.text;
    ctx.fillText(rarityLabel, textX + 10, y + 74);

    const priceLabel = `$${formatNumber(recipe.sellPrice)}`;
    const priceX = textX + rarityW + 10;
    const priceW = ctx.measureText(priceLabel).width + 20;
    roundedRect(ctx, priceX, y + 56, priceW, 26, 13, COLOURS.greenSoft);
    ctx.strokeStyle = COLOURS.green + '99';
    roundedRectPath(ctx, priceX, y + 56, priceW, 26, 13);
    ctx.stroke();
    ctx.fillStyle = '#2E8B39';
    ctx.fillText(priceLabel, priceX + 10, y + 74);

    const badgeLabel = isOwned ? 'OWNED' : meetsRequirement ? 'PURCHASABLE' : unlock.text.toUpperCase();
    ctx.font = '18px FredokaOne';

    const badgeTextW = ctx.measureText(badgeLabel).width;
    const badgePadX = 16;
    const badgeW = badgeTextW + badgePadX * 2;
    const badgeH = 34;
    const badgeX = x + w - badgeW - 24;
    const badgeY = y + 22;

    let badgeFill;
    let badgeText;

    if (isOwned) {
        badgeFill = COLOURS.greenSoft;
        badgeText = COLOURS.green;
    } else if (meetsRequirement) {
        badgeFill = 'rgba(214,214,214,0.18)';
        const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY);
        grad.addColorStop(0, RECIPE_COLOURS.ancient.gradient[0]);
        grad.addColorStop(1, RECIPE_COLOURS.ancient.gradient[1]);
        badgeText = grad;
    } else {
        badgeFill = 'rgba(240,102,78,0.12)';
        badgeText = COLOURS.red;
    }

    roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2, badgeFill);
    ctx.strokeStyle = stateBorder;
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
    ctx.stroke();
    ctx.fillStyle = badgeText;
    ctx.fillText(badgeLabel, badgeX + badgePadX, badgeY + badgeH / 2 + 6);

    ctx.font = '15px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    const descLines = wrapText(ctx, recipe.description, textW, 2);
    descLines.forEach((line, i) => {
        ctx.fillText(line, textX, y + 108 + i * 20);
    });

    const barX = x + 34;
    const barY = y + imgSize + 60;
    const barW = w - 68;
    const barH = 16;
    roundedRect(ctx, barX, barY, barW, barH, barH / 2, COLOURS.progressBg);

    const percent = Math.max(0, Math.min(1, unlock.progress / 100));
    if (percent > 0) {
        const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        fillGrad.addColorStop(0, COLOURS.progressFillA);
        fillGrad.addColorStop(1, COLOURS.progressFillB);
        ctx.save();
        roundedRectPath(ctx, barX, barY, barW, barH, barH / 2);
        ctx.clip();
        ctx.fillStyle = fillGrad;
        ctx.fillRect(barX, barY, barW * percent, barH);
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
    recipe.ingredients.slice(0, 10).forEach((ing) => {
        drawIngredientChip(ctx, chipX, chipY, chipSize, ing);
        chipX += chipSize + chipGap;
    });

    if (!isOwned) {
        ctx.save();
        roundedRectPath(ctx, x, y, w, h, 22);
        ctx.clip();
        ctx.fillStyle = 'rgba(255,253,246,0.35)';
        ctx.fillRect(x, y, w, h);
        ctx.restore();
        drawLockBadge(ctx, x + w - 56, y + h - 56, 24);
    }
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

function drawLockBadge(ctx, cx, cy, r) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = COLOURS.locked;
    ctx.fill();

    ctx.save();
    ctx.strokeStyle = '#FFFDF6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 6, Math.PI, 0, false);
    ctx.stroke();
    roundedRect(ctx, cx - 8, cy - 4, 16, 12, 3, '#FFFDF6');
    ctx.restore();
}