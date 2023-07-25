import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const targetIconsDir = path.resolve(__dirname, '../public/icons');
  if (!fs.existsSync(targetIconsDir)) {
    fs.mkdirSync(targetIconsDir, { recursive: true });
  }

  for await (const size of [16, 24, 32, 48, 128]) {
    const srcIcon = path.resolve(__dirname, `../src/icon/emoji-ios-grinning.png`);
    // eslint-disable-next-line no-console
    console.log(`Resizing ${srcIcon} to ${size}x${size} ...`);
    await sharp(srcIcon)
      .resize(size, size)
      .toFile(path.resolve(targetIconsDir, `${size}.png`));
  }
})();
