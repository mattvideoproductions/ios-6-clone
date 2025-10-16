import { AssetLoader } from "./asset-loader.js";
import { SettingsStore } from "./settings-store.js";
import { SoundManager } from "./sound-manager.js";

const ICON_NAMES = ["calendar", "notes", "music"];
const WALLPAPER_NAME = "ios6-aqua-blue";
const TEXTURE_NAMES = ["linen", "brushed-metal"];

async function bootstrap() {
  const loader = new AssetLoader();
  const settingsStore = new SettingsStore();
  const soundManager = new SoundManager(settingsStore);
  soundManager.attach();

  const soundToggle = document.querySelector(".sound-toggle");
  const soundStatus = soundToggle?.querySelector(".status");

  const applySoundState = (settings) => {
    if (soundStatus) {
      soundStatus.textContent = settings.soundEnabled ? "On" : "Muted";
    }
    soundToggle?.setAttribute("aria-pressed", String(settings.soundEnabled));
  };

  settingsStore.subscribe(applySoundState);

  soundToggle?.addEventListener("click", () => {
    const nextState = !settingsStore.settings.soundEnabled;
    settingsStore.setSoundEnabled(nextState);
    if (nextState) {
      soundManager.play("unlock");
    }
  });

  soundToggle?.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      soundToggle.click();
    }
  });

  await loader.init();

  await hydrateIcons(loader, soundManager);
  await hydrateWallpaper(loader);
  await hydrateTextures(loader);

  document.querySelectorAll("[data-sim-action='lock']").forEach((button) => {
    button.addEventListener("click", () => {
      soundManager.play("lock");
      button.classList.add("skeuo-glow");
      setTimeout(() => button.classList.remove("skeuo-glow"), 350);
    });
  });

  document.querySelectorAll("[data-sim-action='notify']").forEach((button) => {
    button.addEventListener("click", () => {
      soundManager.play("notification");
      button.classList.add("skeuo-shadow-strong");
      setTimeout(() => button.classList.remove("skeuo-shadow-strong"), 600);
    });
  });
}

async function hydrateIcons(loader, soundManager) {
  for (const name of ICON_NAMES) {
    const container = document.querySelector(`[data-icon="${name}"]`);
    if (!container) continue;

    const img = container.querySelector("img");
    const meta = loader.getAssetMeta(name, { preferFormats: ["svg", "webp", "png"] });
    if (!img || !meta) continue;

    img.src = meta.path;
    img.alt = `${name} app icon`;
    img.loading = "lazy";

    container.addEventListener("pointerdown", () => {
      container.classList.add("skeuo-shadow-strong");
      soundManager.play("tap");
    });

    container.addEventListener("pointerup", () => {
      container.classList.remove("skeuo-shadow-strong");
    });

    container.addEventListener("pointerleave", () => {
      container.classList.remove("skeuo-shadow-strong");
    });
  }
}

async function hydrateWallpaper(loader) {
  const preview = document.querySelector("[data-wallpaper-preview]");
  if (!preview) return;

  const svgMeta = loader.getAssetMeta(WALLPAPER_NAME, { format: "svg" });
  const webpMeta = loader.getAssetMeta(WALLPAPER_NAME, { format: "webp" });
  const primaryMeta = webpMeta ?? svgMeta;

  if (!primaryMeta) return;

  const picture = document.createElement("picture");

  if (webpMeta) {
    const sourceWebp = document.createElement("source");
    sourceWebp.type = "image/webp";
    sourceWebp.srcset = webpMeta.path;
    picture.appendChild(sourceWebp);
  }

  if (svgMeta) {
    const sourceSvg = document.createElement("source");
    sourceSvg.type = "image/svg+xml";
    sourceSvg.srcset = svgMeta.path;
    picture.appendChild(sourceSvg);
  }

  const img = document.createElement("img");
  img.src = (webpMeta ?? svgMeta).path;
  img.alt = "iOS 6 aqua blue wallpaper";
  img.loading = "lazy";
  img.decoding = "async";
  picture.appendChild(img);

  preview.innerHTML = "";
  preview.appendChild(picture);

  const metaBlock = preview.parentElement?.querySelector(".meta");
  if (metaBlock) {
    metaBlock.innerHTML = `
      <span>${primaryMeta.category}</span>
      <span>${primaryMeta.format.toUpperCase()}</span>
      <span>${formatBytes(primaryMeta.bytes)}</span>
    `;
  }
}

async function hydrateTextures(loader) {
  const list = document.querySelector("[data-texture-list]");
  if (!list) return;

  list.innerHTML = "";
  for (const name of TEXTURE_NAMES) {
    const meta = loader.getAssetMeta(name, { preferFormats: ["webp", "svg", "png"] });
    if (!meta) continue;

    const card = document.createElement("div");
    card.className = "texture-card skeuo-shadow";

    const img = document.createElement("img");
    img.src = meta.path;
    img.alt = `${name} texture tile`;
    img.loading = "lazy";

    const metaRow = document.createElement("div");
    metaRow.className = "meta";
    metaRow.innerHTML = `
      <span>${meta.category}</span>
      <span>${meta.format.toUpperCase()}</span>
      <span>${formatBytes(meta.bytes)}</span>
    `;

    card.appendChild(img);
    card.appendChild(metaRow);
    list.appendChild(card);
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

document.addEventListener("DOMContentLoaded", bootstrap);
