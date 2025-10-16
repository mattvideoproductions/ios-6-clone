import { promises as fs } from 'fs';
import path from 'path';

const __dirname = process.cwd();
const ASSET_ROOT = path.resolve(__dirname, 'assets');
const OUTPUT_PATH = path.resolve(ASSET_ROOT, 'asset-manifest.json');

const CATEGORY_PRELOAD_DEFAULTS = {
  icons: true,
  wallpapers: false,
  textures: false,
  audio: false,
};

const ALLOWED_FORMATS = new Set([
  'svg',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'json',
  'mp3',
  'ogg',
  'wav',
]);

async function main() {
  const entries = await collectAssets(ASSET_ROOT);

  const manifest = {
    generatedAt: new Date().toISOString(),
    assetCount: entries.length,
    assets: entries.sort(sortAssets),
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`Asset manifest generated with ${entries.length} entries.`);
}

function sortAssets(a, b) {
  if (a.category !== b.category) {
    return a.category.localeCompare(b.category);
  }

  if (a.name !== b.name) {
    return a.name.localeCompare(b.name);
  }

  return a.format.localeCompare(b.format);
}

async function collectAssets(rootDir) {
  const results = [];

  async function walk(currentDir) {
    const dirEntries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of dirEntries) {
      const fullPath = path.resolve(currentDir, entry.name);
      const relativePath = path.relative(rootDir, fullPath);

      if (relativePath === 'asset-manifest.json') {
        continue;
      }

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (entry.isFile()) {
        const category = relativePath.split(path.sep)[0];

        if (!category || category.startsWith('.')) {
          continue;
        }

        if (!CATEGORY_PRELOAD_DEFAULTS.hasOwnProperty(category)) {
          continue;
        }

        const stat = await fs.stat(fullPath);
        const ext = path.extname(entry.name).slice(1);
        const name = path.basename(entry.name, path.extname(entry.name));
        const normalizedPath = relativePath.replace(/\\/g, '/');
        const format = ext.toLowerCase();
        if (!ALLOWED_FORMATS.has(format)) {
          continue;
        }

        const webPath = `/assets/${normalizedPath}`;

        const meta = {
          id: normalizedPath,
          name,
          category,
          format,
          path: webPath,
          bytes: stat.size,
          preload: CATEGORY_PRELOAD_DEFAULTS[category] ?? false,
        };

        if (meta.format === 'svg') {
          const content = await fs.readFile(fullPath, 'utf8');
          const viewBox = extractSvgViewBox(content);
          if (viewBox) {
            meta.viewBox = viewBox;
          }
        }

        results.push(meta);
      }
    }
  }

  await walk(rootDir);
  return results;
}

function extractSvgViewBox(svgContent) {
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/i);
  if (!viewBoxMatch) {
    return undefined;
  }

  const parts = viewBoxMatch[1].split(/\s+/).map(Number);
  if (parts.length === 4 && parts.every((value) => Number.isFinite(value))) {
    const [, , width, height] = parts;
    return { width, height };
  }

  return undefined;
}

main().catch((error) => {
  console.error('Failed to generate asset manifest:', error);
  process.exitCode = 1;
});
