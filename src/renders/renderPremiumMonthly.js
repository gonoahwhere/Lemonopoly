import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { MONTHLY_CLAIMS } from '../data/passBenefits.js';
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { getIconFromCache } from '../data/iconImages.js';
import { shadeHex, blendHex } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    premium: '#9B4FD1',
    premiumSoft: 'rgba(155,79,209,0.12)',
    premiumIconFill: 'rgba(155,79,209,0.16)',
    claimGold: '#FFC94D',
    boxFill: BASE_COLOURS.paperShade ?? '#FCF6E6',
};

const WIDTH = 1100;
const HEADER_H = 130;
const OUTER_X = 50;
const CARD_PAD = 26;
const BOX_H = 80;
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

function drawPill(ctx, text, rightEdge, y, h, fill, borderColour, textColour) {
    const fontSize = 15;
    const padX = 14;
    ctx.font = `${fontSize}px FredokaOne`;
    const pillW = ctx.measureText(text).width + padX * 2;
    const px = rightEdge - pillW;
    roundedRect(ctx, px, y, pillW, h, h / 2, fill);
    ctx.strokeStyle = borderColour;
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, px, y, pillW, h, h / 2);
    ctx.stroke();
    ctx.fillStyle = textColour;
    ctx.fillText(text, px + padX, y + h / 2 + fontSize * 0.35);
    return px;
}

function drawHeader(ctx, width, subtitle, readyPillText, isClaimable, profile) {
    ctx.font = '42px FredokaOne';

    const title = 'THE SACRED SQUEEZE';
    const customColours = profile.entitlements?.premium ? profile.customization?.nameGradientColours : null;
    const hasCustomGradient = Array.isArray(customColours) && customColours.length === 2;
    const fillColours = hasCustomGradient ? customColours : [COLOURS.title, '#FFDD70'];
    const strokeColour = hasCustomGradient ? shadeHex(blendHex(customColours[0], customColours[1]), -0.45) : COLOURS.text;

    const nameWidth = ctx.measureText(title).width;
    const titleGrad = ctx.createLinearGradient(50, 30, 50 + nameWidth, 30);
    titleGrad.addColorStop(0, fillColours[0]);
    titleGrad.addColorStop(1, fillColours[1]);

    ctx.strokeStyle = strokeColour;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeText(title, 50, 62);

    ctx.fillStyle = titleGrad;
    ctx.fillText(title, 50, 62);

    ctx.font = '20px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(subtitle, 54, 90);

    const monthLabel = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase();
    const pillH = 32;
    const pillGap = 10;
    const monthPillLeft = drawPill(ctx, monthLabel, width - 50, 28, pillH, COLOURS.premiumSoft, COLOURS.premium + '77', COLOURS.premium);

    if (readyPillText) {
        const readyFill = isClaimable ? COLOURS.green + '24' : COLOURS.red + '24';
        const readyBorder = isClaimable ? COLOURS.green + '99' : COLOURS.red + '99';
        const readyText = isClaimable ? COLOURS.green : COLOURS.red;
        drawPill(ctx, readyPillText, monthPillLeft - pillGap, 28, pillH, readyFill, readyBorder, readyText);
    }

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

    const iconR = 22;
    const iconCx = x + 18 + iconR;
    const iconCy = y + h / 2;

    ctx.beginPath();
    ctx.arc(iconCx, iconCy, iconR, 0, Math.PI * 2);
    ctx.fillStyle = COLOURS.premiumIconFill;
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

    const textX = iconCx + iconR + 18;
    const textMaxW = x + w - 16 - textX;

    const nameY = y + h / 2 - 6;
    ctx.font = '18px FredokaOne';
    const qtyText = formatQuantity(claim.quantity);
    const qtyWidth = ctx.measureText(qtyText).width;
    const nameMaxW = textMaxW - qtyWidth - 12;

    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'left';
    ctx.fillText(truncate(ctx, toDisplayName(claim.name ?? claim.id).toUpperCase(), nameMaxW), textX, nameY);

    ctx.font = 'bold 18px FredokaOne';
    ctx.fillStyle = COLOURS.premium;
    ctx.textAlign = 'right';
    ctx.fillText(qtyText, x + w - 16, nameY);
    ctx.textAlign = 'left';

    if (claim.description) {
        ctx.font = '13px FredokaOne';
        ctx.fillStyle = (COLOURS.subtitle ?? COLOURS.text) + 'AA';
        const descY = nameY + 22;
        ctx.fillText(truncate(ctx, claim.description, textMaxW), textX, descY);
    }
}

export async function renderMonthlyClaim(profile, { hasPremium = true, mode = 'claimed', daysUntilClaim = 0 } = {}) {
    const isClaimable = daysUntilClaim === 0;
    const subtitle = !hasPremium ? "You're missing out on The Sacred Squeeze" : mode === 'claimed' ? 'You have received The Sacred Squeeze' : isClaimable ? 'The Sacred Squeeze is ready to claim' : `Here is what you earn when you claim The Sacred Squeeze`;
    const readyPillText = hasPremium && mode === 'view' ? (isClaimable ? 'READY NOW' : `READY IN ${daysUntilClaim} ${daysUntilClaim === 1 ? 'DAY' : 'DAYS'}`) : null;

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
    drawHeader(ctx, WIDTH, subtitle, readyPillText, isClaimable, profile);

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
    ctx.fillText(hasPremium ? 'thank you for being a premium pass holder' : 'purchase the premium pass to claim these rewards monthly', WIDTH / 2, height - FOOTER_H / 2 + 5);
    ctx.textAlign = 'left';

    return canvas.toBuffer('image/png');
}