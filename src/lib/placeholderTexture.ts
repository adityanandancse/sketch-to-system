import { CanvasTexture, SRGBColorSpace, TextureLoader, type Texture } from "three";

const WIDTH = 1600;
const HEIGHT = 1000;

/** Resolves a next/font CSS variable (set on <html>) to a font-family list. */
function fontFamily(variable: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value || fallback;
}

/** Draws the generated stand-in for a work image that does not exist yet. */
function drawPlaceholder(no: string, title: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const index = Math.max(0, (parseInt(no, 10) || 1) - 1);
  const display = fontFamily("--font-display", "Impact, sans-serif");
  const mono = fontFamily("--font-mono", "monospace");

  // Ink → dark red gradient, at a different angle per project.
  const angle = ((20 + index * 47) * Math.PI) / 180;
  const dx = (Math.cos(angle) * WIDTH) / 2;
  const dy = (Math.sin(angle) * HEIGHT) / 2;
  const gradient = ctx.createLinearGradient(
    WIDTH / 2 - dx,
    HEIGHT / 2 - dy,
    WIDTH / 2 + dx,
    HEIGHT / 2 + dy,
  );
  gradient.addColorStop(0, "#0B0B0C");
  gradient.addColorStop(1, "#3a0806");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Faint 12-column graphite grid.
  ctx.strokeStyle = "rgba(138, 135, 128, 0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < 12; i++) {
    const x = Math.round((WIDTH * i) / 12) + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
  }
  ctx.stroke();

  // Project number, huge, outline only.
  ctx.font = `400 ${Math.round(HEIGHT * 0.72)}px ${display}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "#E2231A";
  ctx.lineWidth = 3;
  ctx.strokeText(no, WIDTH / 2, HEIGHT / 2 + HEIGHT * 0.03);

  // Title, small, bottom-left.
  ctx.font = `500 26px ${mono}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#F2EEE6";
  ctx.fillText(title.toUpperCase(), 56, HEIGHT - 56);

  return canvas;
}

/** Makes sure the web fonts the placeholder draws with are loaded. */
async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load(`400 100px ${fontFamily("--font-display", "sans-serif")}`),
      document.fonts.load(`500 26px ${fontFamily("--font-mono", "monospace")}`),
    ]);
  } catch {
    // Fall back to whatever the canvas resolves.
  }
}

/**
 * Loads a work image as a texture; if it is missing (404) or fails to decode,
 * returns a generated placeholder texture instead.
 */
export async function loadWorkTexture(
  url: string,
  no: string,
  title: string,
): Promise<Texture> {
  let texture: Texture;
  try {
    texture = await new TextureLoader().loadAsync(url);
  } catch {
    await ensureFonts();
    texture = new CanvasTexture(drawPlaceholder(no, title));
  }
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** The same placeholder as a data URL, for plain <img> fallbacks. */
export function placeholderDataUrl(no: string, title: string): string {
  return drawPlaceholder(no, title).toDataURL("image/jpeg", 0.85);
}
