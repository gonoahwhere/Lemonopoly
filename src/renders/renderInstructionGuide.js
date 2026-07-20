import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { getIconFromCache } from '../data/iconImages.js';
import { COLOURS as BASE_COLOURS, drawBackground } from '../helpers/backgroundRender.js';
import { wrapText, strokeCardBorder, shadeHex, blendHex } from '../helpers/renderHelper.js';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

const COLOURS = {
    ...BASE_COLOURS,
    tip: '#C98A1E',
    tipSoft: 'rgba(201,138,30,0.12)',
};

export const WIDTH = 700;
export const HEIGHT = 860;
const PAD = 50;
const HEADER_H = 130;
const FOOTER_H = 50;
const BOTTOM_GAP = 24;

const CARD_X = PAD;
const CARD_W = WIDTH - PAD * 2;
const CARD_Y = HEADER_H;
const CARD_H = HEIGHT - HEADER_H - BOTTOM_GAP - FOOTER_H;

const CARD_PAD_TOP = 28;
const CARD_PAD_BOTTOM = 24;
export const CONTENT_H = CARD_H - CARD_PAD_TOP - CARD_PAD_BOTTOM;
const CONTENT_X = CARD_X + 20;
const CONTENT_W = CARD_W - 40;

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

function truncate(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let trimmed = text;
    while (trimmed.length > 1 && ctx.measureText(trimmed + '…').width > maxWidth) {
        trimmed = trimmed.slice(0, -1);
    }
    return trimmed + '…';
}

let scratchCtx = null;
function getScratchCtx() {
    if (!scratchCtx) scratchCtx = createCanvas(WIDTH, 100).getContext('2d');
    return scratchCtx;
}

function drawGuideHeader(ctx, { eyebrow, title, accent, page, totalPages, profile }) {
    const customColours = profile?.entitlements?.premium ? profile.customization?.nameGradientColours : null;
    const hasCustomGradient = Array.isArray(customColours) && customColours.length === 2;
    const fillColours = hasCustomGradient ? customColours : [COLOURS.title, accent];
    const strokeColour = hasCustomGradient ? shadeHex(blendHex(customColours[0], customColours[1]), -0.45) : COLOURS.text;

    ctx.font = '38px FredokaOne';
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

    ctx.font = '19px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.fillText(truncate(ctx, eyebrow, WIDTH - 100), 54, 90);

    const pageLabel = `PAGE ${page} / ${totalPages}`;
    ctx.font = '16px FredokaOne';
    const padX = 14;
    const pillW = ctx.measureText(pageLabel).width + padX * 2;
    drawPill(ctx, WIDTH - 50 - pillW, 26, pageLabel, accent, accent + '1F', undefined, 16, padX, 34);

    const divGrad = ctx.createLinearGradient(45, 0, WIDTH - 45, 0);
    divGrad.addColorStop(0, `${accent}00`);
    divGrad.addColorStop(0.5, `${accent}80`);
    divGrad.addColorStop(1, `${accent}00`);
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 112);
    ctx.lineTo(WIDTH - 45, 112);
    ctx.stroke();
}

function drawGuideFooter(ctx, text) {
    if (!text) return;
    ctx.font = '15px FredokaOne';
    ctx.fillStyle = COLOURS.subtitle;
    ctx.textAlign = 'center';
    ctx.fillText(text, WIDTH / 2, HEIGHT - FOOTER_H / 2 + 5);
    ctx.textAlign = 'left';
}

function drawCardShell(ctx, accent) {
    roundedRectWithShadow(ctx, CARD_X, CARD_Y, CARD_W, CARD_H, 20, COLOURS.card, COLOURS.cardShadow);
    strokeCardBorder(ctx, CARD_X, CARD_Y, CARD_W, CARD_H, 20, roundedRectPath, accent + '55', [accent]);
}

