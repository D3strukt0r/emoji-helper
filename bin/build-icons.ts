import { fileURLToPath } from 'url';
import * as path from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  for (const size of [16, 24, 32, 48, 128]) {
    const srcIcon = path.resolve(__dirname, `../src/icon/emoji-ios-grinning.png`);
    // eslint-disable-next-line no-console
    console.log(`Resizing ${srcIcon} to ${size}x${size} ...`);
    await sharp(srcIcon)
      .resize(size, size)
      .toFile(path.resolve(__dirname, `../public/icon-${size}.png`));
  }
})();
