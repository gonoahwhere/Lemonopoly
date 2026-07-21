import { loadImage } from '@napi-rs/canvas';
import { readFile } from 'fs/promises';
import path from 'path';

let sheet
let sheetData

export async function loadSprites() {
    sheet = await loadImage(path.join(process.cwd(), 'images', 'sprites', 'spritesheet.png'))
    sheetData = JSON.parse(await readFile(path.join(process.cwd(), 'images', 'sprites', 'spritesheet.json')))
}

export function getSprite(id) {
    return {
        sheet,
        ...sheetData[id]
    }
}