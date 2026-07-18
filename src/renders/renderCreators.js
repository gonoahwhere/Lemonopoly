import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import path from 'path';
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { shadeHex, blendHex } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    rankSoft: '#FFF4D6',
};

const ROLE_ACCENTS = {
    Developer: ['#8B5CF6', '#C4B5FD', '#6D28D9'],
    Coordinator: ['#14B8A6', '#5EEAD4', '#0F766E'],
    Optimizer: ['#F97316', '#FDBA74', '#C2410C'],
    default: ['#8B5CF6', '#C4B5FD', '#6D28D9'],
};

function resolveAccentColours(creator) {
    if (Array.isArray(creator.accent) && creator.accent.length >= 2) return creator.accent;
    if (typeof creator.accent === 'string') return [creator.accent, creator.accent, creator.accent];
    return ROLE_ACCENTS[creator.role] || ROLE_ACCENTS.default;
}

function representativeColour(colours, creator) {
    if (Number.isInteger(creator?.accentIndex) && colours[creator.accentIndex]) {
        return colours[creator.accentIndex];
    }
    return colours[Math.floor(colours.length / 2)];
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

async function drawAvatarCircle(ctx, cx, cy, r, avatarUrl, fallbackLetter, ringColour) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = COLOURS.rankSoft;
    ctx.fill();
    ctx.strokeStyle = ringColour || COLOURS.border;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    let img = null;
    if (avatarUrl) {
        try {
            img = await loadImage(avatarUrl);
        } catch (_) {
            img = null;
        }
    }

    if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, cx - r + 3, cy - r + 3, (r - 3) * 2, (r - 3) * 2);
        ctx.restore();
    } else {
        ctx.font = `${Math.round(r)}px FredokaOne`;
        ctx.textAlign = 'center';
        ctx.fillStyle = ringColour || COLOURS.muted;
        ctx.fillText((fallbackLetter || '?').toUpperCase(), cx, cy + r * 0.35);
        ctx.textAlign = 'left';
    }
}

const WIDTH = 900;
const PAD = 50;
const HEADER_H = 150;
const CARD_H = 130;
const CARD_GAP = 16;
const ROWS_TOP_GAP = 20;
const FOOTER_H = 60;

export async function renderCreators(data) {
    const { label = 'The Team', iconKey, creators, viewerProfile } = data;

    const cardsBlockH = creators.length * CARD_H + Math.max(0, creators.length - 1) * CARD_GAP;
    const height = HEADER_H + ROWS_TOP_GAP + cardsBlockH + ROWS_TOP_GAP + FOOTER_H;

    const canvas = createCanvas(WIDTH, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, WIDTH, height);
    drawHeader(ctx, { label, iconKey, viewerProfile });

    let cursorY = HEADER_H + ROWS_TOP_GAP;
    for (const creator of creators) {
        await drawCard(ctx, cursorY, creator);
        cursorY += CARD_H + CARD_GAP;
    }

    drawFooter(ctx, height);

    return canvas.toBuffer('image/png');
}

function drawHeader(ctx, { label, viewerProfile }) {
    ctx.font = '58px FredokaOne';

    const title = 'CREATORS';
    const isPremium = Boolean(viewerProfile?.entitlements?.premium);
    const customColours = isPremium ? viewerProfile?.customization?.nameGradientColours : null;
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
    ctx.strokeText(title, PAD, 78);

    ctx.fillStyle = titleGrad;
    ctx.fillText(title, PAD, 78);

    ctx.font = '26px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(label, PAD, 113);

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

function drawPillFromRight(ctx, rightX, y, text, { fill, border, textColour, font, padX = 14, h = 32 }) {
    ctx.font = font;
    const pillW = ctx.measureText(text).width + padX * 2;
    const pillX = rightX - pillW;

    roundedRect(ctx, pillX, y, pillW, h, h / 2, fill);
    if (border) {
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;
        roundedRectPath(ctx, pillX, y, pillW, h, h / 2);
        ctx.stroke();
    }

    ctx.fillStyle = textColour;
    ctx.fillText(text, pillX + padX, y + h / 2 + 5.5);

    return pillX;
}

async function drawCard(ctx, y, creator) {
    const { name, role, tagline, prefix, avatarUrl } = creator;
    const colours = resolveAccentColours(creator);
    const accent = representativeColour(colours, creator);

    const x = PAD;
    const w = WIDTH - PAD * 2;

    roundedRectWithShadow(ctx, x, y, w, CARD_H, 18, COLOURS.card, COLOURS.cardShadow, 12, 5);

    const borderGrad = ctx.createLinearGradient(x, y, x + w, y + CARD_H);
    colours.forEach((c, i) => borderGrad.addColorStop(i / (colours.length - 1), c));
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2.5;
    roundedRectPath(ctx, x, y, w, CARD_H, 18);
    ctx.stroke();

    const avatarR = 40;
    const avatarCx = x + 30 + avatarR;
    const avatarCy = y + CARD_H / 2;
    await drawAvatarCircle(ctx, avatarCx, avatarCy, avatarR, avatarUrl, name?.[0], accent);

    const pillY = y + 16;
    let cursorRight = x + w - 20;

    if (prefix) {
        const pillX = drawPillFromRight(ctx, cursorRight, pillY, String(prefix), {
            fill: accent + '1F',
            border: accent + '99',
            textColour: accent,
            font: '16px FredokaOne',
        });
        cursorRight = pillX - 8;
    }

    if (role) {
        const pillX = drawPillFromRight(ctx, cursorRight, pillY, role.toUpperCase(), {
            fill: accent + '1F',
            border: accent + '99',
            textColour: accent,
            font: '14px FredokaOne',
        });
        cursorRight = pillX - 8;
    }

    const textX = avatarCx + avatarR + 22;
    const textMaxW = cursorRight - textX;
    const centreY = y + CARD_H / 2;

    ctx.font = '26px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    ctx.fillText(truncate(ctx, name, textMaxW), textX, centreY - 8);

    ctx.font = '15px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(truncate(ctx, tagline || '', textMaxW), textX, centreY + 20);
}

function drawFooter(ctx, height) {
    const text = 'made with <3 by the team';

    ctx.font = '17px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';
    ctx.fillText(text, WIDTH / 2, height - FOOTER_H / 2 + 6);
    ctx.textAlign = 'left';
}