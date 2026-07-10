import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { getIconFromCache } from "../data/iconImages.js";
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { wrapText, formatNumber } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    rankSoft: '#FFF4D6',
};

const MEDAL_KEYS = { 1: 'gold', 2: 'silver', 3: 'bronze' };

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

function roundedRectWithShadow(ctx, x, y, w, h, r, fill, shadowColor, blur = 12, offsetY = 5) {
    ctx.save();
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetY = offsetY;
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
}

function truncate(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let trimmed = text;
    while (trimmed.length > 1 && ctx.measureText(trimmed + '…').width > maxWidth) {
        trimmed = trimmed.slice(0, -1);
    }
    return trimmed + '…';
}


function drawIconCircle(ctx, cx, cy, r, iconKey) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = COLOURS.rankSoft;
    ctx.fill();
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const icon = getIconFromCache(iconKey);
    if (icon) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(icon, cx - r + 3, cy - r + 3, (r - 3) * 2, (r - 3) * 2);
        ctx.restore();
    }
}

// Layout constants
const WIDTH = 900;
const PAD = 50;
const HEADER_H = 160;
const ROW_H = 60;
const ROW_GAP = 10;
const ROWS_TOP_GAP = 14;
const FOOTER_H = 60;

export async function renderLeaderboard(data) {
    const { label, prefix, iconKey, accent, total, rows, viewer } = data;

    const rowsBlockH = rows.length * ROW_H + Math.max(0, rows.length - 1) * ROW_GAP;
    const height = HEADER_H + ROWS_TOP_GAP + rowsBlockH + ROWS_TOP_GAP + FOOTER_H;

    const canvas = createCanvas(WIDTH, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, WIDTH, height);
    drawHeader(ctx, { label, prefix, iconKey, accent, viewer });

    let cursorY = HEADER_H + ROWS_TOP_GAP;
    for (const row of rows) {
        drawRow(ctx, cursorY, { prefix, accent, ...row });
        cursorY += ROW_H + ROW_GAP;
    }

    drawFooter(ctx, height, { shown: rows.length, total });

    return canvas.toBuffer('image/png');
}

function drawHeader(ctx, { label, prefix, iconKey, accent, viewer }) {
    // Brand title
    ctx.font = '58px FredokaOne';
    ctx.strokeStyle = COLOURS.text;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.strokeText('LEADERBOARD', PAD, 78);

    const titleGrad = ctx.createLinearGradient(PAD, 30, PAD + 470, 30);
    titleGrad.addColorStop(0, COLOURS.title);
    titleGrad.addColorStop(1, '#FFDD70');
    ctx.fillStyle = titleGrad;
    ctx.fillText('LEADERBOARD', PAD, 78);

    // Leaderboard type line — icon + "{Label} Leaderboard"
    const iconR = 18;
    const iconCx = PAD + iconR;
    const iconCy = 104;
    drawIconCircle(ctx, iconCx, iconCy, iconR, iconKey);

    ctx.font = '26px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(`${label}`, iconCx + iconR + 12, 113);

    // "YOU" pill, top-right — shows the viewer's standing regardless of page.
    if (viewer) {
        ctx.font = '18px FredokaOne';
        const rankLabel = `YOU · #${formatNumber(viewer.rank)}`;
        const valueLabel = `${prefix}${formatNumber(viewer.value)}`;
        const pillText = `${rankLabel}   ${valueLabel}`;
        const padX = 18;
        const pillW = ctx.measureText(pillText).width + padX * 2;
        const pillH = 42;
        const pillX = WIDTH - PAD - pillW;
        const pillY = 40;

        roundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, accent + '1F');
        ctx.strokeStyle = accent + '99';
        ctx.lineWidth = 1.5;
        roundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
        ctx.stroke();

        const textY = pillY + pillH / 2 + 6;
        ctx.fillStyle = accent;
        ctx.fillText(rankLabel, pillX + padX, textY);
        const rankW = ctx.measureText(`${rankLabel}   `).width;
        ctx.fillStyle = COLOURS.text;
        ctx.fillText(valueLabel, pillX + padX + rankW, textY);
    }

    // Divider
    const divGrad = ctx.createLinearGradient(PAD - 5, 0, WIDTH - PAD + 5, 0);
    divGrad.addColorStop(0, 'rgba(231,168,0,0)');
    divGrad.addColorStop(0.5, 'rgba(231,168,0,0.5)');
    divGrad.addColorStop(1, 'rgba(231,168,0,0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD - 5, HEADER_H - 15);
    ctx.lineTo(WIDTH - PAD + 5, HEADER_H - 15);
    ctx.stroke();
}

