import { loadImage } from '@napi-rs/canvas';
import { readFile } from 'fs/promises';
import path from 'path';

let sheet;
let sheetData;

export async function loadSprites() {
    [sheet, sheetData] = await Promise.all([
        loadImage(path.join(process.cwd(), 'images', 'sprites', 'spritesheet.png')),
        readFile(path.join(process.cwd(), 'images', 'sprites', 'spritesheet.json'))
    ]);

    sheetData = JSON.parse(sheetData);
}

export function getSprite(id) {
    return {
        sheet,
        ...sheetData[id]
    };
}