function newFixedCanvas() {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    drawBackground(ctx, WIDTH, HEIGHT);
    return { canvas, ctx };
}

export async function renderGuideContents(sections, profile, page = 1, totalPages = 1) {
    const accent = '#8A7548';
    const { canvas, ctx } = newFixedCanvas();

    drawGuideHeader(ctx, { eyebrow: 'Everything there is to know about Lemonopoly', title: 'LEMONOPOLY MANUAL', accent, page, totalPages, profile });
    drawCardShell(ctx, accent);

    const ROW_GAP = 8;
    const SECTION_GAP = 22;
    const SECTION_HEADER_H = 34;

    const totalRows = sections.reduce((sum, section) => sum + section.items.length, 0);
    const reservedHeight = (sections.length * SECTION_HEADER_H) + ((sections.length - 1) * SECTION_GAP) + ((totalRows - 1) * ROW_GAP);
    const rawRowH = (CONTENT_H - reservedHeight) / totalRows;
    const ROW_H = Math.max(38, Math.min(56, rawRowH));

    let rowY = CARD_Y + CARD_PAD_TOP;

    for (const section of sections) {

        // Section heading
        ctx.font = '22px FredokaOne';
        ctx.fillStyle = section.accent ?? accent;
        ctx.fillText(section.title, CONTENT_X, rowY + 18);

        // Divider
        ctx.strokeStyle = (section.accent ?? accent) + '55';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(CONTENT_X, rowY + 28);
        ctx.lineTo(CONTENT_X + CONTENT_W, rowY + 28);
        ctx.stroke();

        rowY += SECTION_HEADER_H;

        for (const chapter of section.items) {

            const rowX = CONTENT_X;
            const rowW = CONTENT_W;

            const iconR = Math.min(18, ROW_H / 2 - 2);
            const iconCx = rowX + iconR;
            const iconCy = rowY + ROW_H / 2;

            ctx.beginPath();
            ctx.arc(iconCx, iconCy, iconR, 0, Math.PI * 2);
            ctx.fillStyle = (chapter.accent ?? accent) + '1F';
            ctx.fill();

            ctx.strokeStyle = (chapter.accent ?? accent) + '55';
            ctx.lineWidth = 1.4;
            ctx.stroke();

            const icon = getIconFromCache(chapter.iconKey);

            if (icon) {
                ctx.save();

                ctx.beginPath();
                ctx.arc(iconCx, iconCy, iconR - 4, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(icon, iconCx - iconR + 4, iconCy - iconR + 4, (iconR - 4) * 2, (iconR - 4) * 2);

                ctx.restore();
            }

            ctx.font = '20px FredokaOne';
            ctx.fillStyle = COLOURS.subtitle;

            const labelX = iconCx + iconR + 18;
            ctx.fillText(chapter.label, labelX, iconCy + 7);
            const pageText = chapter.fromPage === chapter.toPage ? `PAGE ${chapter.fromPage}` : `PAGES ${chapter.fromPage}–${chapter.toPage}`;

            ctx.font = '16px FredokaOne';
            ctx.fillStyle = chapter.accent ?? accent;
            ctx.textAlign = 'right';
            ctx.fillText(pageText, rowX + rowW - 4, iconCy + 6);
            ctx.textAlign = 'left';

            ctx.save();

            ctx.strokeStyle = (chapter.accent ?? accent) + '33';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([2, 4]);
            const leaderStart = labelX + ctx.measureText(chapter.label).width + 12;
            ctx.font = '16px FredokaOne';
            const leaderEnd = rowX + rowW - 4 - ctx.measureText(pageText).width - 12;

            if (leaderEnd > leaderStart) {
                ctx.beginPath();
                ctx.moveTo(leaderStart, iconCy + 2);
                ctx.lineTo(leaderEnd, iconCy + 2);
                ctx.stroke();
            }

            ctx.restore();
            rowY += ROW_H + ROW_GAP;
        }

        rowY += SECTION_GAP;
    }

    drawGuideFooter(ctx, 'tap the arrows below to flip through the manual');
    return canvas.toBuffer('image/png');
}

const CMD_TOP_PAD = 14;
const CMD_PILL_H = 28;
const CMD_GAP_AFTER_PILL = 10;
const CMD_DESC_LINE_H = 19;
const CMD_BOTTOM_PAD = 14;
const CMD_ROW_GAP = 14;

function measureCommandRow(ctx, w, command) {
    const usage = command.usage ?? `/${command.name}`;
    ctx.font = '15px FredokaOne';
    const descLines = wrapText(ctx, command.description, w - 32, 12);
    const rowH = CMD_TOP_PAD + CMD_PILL_H + CMD_GAP_AFTER_PILL + descLines.length * CMD_DESC_LINE_H + CMD_BOTTOM_PAD;
    return { usage, descLines, rowH };
}

function drawCommandRow(ctx, x, y, w, measured, accent) {
    const boxH = measured.rowH;
    roundedRect(ctx, x, y, w, boxH, 12, accent + '0D');
    ctx.strokeStyle = accent + '33';
    ctx.lineWidth = 1;
    roundedRectPath(ctx, x, y, w, boxH, 12);
    ctx.stroke();

    drawPill(ctx, x + 16, y + CMD_TOP_PAD, measured.usage, accent, accent + '1F', accent + '55', 15, 12, CMD_PILL_H);

    ctx.font = '15px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    const descStartY = y + CMD_TOP_PAD + CMD_PILL_H + CMD_GAP_AFTER_PILL + 14;
    measured.descLines.forEach((line, i) => {
        ctx.fillText(line, x + 16, descStartY + i * CMD_DESC_LINE_H);
    });
}

export function planCommandPages(commands) {
    const ctx = getScratchCtx();
    const pages = [];
    let current = [];
    let usedH = 0;

    commands.forEach((cmd) => {
        const measured = measureCommandRow(ctx, CONTENT_W, cmd);
        const addedH = current.length === 0 ? measured.rowH : measured.rowH + CMD_ROW_GAP;

        if (current.length > 0 && usedH + addedH > CONTENT_H) {
            pages.push(current);
            current = [cmd];
            usedH = measured.rowH;
        } else {
            current.push(cmd);
            usedH += addedH;
        }
    });

    if (current.length > 0) pages.push(current);
    return pages;
}

export async function renderGuideCommands(category, commands, profile, page = 1, totalPages = 1, part = null) {
    const accent = category.accent ?? '#4CAF6D';
    const { canvas, ctx } = newFixedCanvas();

    const partSuffix = part && part.totalParts > 1 ? ` (${part.index}/${part.totalParts})` : '';
    drawGuideHeader(ctx, { eyebrow: `${category.description} ${partSuffix}`, title: category.name, accent, page, totalPages, profile });
    drawCardShell(ctx, accent);

    let rowY = CARD_Y + CARD_PAD_TOP;
    commands.forEach((cmd) => {
        const measured = measureCommandRow(ctx, CONTENT_W, cmd);
        drawCommandRow(ctx, CONTENT_X, rowY, CONTENT_W, measured, accent);
        rowY += measured.rowH + CMD_ROW_GAP;
    });

    drawGuideFooter(ctx, `< > required • [ ] optional`);
    return canvas.toBuffer('image/png');
}

const ICON_BLOCK_H = 128;
const CONT_HEADER_H = 46;
const DESC_LINE_H = 24;
const DESC_GAP_AFTER = 22;
const BULLET_GAP = 14;
const PARA_LINE_H = 24;
const TIP_GAP_MIN = 16;

function measureDescription(ctx, description) {
    ctx.font = '17px FredokaOne';
    return wrapText(ctx, description, CONTENT_W, 12);
}

function measureFeatureBullet(ctx, text) {
    ctx.font = '17px FredokaOne';
    const lines = wrapText(ctx, text, CONTENT_W - 64, 8);
    const h = Math.max(24, lines.length * 15 + 10);
    return { lines, h };
}

function drawFeatureBullet(ctx, x, y, block, accent) {
    drawStarBullet(ctx, x + 22, y + 13, accent, 9);
    ctx.font = '17px FredokaOne';
    ctx.fillStyle = COLOURS.text;
    block.lines.forEach((line, i) => {
        ctx.fillText(line, x + 44, y + 18 + i * 15);
    });
}

function measureTip(ctx, tip) {
    ctx.font = '15px FredokaOne';
    const lines = wrapText(ctx, tip, CONTENT_W - 20, 8);
    const h = 20 + lines.length * 19 + 16;
    return { lines, h };
}

export function planFeaturePages(feature) {
    const ctx = getScratchCtx();
    const descLines = measureDescription(ctx, feature.description);
    const tip = feature.tip ? measureTip(ctx, feature.tip) : null;
    const content = feature.content ?? null;

    let bulletBlocks = null;
    let paragraphLines = null;
    if (content?.type === 'bullets') {
        bulletBlocks = content.items.map((item) => measureFeatureBullet(ctx, item));
    } else if (content?.type === 'paragraph') {
        ctx.font = '17px FredokaOne';
        paragraphLines = wrapText(ctx, content.text, CONTENT_W, 200);
    }

    let bulletIndex = 0;
    let paraLineIndex = 0;
    let tipPlaced = !tip;
    let needsFirstPage = true;

    const hasMoreContent = () => {
        if (bulletBlocks) return bulletIndex < bulletBlocks.length;
        if (paragraphLines) return paraLineIndex < paragraphLines.length;
        return false;
    };

    const pages = [];

    while (needsFirstPage || hasMoreContent() || !tipPlaced) {
        const isFirst = needsFirstPage;
        let used = isFirst ? ICON_BLOCK_H : CONT_HEADER_H;
        if (isFirst) used += descLines.length * DESC_LINE_H + DESC_GAP_AFTER;

        const pageBullets = [];
        const pageParaLines = [];

        if (bulletBlocks) {
            while (bulletIndex < bulletBlocks.length) {
                const block = bulletBlocks[bulletIndex];
                const addedH = pageBullets.length === 0 ? block.h : block.h + BULLET_GAP;
                if (pageBullets.length > 0 && used + addedH > CONTENT_H) break;
                pageBullets.push(block);
                used += addedH;
                bulletIndex += 1;
            }
        } else if (paragraphLines) {
            while (paraLineIndex < paragraphLines.length) {
                if (used + PARA_LINE_H > CONTENT_H) break;
                pageParaLines.push(paragraphLines[paraLineIndex]);
                used += PARA_LINE_H;
                paraLineIndex += 1;
            }
        }

        let includeTip = false;
        if (!tipPlaced && !hasMoreContent()) {
            const tipTop = CONTENT_H - tip.h;
            const gapNeeded = used > 0 ? TIP_GAP_MIN : 0;
            if (used + gapNeeded <= tipTop) {
                includeTip = true;
                tipPlaced = true;
            }
        }

        pages.push({ isFirst, bullets: pageBullets, paraLines: pageParaLines, includeTip });
        needsFirstPage = false;

        if (pageBullets.length === 0 && pageParaLines.length === 0 && !includeTip && !hasMoreContent() && !tipPlaced) {
            pages[pages.length - 1].includeTip = true;
            tipPlaced = true;
        }
    }

    return pages.map((p, idx) => ({
        ...p,
        part: idx + 1,
        totalParts: pages.length,
        descLines,
        tipLines: p.includeTip ? tip.lines : null,
    }));
}

export async function renderGuideFeature(feature, profile, page = 1, totalPages = 1, part) {
    const accent = feature.accent ?? '#3C8FD1';
    const { canvas, ctx } = newFixedCanvas();

    const partSuffix = part && part.totalParts > 1 ? ` (${part.part}/${part.totalParts})` : '';
    drawGuideHeader(ctx, { eyebrow: `Core Feature${partSuffix}`, title: 'HOW IT WORKS', accent, page, totalPages, profile });
    drawCardShell(ctx, accent);

    let cursorY = CARD_Y + CARD_PAD_TOP;
    const centreX = CARD_X + CARD_W / 2;

    if (part.isFirst) {
        const iconR = 34;
        const iconCy = cursorY + iconR;

        ctx.beginPath();
        ctx.arc(centreX, iconCy, iconR, 0, Math.PI * 2);
        ctx.fillStyle = accent + '1F';
        ctx.fill();
        ctx.strokeStyle = accent + '55';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        const icon = getIconFromCache(feature.iconKey);
        if (icon) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(centreX, iconCy, iconR - 6, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(icon, centreX - iconR + 6, iconCy - iconR + 6, (iconR - 6) * 2, (iconR - 6) * 2);
            ctx.restore();
        }

        ctx.font = '24px FredokaOne';
        ctx.fillStyle = COLOURS.text;
        ctx.textAlign = 'center';
        ctx.fillText(feature.title, centreX, iconCy + iconR + 30);
        ctx.textAlign = 'left';

        cursorY += ICON_BLOCK_H;

        ctx.font = '17px FredokaOne';
        ctx.fillStyle = COLOURS.subtitle;
        ctx.textAlign = 'center';
        part.descLines.forEach((line, i) => {
            ctx.fillText(line, centreX, cursorY + 15 + i * DESC_LINE_H);
        });
        ctx.textAlign = 'left';
        cursorY += part.descLines.length * DESC_LINE_H + DESC_GAP_AFTER;
    } else {
        ctx.font = '22px FredokaOne';
        ctx.fillStyle = COLOURS.text;
        ctx.fillText(feature.title, CONTENT_X, cursorY + 20);
        ctx.font = '14px FredokaOne';
        ctx.fillStyle = COLOURS.subtitle;
        ctx.fillText('continued', CONTENT_X, cursorY + 40);
        cursorY += CONT_HEADER_H;
    }

    if (part.bullets.length > 0) {
        part.bullets.forEach((block, i) => {
            drawFeatureBullet(ctx, CONTENT_X, cursorY, block, accent);
            cursorY += block.h;
            if (i < part.bullets.length - 1) cursorY += BULLET_GAP;
        });
    } else if (part.paraLines.length > 0) {
        ctx.font = '17px FredokaOne';
        ctx.fillStyle = COLOURS.text;
        part.paraLines.forEach((line, i) => {
            ctx.fillText(line, CONTENT_X, cursorY + 17 + i * PARA_LINE_H);
        });
        cursorY += part.paraLines.length * PARA_LINE_H;
    }

    if (part.includeTip) {
        const tipBoxH = 20 + part.tipLines.length * 19 + 16;
        const tipY = CARD_Y + CARD_H - CARD_PAD_BOTTOM - tipBoxH;

        roundedRect(ctx, CONTENT_X, tipY, CONTENT_W, tipBoxH, 14, COLOURS.tipSoft);
        ctx.strokeStyle = COLOURS.tip + '55';
        ctx.lineWidth = 1.2;
        roundedRectPath(ctx, CONTENT_X, tipY, CONTENT_W, tipBoxH, 14);
        ctx.stroke();

        ctx.font = '15px FredokaOne';
        ctx.fillStyle = COLOURS.tip;
        ctx.fillText('TIP', CONTENT_X + 16, tipY + 22);

        ctx.fillStyle = COLOURS.text;
        part.tipLines.forEach((line, i) => {
            ctx.fillText(line, CONTENT_X + 16, tipY + 42 + i * 19);
        });
    }

    return canvas.toBuffer('image/png');
}