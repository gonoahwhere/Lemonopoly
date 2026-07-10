import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { MONTHLY_CLAIMS } from '../data/passBenefits.js';
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { getIconFromCache } from '../data/iconImages.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    premium: '#9B4FD1',
    premiumSoft: 'rgba(155,79,209,0.12)',
    claimGold: '#FFC94D',
    boxFill: BASE_COLOURS.paperShade ?? '#FCF6E6',
};

const WIDTH = 700;
const HEADER_H = 130;
const OUTER_X = 50;
const CARD_PAD = 26;
const BOX_H = 76;
const BOX_GAP_X = 16;
const BOX_GAP_Y = 14;
const FOOTER_H = 50;
const COLS = 2;

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

function toDisplayName(idOrName) {
    return idOrName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatQuantity(n) {
    return `x${n.toLocaleString('en-US')}`;
}

function truncate(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let trimmed = text;
    while (trimmed.length > 1 && ctx.measureText(trimmed + '…').width > maxWidth) {
        trimmed = trimmed.slice(0, -1);
    }
    return trimmed + '…';
}

function drawHeader(ctx, width) {
    ctx.font = '42px FredokaOne';
    const titleGrad = ctx.createLinearGradient(50, 20, 450, 20);
    titleGrad.addColorStop(0, COLOURS.title);
    titleGrad.addColorStop(1, COLOURS.claimGold);

    ctx.strokeStyle = COLOURS.text;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeText('THE SACRED SQUEEZE', 50, 62);

    ctx.fillStyle = titleGrad;
    ctx.fillText('THE SACRED SQUEEZE', 50, 62);

    ctx.font = '20px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText('You have received The Sacred Squeeze', 54, 90);

    const monthLabel = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase();
    const fontSize = 15;
    const padX = 14;
    const pillH = 32;
    ctx.font = `${fontSize}px FredokaOne`;
    const pillW = ctx.measureText(monthLabel).width + padX * 2;
    const px = width - 50 - pillW;
    roundedRect(ctx, px, 28, pillW, pillH, pillH / 2, COLOURS.premiumSoft);
    ctx.strokeStyle = COLOURS.premium + '77';
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, px, 28, pillW, pillH, pillH / 2);
    ctx.stroke();
    ctx.fillStyle = COLOURS.premium;
    ctx.fillText(monthLabel, px + padX, 28 + pillH / 2 + fontSize * 0.35);

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

function drawPremiumFrame(ctx, x, y, w, h) {
    ctx.save();
    ctx.shadowColor = COLOURS.cardShadow ?? 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
    roundedRect(ctx, x, y, w, h, 24, COLOURS.card);
    ctx.restore();

    const borderGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    borderGrad.addColorStop(0, COLOURS.premium);
    borderGrad.addColorStop(0.5, '#E85A9B');
    borderGrad.addColorStop(1, COLOURS.claimGold);
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 3;
    roundedRectPath(ctx, x, y, w, h, 24);
    ctx.stroke();
}

function drawRewardBox(ctx, x, y, w, h, claim) {
    roundedRect(ctx, x, y, w, h, 14, COLOURS.boxFill);
    ctx.strokeStyle = COLOURS.border ?? 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, w, h, 14);
    ctx.stroke();

    const iconR = 23;
    const iconCx = x + 18 + iconR;
    const iconCy = y + h / 2;

    ctx.beginPath();
    ctx.arc(iconCx, iconCy, iconR, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = COLOURS.premium + '55';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    const img = getIconFromCache(claim.icon);
    if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(iconCx, iconCy, iconR - 5, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, iconCx - iconR + 5, iconCy - iconR + 5, (iconR - 5) * 2, (iconR - 5) * 2);
        ctx.restore();
    } else {
        ctx.font = '19px FredokaOne';
        ctx.fillStyle = COLOURS.premium;
        ctx.textAlign = 'center';
        ctx.fillText(toDisplayName(claim.name ?? claim.id).charAt(0), iconCx, iconCy + 7);
        ctx.textAlign = 'left';
    }

    const textX = iconCx + iconR + 16;
    const textMaxW = x + w - 16 - textX;

    ctx.font = '18px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'left';
    ctx.fillText(truncate(ctx, toDisplayName(claim.name ?? claim.id).toUpperCase(), textMaxW), textX, y + h / 2 - 8);

    ctx.font = 'bold 22px FredokaOne';
    ctx.fillStyle = COLOURS.premium;
    ctx.fillText(formatQuantity(claim.quantity), textX, y + h / 2 + 20);
}

export async function renderMonthlyClaim() {
    const cardW = WIDTH - OUTER_X * 2;
    const cols = Math.min(COLS, MONTHLY_CLAIMS.length) || 1;
    const rows = Math.ceil(MONTHLY_CLAIMS.length / cols);
    const boxW = (cardW - CARD_PAD * 2 - BOX_GAP_X * (cols - 1)) / cols;
    const gridH = rows * BOX_H + Math.max(0, rows - 1) * BOX_GAP_Y;
    const cardH = CARD_PAD * 2 + gridH;

    const height = HEADER_H + cardH + 24 + FOOTER_H;

    const canvas = createCanvas(WIDTH, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, WIDTH, height);
    drawHeader(ctx, WIDTH);

    const cardY = HEADER_H;
    drawPremiumFrame(ctx, OUTER_X, cardY, cardW, cardH);

    for (let i = 0; i < MONTHLY_CLAIMS.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = OUTER_X + CARD_PAD + col * (boxW + BOX_GAP_X);
        const y = cardY + CARD_PAD + row * (BOX_H + BOX_GAP_Y);
        drawRewardBox(ctx, x, y, boxW, BOX_H, MONTHLY_CLAIMS[i]);
    }

    ctx.font = '16px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';
    ctx.fillText('thank you for being a premium pass holder', WIDTH / 2, height - FOOTER_H / 2 + 5);
    ctx.textAlign = 'left';

    return canvas.toBuffer('image/png');
}