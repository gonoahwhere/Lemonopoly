
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { PREMIUM_PERKS } from '../data/passBenefits.js';
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { wrapText } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    premium: '#9B4FD1',
    premiumSoft: 'rgba(155,79,209,0.12)',
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

function drawStarBullet(ctx, cx, cy, outerR = 9) {
    drawPuffyStarShape(ctx, cx, cy, outerR, outerR * 0.5);
    ctx.fillStyle = COLOURS.premium;
    ctx.fill();
}

function drawHeader(ctx, width, isPremium) {
    ctx.font = "42px FredokaOne";
    const titleGrad = ctx.createLinearGradient(50, 20, 450, 20);
    titleGrad.addColorStop(0, COLOURS.title);
    titleGrad.addColorStop(1, '#FFDD70');

    ctx.strokeStyle = COLOURS.text;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeText('PREMIUM PASS', 50, 62);

    ctx.fillStyle = titleGrad;
    ctx.fillText('PREMIUM PASS', 50, 62);

    ctx.font = '20px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText('Perks & Benefits', 54, 90);

    // Status pill, top right
    const label = isPremium ? 'ACTIVE' : 'INACTIVE';
    const colour = isPremium ? COLOURS.premium : COLOURS.muted;
    const bg = isPremium ? COLOURS.premiumSoft : 'rgba(168,147,79,0.10)';

    const fontSize = 16;
    const padX = 14;
    const pillH = 34;

    ctx.font = `${fontSize}px FredokaOne`;
    const pillW = ctx.measureText(label).width + padX * 2;
    drawPill(ctx, width - 50 - pillW, 26, label, colour, bg, undefined, fontSize, padX, pillH);

    const divGrad = ctx.createLinearGradient(45, 0, width - 45, 0);
    divGrad.addColorStop(0, 'rgba(155,79,209,0)');
    divGrad.addColorStop(0.5, 'rgba(155,79,209,0.5)');
    divGrad.addColorStop(1, 'rgba(155,79,209,0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 112);
    ctx.lineTo(width - 45, 112);
    ctx.stroke();
}

function drawPerkRow(ctx, x, y, w, perk, measureOnly = false) {
    ctx.font = '17px FredokaOne';
    const lines = wrapText(ctx, perk, w - 44 - 20, 3);
    const lineHeight = 15;

    if (!measureOnly) {
        drawStarBullet(ctx, x + 22, y + 13, 9);
        ctx.fillStyle = COLOURS.text;
        lines.forEach((line, i) => {
            ctx.fillText(line, x + 44, y + 18 + i * lineHeight);
        });
    }

    return lines.length;
}

function drawPill(ctx, x, y, label, colour, bg, borderColour, fontSize = 13, padX = 10, h = 26) {
    ctx.font = `${fontSize}px FredokaOne`;
    const w = ctx.measureText(label).width + padX * 2;
    roundedRect(ctx, x, y, w, h, h / 2, bg);
    ctx.strokeStyle = borderColour ?? colour + '77';
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, h / 2);
    ctx.stroke();
    ctx.fillStyle = colour;
    ctx.fillText(label, x + padX, y + h / 2 + fontSize * 0.35);
    return w;
}

export async function renderPremiumPerks(isPremium = false) {
    const width = 700;
    const HEADER_H = 130;
    const CARD_X = 50;
    const CARD_W = width - 100;
    const CARD_PAD_TOP = 28;
    const CARD_PAD_BOTTOM = 28;
    const ROW_MIN_H = 30;
    const ROW_GAP = 1;
    const FOOTER_H = 50;

    const measureCanvas = createCanvas(width, 100);
    const measureCtx = measureCanvas.getContext('2d');
    let rowHeights = PREMIUM_PERKS.map((perk) => {
        const lineCount = drawPerkRow(measureCtx, CARD_X + 20, 0, CARD_W - 40, perk, true);
        return Math.max(ROW_MIN_H, lineCount * 19 + 8);
    });

    const cardH = CARD_PAD_TOP + rowHeights.reduce((a, b) => a + b, 0) + ROW_GAP * (rowHeights.length - 1) + CARD_PAD_BOTTOM;
    const height = HEADER_H + cardH + 24 + FOOTER_H;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, width, height);
    drawHeader(ctx, width, isPremium);

    const cardY = HEADER_H;
    roundedRectWithShadow(ctx, CARD_X, cardY, CARD_W, cardH, 20, COLOURS.card, COLOURS.cardShadow);
    ctx.strokeStyle = COLOURS.premium + '55';
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, CARD_X, cardY, CARD_W, cardH, 20);
    ctx.stroke();

    let rowY = cardY + CARD_PAD_TOP;
    PREMIUM_PERKS.forEach((perk, i) => {
        drawPerkRow(ctx, CARD_X + 20, rowY, CARD_W - 40, perk);
        rowY += rowHeights[i] + ROW_GAP;
    });

    ctx.font = '16px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';
    ctx.fillText(
        isPremium ? 'thanks for being a premium pass member!' : 'unlock the premium pass to enjoy these perks',
        width / 2, height - FOOTER_H / 2 + 5
    );
    ctx.textAlign = 'left';

    return canvas.toBuffer('image/png');
}