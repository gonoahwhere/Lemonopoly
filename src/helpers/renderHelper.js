export function wrapText(ctx, text, maxWidth, maxLines) {
    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = word;
            if (lines.length === maxLines) break;
        } else {
            current = test;
        }
    }
    if (lines.length < maxLines && current) lines.push(current);

    if (lines.length === maxLines) {
        let last = lines[maxLines - 1];
        while (ctx.measureText(last + '…').width > maxWidth && last.length > 0) {
            last = last.slice(0, -1);
        }
        lines[maxLines - 1] = last + '…';
    }
    return lines;
}

export function formatNumber(value) {
    const num = Number(value) || 0;
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    const tiers = [
        { value: 1e12, suffix: 'T' },
        { value: 1e9, suffix: 'B' },
        { value: 1e6, suffix: 'M' },
        { value: 1e3, suffix: 'K' },
    ];

    for (const tier of tiers) {
        if (abs >= tier.value) {
            const scaled = abs / tier.value;
            const formatted = scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);
            return `${sign}${formatted}${tier.suffix}`;
        }
    }

    const rounded = Math.round(abs * 100) / 100;
    const formatted = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
    return `${sign}${formatted}`;
}

export function strokeCardBorder(ctx, x, y, w, h, r, roundedRectPathFn, defaultColour, customColours) {
    roundedRectPathFn(ctx, x, y, w, h, r);

    if (!customColours || customColours.length === 0) {
        ctx.strokeStyle = defaultColour;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        return;
    }

    if (customColours.length === 1) {
        ctx.strokeStyle = customColours[0];
        ctx.lineWidth = 2.5;
        ctx.stroke();
        return;
    }

    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    const step = 1 / (customColours.length - 1);
    customColours.forEach((c, i) => grad.addColorStop(i * step, c));

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.stroke();
}

export function shadeHex(hex, percent) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.max(0, (n >> 16) + Math.round(255 * percent)));
    const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + Math.round(255 * percent)));
    const b = Math.min(255, Math.max(0, (n & 0xff) + Math.round(255 * percent)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

export function blendHex(hexA, hexB) {
    const a = parseInt(hexA.slice(1), 16);
    const b = parseInt(hexB.slice(1), 16);
    const r = Math.round(((a >> 16) + (b >> 16)) / 2);
    const g = Math.round((((a >> 8) & 0xff) + ((b >> 8) & 0xff)) / 2);
    const bl = Math.round(((a & 0xff) + (b & 0xff)) / 2);
    return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1).toUpperCase()}`;
}