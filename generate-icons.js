const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = path.join(__dirname, 'public', 'favicon.ico');
const ANDROID_RES = path.join(__dirname, '..', 'dnfs.android', 'app', 'src', 'main', 'res');

function extractPngFromIco(buf) {
  const count = buf.readUInt16LE(4);
  let best = null;
  for (let i = 0; i < count; i++) {
    const entryOffset = 6 + i * 16;
    const bytesInRes = buf.readUInt32LE(entryOffset + 8);
    const offset = buf.readUInt32LE(entryOffset + 12);
    const sig = buf.slice(offset, offset + 4);
    if (sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4E && sig[3] === 0x47) {
      if (!best || bytesInRes > best.bytesInRes) {
        best = { offset, bytesInRes };
      }
    }
  }
  if (!best) throw new Error('No PNG image found in ICO');
  return buf.slice(best.offset, best.offset + best.bytesInRes);
}

const SIZES = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

async function generateIcons() {
  const icoBuffer = fs.readFileSync(SRC);
  const iconBuffer = extractPngFromIco(icoBuffer);

  for (const [density, size] of Object.entries(SIZES)) {
    const dir = path.join(ANDROID_RES, `mipmap-${density}`);
    fs.mkdirSync(dir, { recursive: true });

    await sharp(iconBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));

    await sharp(iconBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    await sharp(iconBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    console.log(`  mipmap-${density}: ${size}x${size} ✓`);
  }

  const bgDir = path.join(ANDROID_RES, 'mipmap-anydpi-v26');
  fs.mkdirSync(bgDir, { recursive: true });

  fs.writeFileSync(path.join(bgDir, 'ic_launcher.xml'), `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`);

  fs.writeFileSync(path.join(bgDir, 'ic_launcher_round.xml'), `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`);

  const valuesDir = path.join(ANDROID_RES, 'values');
  fs.mkdirSync(valuesDir, { recursive: true });

  const colorsXml = path.join(valuesDir, 'ic_launcher_background.xml');
  if (!fs.existsSync(colorsXml)) {
    fs.writeFileSync(colorsXml, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FDF6EE</color>
</resources>
`);
  }

  console.log('\n✓ Android icons generated!');
}

generateIcons().catch(console.error);
