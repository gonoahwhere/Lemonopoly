import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { MONTHLY_CLAIMS } from '../data/passBenefits.js';
import { CLAIM_ID_TO_FIELD } from '../commands/util/premium-claim.js';
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { strokeCardBorder, formatNumber, shadeHex, blendHex } from '../helpers/renderHelper.js';
import { getIconFromCache } from '../data/iconImages.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    premium: '#9B4FD1',
    premiumSoft: 'rgba(155,79,209,0.12)',
    premiumIconFill: 'rgba(155,79,209,0.16)',
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

function toDisplayName(idOrName) {
    return idOrName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatQuantity(n) {
    return n.toLocaleString('en-US');
}

function truncate(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let trimmed = text;
    while (trimmed.length > 1 && ctx.measureText(trimmed + '…').width > maxWidth) {
        trimmed = trimmed.slice(0, -1);
    }
    return trimmed + '…';
}

function drawPill(ctx, x, y, label, colour, bg, borderColour, fontSize = 16, padX = 14, h = 34) {
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

function drawHeader(ctx, width, totalOwned, profile) {
    ctx.font = '42px FredokaOne';

    const title = 'THE VAULT';
    const isPremium = Boolean(profile?.entitlements?.premium);
    const customColours = isPremium ? profile.customization?.nameGradientColours : null;
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
    ctx.fillText('Your unredeemed premium rewards', 54, 90);

    const label = `${formatNumber(totalOwned)} ITEM${totalOwned === 1 ? '' : 'S'} BANKED`;
    const fill = totalOwned > 0 ? COLOURS.premiumSoft : 'rgba(168,147,79,0.10)';
    const colour = totalOwned > 0 ? COLOURS.premium : (COLOURS.muted ?? COLOURS.subtitle);
    const border = totalOwned > 0 ? COLOURS.premium + '77' : colour + '55';

    ctx.font = '16px FredokaOne';
    const pillW = ctx.measureText(label).width + 28;
    drawPill(ctx, width - 50 - pillW, 26, label, colour, fill, border);

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

function drawLedgerRow(ctx, x, y, w, item, isLast) {
    const { claim, quantity } = item;
    const owned = quantity > 0;
    const rowH = 64;

    const iconR = 18;
    const iconCx = x + iconR + 2;
    const iconCy = y + rowH / 2;

    ctx.globalAlpha = owned ? 1 : 0.4;

    ctx.beginPath();
    ctx.arc(iconCx, iconCy, iconR, 0, Math.PI * 2);
    ctx.fillStyle = COLOURS.premiumIconFill;
    ctx.fill();
    ctx.strokeStyle = COLOURS.premium + '55';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    const img = getIconFromCache(claim.icon);
    if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(iconCx, iconCy, iconR - 4, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, iconCx - iconR + 4, iconCy - iconR + 4, (iconR - 4) * 2, (iconR - 4) * 2);
        ctx.restore();
    } else {
        ctx.font = '15px FredokaOne';
        ctx.fillStyle = COLOURS.premium;
        ctx.textAlign = 'center';
        ctx.fillText(toDisplayName(claim.name ?? claim.id).charAt(0), iconCx, iconCy + 5);
        ctx.textAlign = 'left';
    }

    const textX = iconCx + iconR + 18;
    const qtyText = formatQuantity(quantity);

    ctx.font = 'bold 22px FredokaOne';
    const qtyWidth = ctx.measureText(qtyText).width;
    const qtyRight = x + w - 4;

    ctx.font = '17px FredokaOne';
    const nameMaxW = qtyRight - qtyWidth - 16 - textX;

    ctx.fillStyle = owned ? COLOURS.text : (COLOURS.muted ?? COLOURS.subtitle);
    ctx.fillText(truncate(ctx, toDisplayName(claim.name ?? claim.id).toUpperCase(), nameMaxW), textX, y + rowH / 2 - 8);

    if (claim.description) {
        ctx.font = '13px FredokaOne';
        ctx.fillStyle = (COLOURS.subtitle ?? COLOURS.text) + 'AA';
        ctx.fillText(truncate(ctx, claim.description, nameMaxW), textX, y + rowH / 2 + 14);
    }

    ctx.font = 'bold 22px FredokaOne';
    ctx.fillStyle = owned ? COLOURS.premium : (COLOURS.muted ?? COLOURS.subtitle);
    ctx.textAlign = 'right';
    ctx.fillText(qtyText, qtyRight, y + rowH / 2 + 7);
    ctx.textAlign = 'left';

    ctx.globalAlpha = 1;

    if (!isLast) {
        ctx.strokeStyle = COLOURS.border ?? 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + rowH);
        ctx.lineTo(x + w, y + rowH);
        ctx.stroke();
    }

    return rowH;
}

export async function renderPremiumInventory(profile) {
    const bonuses = profile?.premiumBonuses ?? {};

    const items = MONTHLY_CLAIMS
        .filter((claim) => CLAIM_ID_TO_FIELD[claim.id])
        .map((claim) => ({
            claim,
            quantity: bonuses[CLAIM_ID_TO_FIELD[claim.id]] ?? 0,
        }));

    const totalOwned = items.reduce((sum, item) => sum + item.quantity, 0);

    const width = 700;
    const HEADER_H = 130;
    const CARD_X = 50;
    const CARD_W = width - 100;
    const CARD_PAD_TOP = 20;
    const CARD_PAD_BOTTOM = 20;
    const ROW_H = 64;
    const FOOTER_H = 50;

    const cardH = CARD_PAD_TOP + ROW_H * items.length + CARD_PAD_BOTTOM;
    const height = HEADER_H + cardH + 24 + FOOTER_H;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, width, height);
    drawHeader(ctx, width, totalOwned, profile);

    const cardY = HEADER_H;
    roundedRectWithShadow(ctx, CARD_X, cardY, CARD_W, cardH, 20, COLOURS.card, COLOURS.cardShadow);
    const borderColours = profile?.entitlements?.premium ? profile?.customization?.cardBorderColours : null;
    strokeCardBorder(ctx, CARD_X, cardY, CARD_W, cardH, 20, roundedRectPath, COLOURS.premium + '55', borderColours);

    let rowY = cardY + CARD_PAD_TOP;
    items.forEach((item, i) => {
        drawLedgerRow(ctx, CARD_X + 20, rowY, CARD_W - 40, item, i === items.length - 1);
        rowY += ROW_H;
    });

    ctx.font = '16px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';
    ctx.fillText(totalOwned > 0 ? 'use /the-vault redeem to spend these on your stand' : 'claim your monthly Sacred Squeeze to fill this up', width / 2, height - FOOTER_H / 2 + 5);
    ctx.textAlign = 'left';

    return canvas.toBuffer('image/png');
}