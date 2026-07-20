import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { formatNumber, shadeHex, blendHex } from '../helpers/renderHelper.js';
import { getIconFromCache } from '../data/iconImages.js';
import { UPGRADE_ICON_KEYS } from '../data/iconKeys.js';
import { UPGRADE_STATS, UPGRADE_LEVEL_CAP, upgradeCost, formatUpgradeEffect } from '../data/upgrades.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const STAT_LABELS = { speed: 'Speed', storage: 'Storage', appeal: 'Appeal', resilience: 'Resilience' };

const WIDTH = 900;
const PAD = 50;
const HEADER_H = 130;
const CARD_GAP = 24;
const CARD_H = 235;
const COLS = 2;
const FOOTER_H = 56;

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

function drawRightPill(ctx, rightX, cy, iconKey, text, colours) {
    ctx.font = '20px FredokaOne';
    const iconSize = 24;
    const gap = 8;
    const padX = 14;
    const textW = ctx.measureText(text).width;
    const pillW = padX + iconSize + gap + textW + padX;
    const pillH = 40;
    const x = rightX - pillW;
    const y = cy - pillH / 2;

    const bg = colours?.bg ?? COLOURS.card;
    const border = colours?.border ?? COLOURS.border;
    const textColour = colours?.text ?? COLOURS.text;

    roundedRect(ctx, x, y, pillW, pillH, pillH / 2, bg);
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.2;
    roundedRectPath(ctx, x, y, pillW, pillH, pillH / 2);
    ctx.stroke();

    const icon = getIconFromCache(iconKey);
    if (icon) ctx.drawImage(icon, x + padX, cy - iconSize / 2, iconSize, iconSize);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColour;
    ctx.fillText(text, x + padX + iconSize + gap, cy + 1);
    ctx.textBaseline = 'alphabetic';
}

function drawHeader(ctx, player, prestige) {
    ctx.font = '46px FredokaOne';
    const title = 'STAND UPGRADES'
    const customColours = player.entitlements?.premium ? player.customization?.nameGradientColours : null;
    const hasCustomGradient = Array.isArray(customColours) && customColours.length === 2;
    const fillColours = hasCustomGradient ? customColours : [COLOURS.title, '#FFDD70'];
    const strokeColour = hasCustomGradient ? shadeHex(blendHex(customColours[0], customColours[1]), -0.45) : COLOURS.text;

    const nameWidth = ctx.measureText(title).width;
    const titleGrad = ctx.createLinearGradient(50, 30, 50 + nameWidth, 30);
    titleGrad.addColorStop(0, fillColours[0]);
    titleGrad.addColorStop(1, fillColours[1]);

    ctx.strokeStyle = strokeColour;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.strokeText(title, 50, 78);

    ctx.fillStyle = titleGrad;
    ctx.fillText(title, 50, 78);

    ctx.font = '19px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText('Level up your stand', PAD + 2, 104);

    drawRightPill(ctx, WIDTH - PAD, 50, 'prestige', `Prestige ${prestige}`, {
        bg: '#DCEBFF',
        border: '#3B82F6',
        text: '#1D4ED8',
    });

    drawRightPill(ctx, WIDTH - PAD, 96, 'cash', `$${formatNumber(player?.economy?.cash ?? 0)}`, {
        bg: COLOURS.greenSoft,
        border: COLOURS.green,
        text: '#2E8B39',
    });

    const divGrad = ctx.createLinearGradient(PAD - 5, 0, WIDTH - PAD + 5, 0);
    divGrad.addColorStop(0, 'rgba(231,168,0,0)');
    divGrad.addColorStop(0.5, 'rgba(231,168,0,0.45)');
    divGrad.addColorStop(1, 'rgba(231,168,0,0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD - 5, HEADER_H - 4);
    ctx.lineTo(WIDTH - PAD + 5, HEADER_H - 4);
    ctx.stroke();
}

function drawCostPill(ctx, cx, cy, stat, level, prestige) {
    const pillH = 30;
    if (level >= UPGRADE_LEVEL_CAP) {
        ctx.font = '16px FredokaOne';
        const text = 'MAXED';
        const pillW = ctx.measureText(text).width + 40;
        const x = cx - pillW / 2;
        roundedRect(ctx, x, cy - pillH / 2, pillW, pillH, pillH / 2, COLOURS.greenSoft);
        ctx.strokeStyle = COLOURS.green;
        ctx.lineWidth = 1.4;
        roundedRectPath(ctx, x, cy - pillH / 2, pillW, pillH, pillH / 2);
        ctx.stroke();
        ctx.fillStyle = '#2E8B39';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, cx, cy - 1);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
        return;
    }

    ctx.font = '17px FredokaOne';
    const text = formatNumber(upgradeCost(stat, level, prestige));
    const iconSize = 20;
    const gap = 7;
    const padX = 16;
    const textW = ctx.measureText(text).width;
    const pillW = padX + iconSize + gap + textW + padX;
    const x = cx - pillW / 2;

    roundedRect(ctx, x, cy - pillH / 2, pillW, pillH, pillH / 2, '#FFF6D8');
    ctx.strokeStyle = COLOURS.border;
    ctx.lineWidth = 1.3;
    roundedRectPath(ctx, x, cy - pillH / 2, pillW, pillH, pillH / 2);
    ctx.stroke();

    const icon = getIconFromCache('cash');
    if (icon) ctx.drawImage(icon, x + padX, cy - iconSize / 2, iconSize, iconSize);

    ctx.fillStyle = COLOURS.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padX + iconSize + gap, cy - 1);
    ctx.textBaseline = 'alphabetic';
}

