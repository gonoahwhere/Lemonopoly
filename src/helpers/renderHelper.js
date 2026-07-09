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