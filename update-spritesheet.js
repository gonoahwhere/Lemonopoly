import { createCanvas, loadImage } from '@napi-rs/canvas';
import { MaxRectsPacker } from 'maxrects-packer';
import { readdir } from 'node:fs/promises';
import { writeFile } from 'node:fs';
import { join } from 'node:path';

const MAX_SIZE = 8192 * 8192;

async function loadSprites(key) {
  const dir = `./images/${key}`;

  return await Promise.all((await readdir(dir)).map(path => loadImage(join(dir, path)).then(image => ({
    width: image.width,
    height: image.height,
    data: {
      name: `${key.replace(/s?$/, '')}.${path.replace(/s?\.png$/, '')}`,
      image
    }
  }))));
}

function getPackSize(width, height) {
  const packer = new MaxRectsPacker(width, height);

  packer.addArray(input);

  if (packer.bins.length > 1) {
    return null;
  }

  width = -1;
  height = -1;
  let oversized = 0;

  for (const rect of packer.bins[0].rects) {
    const currentWidth = rect.x + rect.width;
    const currentHeight = rect.y + rect.height;

    if (width < currentWidth) {
      width = currentWidth;
    }

    if (height < currentHeight) {
      height = currentHeight;
    }

    oversized += rect.oversized;
  }

  return Boolean(oversized) ? null : {
    width,
    height
  };
}

const input = (await Promise.all([
  loadSprites('drinks'),
  loadSprites('ingredients'),
  loadSprites('icons')
])).flat();

let smallestIndividualWidth = -1;
let smallestIndividualHeight = -1;

for (const individual of input) {
  if (smallestIndividualWidth < individual.width) {
    smallestIndividualWidth = individual.width;
  }

  if (smallestIndividualHeight < individual.height) {
    smallestIndividualHeight = individual.height;
  }
}

let smallestOptimalScore = ((BigInt(MAX_SIZE) ** 2n) * 2n) + 1n;
let smallestReferenceWidth = null;
let smallestReferenceHeight = null;
let smallestSize = null;

for (let w = MAX_SIZE; w >= smallestIndividualWidth; w /= 2) {
  for (let h = MAX_SIZE; h >= smallestIndividualHeight; h /= 2) {
    const size = getPackSize(w, h);

    if (size !== null) {
      const optimalScore = (BigInt(w) * BigInt(h)) + (BigInt(size.width) * BigInt(size.height));

      if (optimalScore < smallestOptimalScore) {
        smallestOptimalScore = optimalScore;
        smallestReferenceWidth = w;
        smallestReferenceHeight = h;
        smallestSize = size;
      }
    }
  }
}

const packer = new MaxRectsPacker(smallestReferenceWidth, smallestReferenceHeight);

packer.addArray(input);

const canvas = createCanvas(smallestSize.width, smallestSize.height);
const ctx = canvas.getContext('2d');

const output = {};

for (const rect of packer.bins[0].rects) {
  ctx.drawImage(rect.data.image, rect.x, rect.y);

  output[rect.data.name] = {
    x: rect.x,
    y: rect.y,
    w: rect.width,
    h: rect.height
  };
}

await Promise.all([
  canvas.encode('png').then(encoded => writeFile('./images/sprites/spritesheet.png', encoded, () => {})),
  writeFile('./images/sprites/spritesheet.json', JSON.stringify(output, null, 2), () => {})
]);