function drawRow(ctx, y, { rank, name, value, prefix, accent, isViewer, showBadge }) {
    const x = PAD;
    const w = WIDTH - PAD * 2;

    const bg = isViewer ? accent + '14' : COLOURS.card;
    roundedRectWithShadow(ctx, x, y, w, ROW_H, 16, bg, COLOURS.cardShadow, isViewer ? 14 : 10, 4);
    ctx.strokeStyle = isViewer ? accent + 'AA' : COLOURS.border;
    ctx.lineWidth = isViewer ? 2 : 1.2;
    roundedRectPath(ctx, x, y, w, ROW_H, 16);
    ctx.stroke();

    const badgeR = 20;
    const badgeCx = x + 34;
    const badgeCy = y + ROW_H / 2;

    const isMedal = Boolean(MEDAL_KEYS[rank]);
    const rankKey = MEDAL_KEYS[rank] ?? String(rank).padStart(2, '0');
    const rankImg = getIconFromCache(rankKey);
    if (rankImg) {
        const size = isMedal ? 46 : 40;
        ctx.drawImage(rankImg, badgeCx - size / 2, badgeCy - size / 2, size, size);
    } else {
        ctx.beginPath();
        ctx.arc(badgeCx, badgeCy, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = COLOURS.rankSoft;
        ctx.fill();
        ctx.strokeStyle = COLOURS.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '20px FredokaOne';
        ctx.textAlign = 'center';
        ctx.fillStyle = COLOURS.muted;
        ctx.fillText(`${rank}`, badgeCx, badgeCy + 7);
        ctx.textAlign = 'left';
    }

    const valueLabel = `${prefix}${formatNumber(value)}`;
    ctx.font = '24px FredokaOne';
    const valueW = ctx.measureText(valueLabel).width;
    ctx.fillStyle = accent;
    ctx.textAlign = 'right';
    ctx.fillText(valueLabel, x + w - 24, badgeCy + 8);
    ctx.textAlign = 'left';

    let nameX = badgeCx + badgeR + 18;

    // Premium badge — small icon right before the name
    const premiumSize = 20;
    if (showBadge) {
        const premiumIcon = getIconFromCache('premium');
        if (premiumIcon) {
            ctx.drawImage(premiumIcon, nameX, badgeCy - premiumSize / 2, premiumSize, premiumSize);
        }
        nameX += premiumSize + 6;
    }

    let nameMaxW = x + w - 24 - valueW - 20 - nameX;

    if (isViewer) {
        ctx.font = '13px FredokaOne';
        const tag = 'YOU';
        const tagW = ctx.measureText(tag).width + 16;
        const tagH = 22;
        const tagX = x + w - 24 - valueW - 14 - tagW;
        roundedRect(ctx, tagX, badgeCy - tagH / 2, tagW, tagH, tagH / 2, accent);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(tag, tagX + 8, badgeCy + 4.5);
        nameMaxW = tagX - 14 - nameX;
    }

    ctx.font = '22px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText(truncate(ctx, name, nameMaxW), nameX, badgeCy + 8);
}

function drawFooter(ctx, height, { shown, total }) {
    ctx.font = '17px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';
    const text = total > shown ? `Top ${shown} of ${formatNumber(total)} stands` : `${formatNumber(total)} ${total === 1 ? 'stand' : 'stands'}`;
    ctx.fillText(text, WIDTH / 2, height - FOOTER_H / 2 + 6);
    ctx.textAlign = 'left';
}