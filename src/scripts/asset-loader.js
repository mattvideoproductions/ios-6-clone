const DEFAULT_MANIFEST_URL = "/assets/asset-manifest.json";
const FORMAT_PRIORITY = ["webp", "svg", "png", "jpg", "jpeg", "json", "ogg", "mp3", "wav"];

export class AssetLoader {
  constructor(manifestUrl = DEFAULT_MANIFEST_URL) {
    this.manifestUrl = manifestUrl;
    this.assetsById = new Map();
    this.assetsByName = new Map();
    this.initialized = false;
    this.manifest = null;
  }

  async init() {
    if (this.initialized) return;
    const response = await fetch(this.manifestUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load asset manifest: ${response.status}`);
    }

    const manifest = await response.json();
    this.manifest = manifest;

    for (const entry of manifest.assets ?? []) {
      this.register(entry);
    }

    this.initialized = true;
  }

  register(entry) {
    this.assetsById.set(entry.id, { ...entry });

    const list = this.assetsByName.get(entry.name) ?? [];
    list.push({ ...entry });
    list.sort(compareByFormatPriority);
    this.assetsByName.set(entry.name, list);
  }

  async ensure() {
    if (!this.initialized) {
      await this.init();
    }
  }

  async preloadCategory(category) {
    await this.ensure();
    const matches = this.listByCategory(category);
    await Promise.all(matches.map((asset) => this.preload(asset)));
    return matches;
  }

  listByCategory(category) {
    return Array.from(this.assetsById.values()).filter((asset) => asset.category === category);
  }

  getAssetMeta(name, options = {}) {
    const list = this.assetsByName.get(name) ?? [];
    if (!list.length) return null;

    if (options.format) {
      const match = list.find((item) => item.format === options.format);
      if (match) return match;
    }

    if (options.preferFormats) {
      for (const format of options.preferFormats) {
        const match = list.find((item) => item.format === format);
        if (match) return match;
      }
    }

    return list[0];
  }

  getAssetVariants(name) {
    const list = this.assetsByName.get(name) ?? [];
    return list.map((item) => ({ ...item }));
  }

  async preload(asset) {
    if (!asset || asset.preloaded) return asset;

    if (["svg", "png", "webp", "jpg", "jpeg"].includes(asset.format)) {
      await this.createImage(asset.path);
      asset.preloaded = true;
      this.updateStoredAsset(asset);
      return asset;
    }

    if (asset.category === "audio") {
      await fetch(asset.path, { cache: "force-cache" });
      asset.preloaded = true;
      this.updateStoredAsset(asset);
      return asset;
    }

    return asset;
  }

  updateStoredAsset(asset) {
    if (!asset?.id) return;
    const stored = this.assetsById.get(asset.id);
    if (stored) {
      stored.preloaded = asset.preloaded;
    }

    const variants = this.assetsByName.get(asset.name);
    if (variants) {
      const target = variants.find((item) => item.id === asset.id);
      if (target) {
        target.preloaded = asset.preloaded;
      }
    }
  }

  async load(nameOrId, options = {}) {
    await this.ensure();
    const preferFormats = options.preferFormats ?? (options.format ? [options.format] : undefined);

    let asset = null;
    if (options.id) {
      asset = this.assetsById.get(options.id);
    } else if (nameOrId && nameOrId.includes("/")) {
      asset = this.assetsById.get(nameOrId);
    } else {
      const lookupName = nameOrId ?? options.name;
      asset = this.getAssetMeta(lookupName, { format: options.format, preferFormats });
    }

    if (!asset) {
      throw new Error(`Asset not found: ${nameOrId ?? options.id ?? options.name}`);
    }

    if (!asset.preloaded && (asset.preload || options.preload)) {
      await this.preload(asset);
    }

    switch (asset.format) {
      case "svg":
        return this.fetchText(asset.path);
      case "png":
      case "jpg":
      case "jpeg":
      case "webp":
        return this.createImage(asset.path);
      case "json":
        return this.fetchJson(asset.path);
      default:
        return asset.path;
    }
  }

  async fetchText(url) {
    const response = await fetch(url, { cache: "force-cache" });
    return response.text();
  }

  async fetchJson(url) {
    const response = await fetch(url, { cache: "force-cache" });
    return response.json();
  }

  createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.decoding = "async";
      img.loading = "lazy";
      img.src = url;
    });
  }
}

function compareByFormatPriority(a, b) {
  const aIndex = FORMAT_PRIORITY.indexOf(a.format);
  const bIndex = FORMAT_PRIORITY.indexOf(b.format);

  if (aIndex === -1 && bIndex === -1) {
    return a.format.localeCompare(b.format);
  }

  if (aIndex === -1) return 1;
  if (bIndex === -1) return -1;
  return aIndex - bIndex;
}
