import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { wrapText, strokeCardBorder, shadeHex, blendHex } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

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

const TYPE_STYLES = {
    beneficial: {
        accent: '#4CAF6D',
        soft: 'rgba(76,175,109,0.12)',
        label: 'BENEFICIAL',
    },
    risky: {
        accent: '#3C8FD1',
        soft: 'rgba(209,162,60,0.12)',
        label: 'RISKY',
    },
    harmful: {
        accent: '#D14F4F',
        soft: 'rgba(209,79,79,0.12)',
        label: 'HARMFUL',
    },
};

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

function drawStarBullet(ctx, cx, cy, colour, outerR = 9) {
    drawPuffyStarShape(ctx, cx, cy, outerR, outerR * 0.5);
    ctx.fillStyle = colour;
    ctx.fill();
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

function drawHeader(ctx, width, event, style, profile, page, totalPages) {
    ctx.font = '42px FredokaOne';

    const customColours = profile?.entitlements?.premium ? profile.customization?.nameGradientColours : null;
    const hasCustomGradient = Array.isArray(customColours) && customColours.length === 2;
    const fillColours = hasCustomGradient ? customColours : [BASE_COLOURS.title, style.accent];
    const strokeColour = hasCustomGradient ? shadeHex(blendHex(customColours[0], customColours[1]), -0.45) : BASE_COLOURS.text;

    const title = 'WEATHER EVENT';
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
    ctx.fillStyle = BASE_COLOURS.subtitle;
    ctx.fillText(event.name, 54, 90);

    const pageLabel = `PAGE ${page} / ${totalPages}`;
    ctx.font = '16px FredokaOne';
    const padX = 14;
    const pillH = 34;
    const pillW = ctx.measureText(pageLabel).width + padX * 2;
    drawPill(ctx, width - 50 - pillW, 26, pageLabel, style.accent, style.soft, undefined, 16, padX, pillH);

    const divGrad = ctx.createLinearGradient(45, 0, width - 45, 0);
    divGrad.addColorStop(0, `${style.accent}00`);
    divGrad.addColorStop(0.5, `${style.accent}80`);
    divGrad.addColorStop(1, `${style.accent}00`);
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 112);
    ctx.lineTo(width - 45, 112);
    ctx.stroke();
}

function drawOptionRow(ctx, x, y, w, option, colour, measureOnly = false) {
    ctx.font = '17px FredokaOne';
    const lines = wrapText(ctx, option, w - 44 - 20, 3);
    const lineHeight = 15;

    if (!measureOnly) {
        drawStarBullet(ctx, x + 22, y + 13, colour, 9);
        ctx.fillStyle = BASE_COLOURS.text;
        lines.forEach((line, i) => {
            ctx.fillText(line, x + 44, y + 18 + i * lineHeight);
        });
    }

    return lines.length;
}

export async function renderWeatherEvent(event, profile, page = 1, totalPages = 1) {
    const style = TYPE_STYLES[event.type] ?? TYPE_STYLES.beneficial;

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
    let rowHeights = event.options.map((option) => {
        const lineCount = drawOptionRow(measureCtx, CARD_X + 20, 0, CARD_W - 40, option.task, style.accent, true);
        return Math.max(ROW_MIN_H, lineCount * 19 + 8);
    });

    const cardH = CARD_PAD_TOP + rowHeights.reduce((a, b) => a + b, 0) + ROW_GAP * (rowHeights.length - 1) + CARD_PAD_BOTTOM;
    const height = HEADER_H + cardH + 24 + FOOTER_H;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, width, height);
    drawHeader(ctx, width, event, style, profile, page, totalPages);

    const cardY = HEADER_H;
    roundedRectWithShadow(ctx, CARD_X, cardY, CARD_W, cardH, 20, BASE_COLOURS.card, BASE_COLOURS.cardShadow);
    strokeCardBorder(ctx, CARD_X, cardY, CARD_W, cardH, 20, roundedRectPath, style.accent + '55', [style.accent]);

    let rowY = cardY + CARD_PAD_TOP;
    event.options.forEach((option, i) => {
        drawOptionRow(ctx, CARD_X + 20, rowY, CARD_W - 40, option.task, style.accent);
        rowY += rowHeights[i] + ROW_GAP;
    });

    ctx.font = '16px FredokaOne';
    ctx.fillStyle = BASE_COLOURS.subtitle;
    ctx.textAlign = 'center';
    ctx.fillText('possible outcomes for this event', width / 2, height - FOOTER_H / 2 + 5);
    ctx.textAlign = 'left';

    return canvas.toBuffer('image/png');
}