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