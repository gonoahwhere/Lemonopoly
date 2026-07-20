import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { INGREDIENTS } from "../data/ingredients.js";
import { getIngredientFromCache } from "../data/ingredientImages.js";
import { COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { wrapText } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const TYPE_COLOURS = {
    Base: { text: '#8A7548', bg: '#8A75481F', border: '#8A754866' },
    Drink: { text: '#4FBF5B', bg: '#4FBF5B1F', border: '#4FBF5B66' },
    Herb: { gradient: ['#134E13', '#3E8E41'], border: '#3E8E4173' },
    Fruit: { gradient: ['#FDC830', '#F37335'], border: '#F3733573' },
    Sweetener: { gradient: ['#FF8C42', '#E85D75'], border: '#E85D7580' },
    Spice: { gradient: ['#FF416C', '#FF4B2B'], border: '#FF412C73' },
    Garnish: { gradient: ['#C471ED', '#7B2FF7'], border: '#7B2FF773' },
    Premium: { gradient: ['#D4A017', '#C026D3'], border: '#C026D380' },
    Event: { gradient: ['#5D5FEF', '#232526'], border: '#5D5FEF73' },
};

const TYPE_ORDER = ['Base', 'Drink', 'Herb', 'Fruit', 'Sweetener', 'Spice', 'Garnish', 'Premium', 'Event'];

const INGREDIENTS_PER_PAGE = 20;
const COLUMNS = 5;

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function getTypeFill(ctx, type, x0, y0, x1, y1) {
    const def = TYPE_COLOURS[type] || TYPE_COLOURS.Base;
    if (def.gradient) {
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, def.gradient[0]);
        grad.addColorStop(1, def.gradient[1]);
        return grad;
    }
    return def.text;
}

function getTypeBorder(type) {
    const def = TYPE_COLOURS[type] || TYPE_COLOURS.Base;
    return def.border;
}

function buildTypePages(allIngredients, perPage) {
    const byType = new Map();
    for (const ing of allIngredients) {
        if (!byType.has(ing.type)) byType.set(ing.type, []);
        byType.get(ing.type).push(ing);
    }

    const orderedTypes = [ ...TYPE_ORDER.filter((t) => byType.has(t)), ...[...byType.keys()].filter((t) => !TYPE_ORDER.includes(t)) ];

    const pages = [];
    for (const type of orderedTypes) {
        const items = byType.get(type);
        const totalPagesInType = Math.max(1, Math.ceil(items.length / perPage));
        for (let p = 0; p < totalPagesInType; p++) {
            pages.push({
                type,
                items: items.slice(p * perPage, (p + 1) * perPage),
                pageInType: p + 1,
                totalPagesInType,
            });
        }
    }
    return pages;
}

export function getIngredientBookPageCount() {
    const allIngredients = Object.entries(INGREDIENTS).map(([id, data]) => ({ id, ...data }));
    return buildTypePages(allIngredients, INGREDIENTS_PER_PAGE).length;
}

export async function renderIngredientBook(player, page = 1) {
    const allIngredients = Object.entries(INGREDIENTS).map(([id, data]) => ({ id, ...data }));
    const typePages = buildTypePages(allIngredients, INGREDIENTS_PER_PAGE);
    const totalPages = typePages.length;
    const pageIndex = Math.min(Math.max(page, 1), totalPages) - 1;
    const current = typePages[pageIndex];

    const width = 900;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, width, height);
    drawHeader(ctx, width, page, totalPages);
    const gridStartY = drawTypePill(ctx, width, current.type, current.pageInType, current.totalPagesInType);
    drawIngredientGrid(ctx, current.items, width, gridStartY);
    drawFooter(ctx, width, height, allIngredients.length);

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

function drawHeader(ctx, width, page, totalPages) {
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
    ctx.fillText("Ingredient Index", 54, 112);

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

function drawTypePill(ctx, width, type, pageInType, totalPagesInType) {
    const def = TYPE_COLOURS[type] || TYPE_COLOURS.Base;
    const label = totalPagesInType > 1 ? `${type.toUpperCase()} \u2022 ${pageInType}/${totalPagesInType}` : type.toUpperCase();

    ctx.font = "20px FredokaOne";
    const pillPadX = 20;
    const pillW = ctx.measureText(label).width + pillPadX * 2;
    const pillH = 42;
    const cx = width / 2;
    const pillX = cx - pillW / 2;
    const pillY = 168;

    roundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    if (def.gradient) {
        const grad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
        grad.addColorStop(0, def.gradient[0]);
        grad.addColorStop(1, def.gradient[1]);
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    } else {
        ctx.fillStyle = def.bg;
        ctx.fill();
    }

    ctx.strokeStyle = def.border;
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.stroke();

    ctx.fillStyle = def.gradient
        ? (() => {
              const textGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
              textGrad.addColorStop(0, def.gradient[0]);
              textGrad.addColorStop(1, def.gradient[1]);
              return textGrad;
          })()
        : def.text;
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, pillY + pillH / 2 + 7);
    ctx.textAlign = 'left';
    return pillY + pillH + 75;
}

function drawIngredientGrid(ctx, ingredients, width, gridTop) {
    const marginX = 50;
    const contentW = width - marginX * 2;
    const colWidth = contentW / COLUMNS;
    const circleSize = 84;
    const rowHeight = 186;

    ingredients.forEach((ingredient, i) => {
        const col = i % COLUMNS;
        const row = Math.floor(i / COLUMNS);
        const cx = marginX + colWidth * col + colWidth / 2;
        const cy = gridTop + row * rowHeight;
        drawIngredientTile(ctx, cx, cy, circleSize, ingredient, colWidth - 16);
    });
}

function drawIngredientTile(ctx, cx, cy, size, ingredient, maxTextWidth) {
    const type = ingredient.type;
    const borderColour = getTypeBorder(type);

    ctx.beginPath();
    ctx.arc(cx, cy, size / 2 + 4, 0, Math.PI * 2);
    ctx.strokeStyle = borderColour;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = getTypeFill(ctx, type, cx - size / 2, cy, cx + size / 2, cy);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = getTypeFill(ctx, type, cx - size / 2, cy, cx + size / 2, cy);
    ctx.lineWidth = 3;
    ctx.stroke();

    const img = getIngredientFromCache(ingredient.id);
    if (img) {
        const pad = size * 0.16;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2 - pad / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, cx - size / 2 + pad / 2, cy - size / 2 + pad / 2, size - pad, size - pad);
        ctx.restore();
    }

    ctx.font = '15px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.textAlign = 'center';
    const lines = wrapText(ctx, ingredient.name, maxTextWidth, 2);
    lines.forEach((line, i) => {
        ctx.fillText(line, cx, cy + size / 2 + 28 + i * 17);
    });

    ctx.textAlign = 'left';
}

function drawFooter(ctx, width, height, totalIngredients) {
    ctx.font = '25px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';
    ctx.fillText(`\u2022 ${totalIngredients} ingredients to discover \u2022`, width / 2, height - 24);
    ctx.textAlign = 'left';
}