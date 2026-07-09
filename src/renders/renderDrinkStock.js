import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { RECIPES } from "../data/recipes.js";
import { getDrinkImageFromCache } from "../data/drinkImages.js";
import { COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { wrapText, formatNumber } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

// Ring / pill colour per recipe rarity
const RARITY_COLOURS = {
    common: '#8A7548',
    uncommon: '#4FBF5B',
    rare: '#3B82C4',
    epic: '#9B4FD1',
    legendary: '#E7A800',
    mythic: '#F0664E',
    divine: '#F47FFF',
    cosmic: '#5B4FD1',
    transcendent: '#1610D2',
    ancient: '#5B5B5B',
    primal: '#671414',
    eternal: '#2E8B39',
    exotic: '#ff7f24',
};

const OWNED_DRINKS_PER_PAGE = 12;
const COLUMNS = 4;

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function rarityColour(rarity) {
    return RARITY_COLOURS[(rarity || '').toLowerCase()] || COLOURS.muted;
}

export async function renderDrinkStock(player, page = 1) {
    const stockList = player?.drinks || [];
    const stockByKey = new Map(stockList.map(stock => [stock.key, stock]));

    const ownedDrinks = RECIPES
        .map(recipe => ({
            ...recipe,
            quantity: stockByKey.get(recipe.id)?.quantity || 0,
        }))
        .filter(drink => drink.quantity > 0);

    const start = (page - 1) * OWNED_DRINKS_PER_PAGE;
    const pageDrinks = ownedDrinks.slice(start, start + OWNED_DRINKS_PER_PAGE);

    const width = 900;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, width, height);
    drawHeader(ctx, width, page, ownedDrinks.length);
    drawDrinkGrid(ctx, pageDrinks, width, 175);
    drawFooter(ctx, width, height, ownedDrinks.length);

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

function drawHeader(ctx, width, page, totalOwned) {
    const totalPages = Math.max(1, Math.ceil(totalOwned / OWNED_DRINKS_PER_PAGE));

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
    ctx.fillText("My Drinks", 54, 112);

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

function drawDrinkGrid(ctx, drinks, width, startY) {
    const marginX = 50;
    const contentW = width - marginX * 2;
    const colWidth = contentW / COLUMNS;
    const circleSize = 120;
    const rowHeight = 232;
    const gridTop = startY + 60;

    drinks.forEach((drink, i) => {
        const col = i % COLUMNS;
        const row = Math.floor(i / COLUMNS);
        const cx = marginX + colWidth * col + colWidth / 2;
        const cy = gridTop + row * rowHeight;
        drawDrinkTile(ctx, cx, cy, circleSize, drink, colWidth - 16);
    });
}

function drawDrinkTile(ctx, cx, cy, size, drink, maxTextWidth) {
    const colour = rarityColour(drink.rarity);

    ctx.beginPath();
    ctx.arc(cx, cy, size / 2 + 4, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(colour, 0.25);
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(colour, 0.25);
    ctx.fill();
    ctx.strokeStyle = colour;
    ctx.lineWidth = 3;
    ctx.stroke();

    const img = getDrinkImageFromCache(drink.image);
    if (img) {
        const pad = size * 0.16;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2 - pad / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, cx - size / 2 + pad / 2, cy - size / 2 + pad / 2, size - pad, size - pad);
        ctx.restore();
    }

    drawQuantityBadge(ctx, cx, cy, size, drink.quantity);

    ctx.font = '20px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.textAlign = 'center';
    const lines = wrapText(ctx, drink.name, maxTextWidth, 2);
    lines.forEach((line, i) => {
        ctx.fillText(line, cx, cy + size / 2 + 30 + i * 24);
    });

    const pillY = cy + size / 2 + 30 + lines.length * 24 - 2;
    drawRarityPill(ctx, cx, pillY, drink.rarity, colour);

    ctx.textAlign = 'left';
}

function drawQuantityBadge(ctx, cx, cy, size, quantity) {
    const label = `x${formatNumber(quantity)}`;
    ctx.font = '20px FredokaOne';
    const textW = ctx.measureText(label).width;
    const padX = 12;
    const pillW = textW + padX * 2;
    const pillH = 30;
    const pillX = cx + size / 2 - pillW + 6;
    const pillY = cy + size / 2 - pillH + 6;

    roundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, COLOURS.title);
    ctx.fillStyle = '#FFFDF6';
    ctx.font = '20px FredokaOne';
    ctx.textAlign = 'center';
    ctx.fillText(label, pillX + pillW / 2, pillY + pillH / 2 + 7);
    ctx.textAlign = 'left';
}

function drawRarityPill(ctx, cx, y, rarity, colour) {
    const label = (rarity || 'Common').toUpperCase();
    ctx.font = '15px FredokaOne';
    const textW = ctx.measureText(label).width;
    const padX = 12;
    const pillW = textW + padX * 2;
    const pillH = 22;
    const pillX = cx - pillW / 2;

    roundedRect(ctx, pillX, y, pillW, pillH, pillH / 2, hexToRgba(colour, 0.15));
    ctx.strokeStyle = hexToRgba(colour, 0.5);
    ctx.lineWidth = 1;
    roundedRectPath(ctx, pillX, y, pillW, pillH, pillH / 2);
    ctx.stroke();

    ctx.fillStyle = colour;
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, y + pillH / 2 + 5);
}

function drawFooter(ctx, width, height, totalOwned) {
    ctx.font = '25px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';
    const label = totalOwned === 0 ? "• You haven't mixed any drinks yet •" : `• ${totalOwned} drink${totalOwned === 1 ? '' : 's'} in your inventory •`;
    ctx.fillText(label, width / 2, height - 24);
    ctx.textAlign = 'left';
}