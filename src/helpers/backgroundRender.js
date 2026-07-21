import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src', 'fonts', 'Fredoka-Bold.ttf'), 'FredokaOne');

export const COLOURS = {
    bgTop: '#FFF3C4',
    bgBottom: '#FFD98E',
    card: '#FFFDF6',
    cardShadow: '#784E0C2E',
    border: '#F0C94A',
    title: '#E7A800',
    titleLight: '#FFF3B0',
    text: '#4A3A1A',
    subtitle: '#8A7548',
    muted: '#A8934F',
    green: '#4FBF5B',
    greenSoft: '#E5F7E2',
    red: '#F0664E',
    yellow: '#FFC940',
};

export function renderBackground(player, page = 1, width = 900, height = 1000) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    drawBackground(ctx, width, height);

    return canvas.toBuffer('image/png');
}

export function drawBackground(ctx, width, height) {
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, COLOURS.bgTop);
    bg.addColorStop(0.55, '#FFE9A8');
    bg.addColorStop(1, COLOURS.bgBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    drawGlow(ctx, 60, 30, 260, '#FFFFFF59');
    drawGlow(ctx, width - 30, height - 40, 320, '#FFAA504D');
    drawGlow(ctx, width * 0.75, height * 0.15, 200, '#FFFFFF2E');

    drawWedgePattern(ctx, width, height);
    drawDappleLight(ctx, width, height);
    drawLeafSilhouette(ctx, -20, -20, 160, 0.35);
    drawLeafSilhouette(ctx, width + 20, height + 20, 200, 3.5);
    drawGrain(ctx, width, height);
    drawVignette(ctx, width, height);
}

function drawWedgePattern(ctx, width, height) {
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.strokeStyle = COLOURS.title;
    ctx.lineWidth = 2;
    const spacing = 90;
    for (let y = -spacing; y < height + spacing; y += spacing) {
        for (let x = -spacing; x < width + spacing; x += spacing) {
            const offset = (Math.floor(y / spacing) % 2) * (spacing / 2);
            drawWedge(ctx, x + offset, y, 26);
        }
    }
    ctx.restore();
}

function drawDappleLight(ctx, width, height) {

    for (let i = 0; i < 14; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const rx = Math.random() * 50 + 30;
        const ry = rx * (Math.random() * 0.4 + 0.6);
        const alpha = Math.random() * 0.12 + 0.05;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.random() * Math.PI);
        ctx.scale(1, ry / rx);
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,250,220,${alpha.toFixed(2)})`;
        ctx.fill();
        ctx.restore();
    }

    for (let i = 0; i < 60; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 2.5 + 0.5;
        const alpha = Math.random() * 0.4 + 0.1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctx.fill();
    }
}

function drawLeafSilhouette(ctx, cx, cy, size, rotation) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#3E6B1F';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.5, size * 0.15, size, 0);
    ctx.quadraticCurveTo(size * 0.5, -size * 0.15, 0, 0);
    ctx.fill();

    ctx.strokeStyle = '#00000026';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();

    ctx.restore();
}

function drawWedge(ctx, cx, cy, r) {

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
    ctx.stroke();

    const segments = 8;
    for (let i = 0; i < segments; i++) {
        const angle = (Math.PI * 2 * i) / segments;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * r * 0.78, cy + Math.sin(angle) * r * 0.78);
        ctx.stroke();
    }
}

function drawGrain(ctx, width, height) {
    ctx.save();
    for (let i = 0; i < 900; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const shade = Math.random() > 0.5 ? '255,255,255' : '120,90,20';
        ctx.fillStyle = `rgba(${shade},${(Math.random() * 0.05).toFixed(3)})`;
        ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();
}

function drawVignette(ctx, width, height) {
    const v = ctx.createRadialGradient(width / 2, height / 2, height * 0.35, width / 2, height / 2, height * 0.75);
    v.addColorStop(0, '#00000000');
    v.addColorStop(1, '#5A3C0A1F');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, width, height);
}

function drawGlow(ctx, x, y, radius, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, '#00000000');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}