function drawUpgradeCard(ctx, x, y, w, h, stat, player, prestige) {
    const level = player?.upgrades?.[stat]?.level ?? 0;
    const cx = x + w / 2;

    roundedRectShadow(ctx, x, y, w, h, 22, COLOURS.card, COLOURS.cardShadow, 14, 6);

    const customColours = player.entitlements?.premium ? player.customization?.nameGradientColours : null;
    const hasCustomGradient = Array.isArray(customColours) && customColours.length === 2;

    if (hasCustomGradient) {
        const borderGrad = ctx.createLinearGradient(x, y, x + w, y + h);
        borderGrad.addColorStop(0, customColours[0]);
        borderGrad.addColorStop(1, customColours[1]);
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 2.2;
    } else {
        ctx.strokeStyle = COLOURS.border;
        ctx.lineWidth = 1.4;
    }
    roundedRectPath(ctx, x, y, w, h, 22);
    ctx.stroke();

    drawIconBadge(ctx, cx, y + 50, 32, stat);

    ctx.textAlign = 'center';
    ctx.font = '22px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText(STAT_LABELS[stat], cx, y + 112);

    ctx.font = '12px FredokaOne';
    ctx.fillStyle = COLOURS.muted;
    ctx.fillText(formatUpgradeEffect(stat, level, prestige), cx, y + 132);

    ctx.font = '20px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText(`Lv. ${level} / ${UPGRADE_LEVEL_CAP}`, cx, y + 162);
    ctx.textAlign = 'left';

    const barW = w - 64;
    const barX = x + 32;
    const barY = y + 172;
    const barH = 10;
    roundedRect(ctx, barX, barY, barW, barH, barH / 2, '#EFE3B8');
    const frac = Math.max(0, Math.min(1, level / UPGRADE_LEVEL_CAP));
    if (frac > 0) {
        const fillW = Math.max(barH, barW * frac);
        const g = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
        if (hasCustomGradient) {
            g.addColorStop(0, customColours[0]);
            g.addColorStop(1, customColours[1]);
        } else {
            g.addColorStop(0, '#B7E75A');
            g.addColorStop(1, '#5FCB4F');
        }
        roundedRect(ctx, barX, barY, fillW, barH, barH / 2, g);
    }

    drawCostPill(ctx, cx, y + 208, stat, level, prestige);
}

function drawFooter(ctx, cy) {
    ctx.font = '18px FredokaOne';
    const cmd = 'use /upgrade buy';
    const rest = ' to buy more upgrades';
    const total = ctx.measureText(cmd).width + ctx.measureText(rest).width;

    let x = WIDTH / 2 - total / 2;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(cmd, x, cy);
    x += ctx.measureText(cmd).width;
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(rest, x, cy);
    ctx.textBaseline = 'alphabetic';
}

export async function renderUpgrades(player) {
    const prestige = player?.prestige?.level ?? 0;
    const contentW = WIDTH - PAD * 2;
    const cardW = (contentW - CARD_GAP * (COLS - 1)) / COLS;
    const rows = Math.ceil(UPGRADE_STATS.length / COLS);
    const gridH = rows * CARD_H + (rows - 1) * CARD_GAP;
    const height = PAD + HEADER_H + gridH + FOOTER_H;

    const canvas = createCanvas(WIDTH, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, WIDTH, height);
    drawHeader(ctx, player, prestige);

    const gridY = PAD + HEADER_H;
    UPGRADE_STATS.forEach((stat, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = PAD + col * (cardW + CARD_GAP);
        const y = gridY + row * (CARD_H + CARD_GAP);
        drawUpgradeCard(ctx, x, y, cardW, CARD_H, stat, player, prestige);
    });

    drawFooter(ctx, gridY + gridH + FOOTER_H / 2);

    return canvas.toBuffer('image/png');
}
