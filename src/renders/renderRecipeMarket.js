import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { RECIPES } from "../data/recipes.js";
import { getRecipeUnlock } from "../data/recipeUnlocks.js";
import { getIngredientFromCache } from "../data/ingredientImages.js";
import { getDrinkImageFromCache } from "../data/drinkImages.js";
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { wrapText } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    progressBg: '#F1E6BE',
    progressFillA: '#B7E75A',
    progressFillB: '#5FCB4F',
    locked: '#4A3A1A8C',
    marketGold: '#E7A800',
    marketGoldSoft: '#E7A8001F',
};

const RARITY_COLOURS = {
    Common: {
        text: '#8A7548',
        bg: '#8A75481F',
        border: '#8A754866'
    },
    Rare: {
        text: '#3B82C4',
        bg: '#3B82C41F',
        border: '#3B82C466'
    },
    Epic: {
        text: '#9B4FD1',
        bg: '#9B4FD11F',
        border: '#9B4FD166'
    },
};

const EXCLUDED_FROM_MARKET = new Set(['classic_lemonade']);

export function getMarketRecipes(player) {
    const ownedKeys = new Set((player?.recipes?.unlocked ?? []).map((r) => r.key));

    return RECIPES.filter((recipe) => {
        if (EXCLUDED_FROM_MARKET.has(recipe.id)) return false;
        if (ownedKeys.has(recipe.id)) return false;
        if (recipe.marketPrice === null || recipe.marketPrice === undefined) return false;
        const unlock = getRecipeUnlock(recipe, player);
        return unlock.progress >= 100;
    });
}

export async function renderRecipeMarket(player, page = 1) {
    const recipesPerPage = 3;
    const marketRecipes = getMarketRecipes(player);
    const start = (page - 1) * recipesPerPage;
    const pageRecipes = marketRecipes.slice(start, start + recipesPerPage);

    const width = 900;
    const height = 1200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, width, height);
    drawHeader(ctx, width, page, marketRecipes.length, recipesPerPage);
    await drawRecipes(ctx, pageRecipes);
    drawFooter(ctx, width, height, page, marketRecipes.length, recipesPerPage);

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
    ctx.fillText("Recipe Market", 54, 112);

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

function drawFooter(ctx, width, height, page, totalRecipes, perPage) {
    const totalPages = Math.max(1, Math.ceil(totalRecipes / perPage));
    ctx.font = '25px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';

    if (totalRecipes === 0) {
        ctx.fillText(`\u2022 No recipes on the market yet \u2022`, width / 2, height - 24);
    } else {
        ctx.fillText(`\u2022 ${totalPages} pages of recipes to purchase \u2022`, width / 2, height - 24);
    }
    ctx.textAlign = 'left';
}

async function drawRecipes(ctx, recipes) {
    const cardX = 50;
    const cardYStart = 175;
    const cardWidth = 800;
    const cardHeight = 305;
    const gap = 22;

    for (let i = 0; i < recipes.length; i++) {
        const y = cardYStart + i * (cardHeight + gap);
        await drawRecipeCard(ctx, recipes[i], cardX, y, cardWidth, cardHeight);
    }
}

async function drawRecipeCard(ctx, recipe, x, y, w, h) {
    roundedRectWithShadow(ctx, x, y, w, h, 22, COLOURS.card, COLOURS.cardShadow);

    ctx.save();
    roundedRectPath(ctx, x, y, w, h, 22);
    ctx.clip();
    ctx.fillStyle = COLOURS.green;
    ctx.fillRect(x, y, 6, h);
    ctx.restore();

    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, x, y, w, h, 22);
    ctx.stroke();

    // Drink image
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

    const drinkImg = await getDrinkImageFromCache(recipe.id);
    if (drinkImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2 - 3, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(drinkImg, imgX + 3, imgY + 3, imgSize - 6, imgSize - 6);
        ctx.restore();
    }

    // text block starts to the right of the image
    const textX = imgX + imgSize + 22;
    const textW = x + w - textX - 24;

    // Title
    ctx.font = '28px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText(recipe.name, textX, y + 44);

    // Rarity pill + sell price pill
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

    const priceLabel = `$${recipe.sellPrice}`;
    const priceX = textX + rarityW + 10;
    const priceW = ctx.measureText(priceLabel).width + 20;
    roundedRect(ctx, priceX, y + 56, priceW, 26, 13, COLOURS.greenSoft);
    ctx.strokeStyle = COLOURS.green + '99';
    roundedRectPath(ctx, priceX, y + 56, priceW, 26, 13);
    ctx.stroke();
    ctx.fillStyle = '#2E8B39';
    ctx.fillText(priceLabel, priceX + 10, y + 74);

    // Market price badge
    const marketLabel = `$${recipe.marketPrice}`;
    ctx.font = '18px FredokaOne';
    const badgeTextW = ctx.measureText(marketLabel).width;
    const badgePadX = 16;
    const badgeW = badgeTextW + badgePadX * 2;
    const badgeH = 34;
    const badgeX = x + w - badgeW - 24;
    const badgeY = y + 22;
    roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2, COLOURS.marketGoldSoft);
    ctx.strokeStyle = COLOURS.marketGold + '66';
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
    ctx.stroke();
    ctx.fillStyle = COLOURS.marketGold;
    ctx.fillText(marketLabel, badgeX + badgePadX, badgeY + badgeH / 2 + 6);

    // Description
    ctx.font = '15px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    const descLines = wrapText(ctx, recipe.description, textW, 2);
    for (let i = 0; i < descLines.length; i++) {
        ctx.fillText(descLines[i], textX, y + 108 + i * 20);
    }

    const ingredientsLabelY = y + imgSize + 46;
    ctx.font = '16px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText('INGREDIENTS', x + 34, ingredientsLabelY);

    const chipY = ingredientsLabelY + 16;
    const chipSize = 46;
    const chipGap = 14;
    let chipX = x + 34;
    for (const ing of recipe.ingredients.slice(0, 10)) {
        await drawIngredientChip(ctx, chipX, chipY, chipSize, ing);
        chipX += chipSize + chipGap;
    }
}

async function drawIngredientChip(ctx, x, y, size, ing) {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4D6';
    ctx.fill();
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const img = await getIngredientFromCache(ing.id);
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