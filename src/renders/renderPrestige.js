import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { formatNumber } from '../helpers/renderHelper.js';
import { getIconFromCache, preloadIcons } from '../data/iconImages.js';
import { UPGRADE_ICON_KEYS } from '../data/iconKeys.js';
import {
    UPGRADE_STATS,
    UPGRADE_LEVEL_CAP,
    isPrestigeReady,
    getPrestigeLevelRequirement,
} from '../data/upgrades.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const STAT_LABELS = { speed: 'Speed', storage: 'Storage', appeal: 'Appeal', resilience: 'Resilience' };

const WIDTH = 900;
const PAD = 50;
const HEADER_H = 140;
const ROW_H = 66;
const ROW_GAP = 14;
const BANNER_H = 78;

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

function roundedRectShadow(ctx, x, y, w, h, r, fill, shadow, blur, offsetY) {
    ctx.save();
    ctx.shadowColor = shadow;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetY = offsetY;
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
}

function drawIconBadge(ctx, cx, cy, radius, iconKey) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4D6';
    ctx.fill();
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    const icon = getIconFromCache(iconKey);
    if (icon) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(icon, cx - radius + 3, cy - radius + 3, (radius - 3) * 2, (radius - 3) * 2);
        ctx.restore();
    }
}

function drawHeader(ctx, prestige, ready) {
    ctx.font = '46px FredokaOne';
    const grad = ctx.createLinearGradient(PAD, 30, PAD + 360, 30);
    grad.addColorStop(0, COLOURS.title);
    grad.addColorStop(1, '#FFDD70');
    ctx.textAlign = 'left';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = COLOURS.text;
    ctx.lineWidth = 5;
    ctx.strokeText('Prestige', PAD, 74);
    ctx.fillStyle = grad;
    ctx.fillText('Prestige', PAD, 74);

    ctx.font = '19px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(ready ? 'Everything is maxed — you can prestige!' : 'Clear every requirement to prestige.', PAD + 2, 104);

    // Prestige badge (right)
    ctx.font = '20px FredokaOne';
    const text = `Prestige ${prestige}`;
    const iconSize = 26;
    const gap = 9;
    const padX = 16;
    const textW = ctx.measureText(text).width;
    const pillW = padX + iconSize + gap + textW + padX;
    const pillH = 44;
    const x = WIDTH - PAD - pillW;
    const y = 50 - pillH / 2 + 12;

    roundedRect(ctx, x, y, pillW, pillH, pillH / 2, COLOURS.card);
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.3;
    roundedRectPath(ctx, x, y, pillW, pillH, pillH / 2);
    ctx.stroke();
    const icon = getIconFromCache('prestige');
    if (icon) ctx.drawImage(icon, x + padX, y + (pillH - iconSize) / 2, iconSize, iconSize);
    ctx.fillStyle = COLOURS.title;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padX + iconSize + gap, y + pillH / 2 + 1);
    ctx.textBaseline = 'alphabetic';

    const divGrad = ctx.createLinearGradient(PAD - 5, 0, WIDTH - PAD + 5, 0);
    divGrad.addColorStop(0, 'rgba(231,168,0,0)');
    divGrad.addColorStop(0.5, 'rgba(231,168,0,0.45)');
    divGrad.addColorStop(1, 'rgba(231,168,0,0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD - 5, HEADER_H - 6);
    ctx.lineTo(WIDTH - PAD + 5, HEADER_H - 6);
    ctx.stroke();
}

function drawRequirementRow(ctx, x, y, w, h, iconKey, name, valueText, met) {
    roundedRectShadow(ctx, x, y, w, h, 16, COLOURS.card, COLOURS.cardShadow, 10, 4);
    ctx.strokeStyle = met ? 'rgba(79,191,91,0.55)' : COLOURS.border;
    ctx.lineWidth = 1.3;
    roundedRectPath(ctx, x, y, w, h, 16);
    ctx.stroke();

    const badgeR = 23;
    const badgeCx = x + 20 + badgeR;
    drawIconBadge(ctx, badgeCx, y + h / 2, badgeR, iconKey);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '21px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText(name, badgeCx + badgeR + 16, y + h / 2 + 1);

    const statusIcon = getIconFromCache(met ? 'enabled' : 'disabled');
    const statusSize = 28;
    const rightX = x + w - 20;
    if (statusIcon) ctx.drawImage(statusIcon, rightX - statusSize, y + h / 2 - statusSize / 2, statusSize, statusSize);

    ctx.textAlign = 'right';
    ctx.font = '20px FredokaOne';
    ctx.fillStyle = met ? '#2E8B39' : COLOURS.subtitle;
    ctx.fillText(valueText, rightX - statusSize - 14, y + h / 2 + 1);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawBanner(ctx, x, y, w, h, ready, requiredLevel) {
    const bg = ready ? COLOURS.greenSoft : '#FBEFCE';
    const line = ready ? COLOURS.green : COLOURS.border;
    roundedRect(ctx, x, y, w, h, 18, bg);
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.6;
    roundedRectPath(ctx, x, y, w, h, 18);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '24px FredokaOne';
    ctx.fillStyle = ready ? '#2E8B39' : COLOURS.text;
    ctx.fillText(ready ? 'READY TO PRESTIGE' : 'NOT READY YET', x + w / 2, y + h / 2 - 9);

    ctx.font = '15px FredokaOne';
    ctx.fillStyle = ready ? '#3F8A47' : COLOURS.subtitle;
    ctx.fillText(
        ready ? 'Run /prestige to confirm and reset.' : `Max all four upgrades and reach stand level ${requiredLevel}.`,
        x + w / 2,
        y + h / 2 + 15,
    );
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

export async function renderPrestige(player) {
    await preloadIcons([...Object.values(UPGRADE_ICON_KEYS), 'prestige', 'level', 'enabled', 'disabled']);

    const prestige = player?.prestige?.level ?? 0;
    const standLevel = player?.stand?.level ?? 1;
    const requiredLevel = getPrestigeLevelRequirement(prestige);
    const ready = isPrestigeReady(player);

    const rowsCount = UPGRADE_STATS.length + 1;
    const rowsH = rowsCount * ROW_H + (rowsCount - 1) * ROW_GAP;
    const height = PAD + HEADER_H + rowsH + 18 + BANNER_H + PAD;

    const canvas = createCanvas(WIDTH, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, WIDTH, height);
    drawHeader(ctx, prestige, ready);

    const contentW = WIDTH - PAD * 2;
    let rowY = PAD + HEADER_H;

    for (const stat of UPGRADE_STATS) {
        const level = player?.upgrades?.[stat]?.level ?? 0;
        drawRequirementRow(ctx, PAD, rowY, contentW, ROW_H, UPGRADE_ICON_KEYS[stat], STAT_LABELS[stat], `${level} / ${UPGRADE_LEVEL_CAP}`, level >= UPGRADE_LEVEL_CAP);
        rowY += ROW_H + ROW_GAP;
    }

    drawRequirementRow(ctx, PAD, rowY, contentW, ROW_H, 'level', 'Stand Level', `${standLevel} / ${requiredLevel}`, standLevel >= requiredLevel);
    rowY += ROW_H + ROW_GAP;

    drawBanner(ctx, PAD, rowY + 4, contentW, BANNER_H, ready, requiredLevel);

    return canvas.toBuffer('image/png');
}
