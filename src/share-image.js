// Draws the shareable result image (PNG, 1080×1350 – fits WhatsApp, Instagram and most feeds).
// Only drawing lives here; the caller prepares the texts and numbers.

const W = 1080;
const H = 1350;
const PAD = 80;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const COLORS = {
  bgFrom: "#0f1b3d",
  bgTo: "#3a1e6e",
  text: "#ffffff",
  muted: "rgba(255, 255, 255, 0.72)",
  faint: "rgba(255, 255, 255, 0.10)",
  track: "rgba(255, 255, 255, 0.16)",
  good: "#6ee69a",
  highlight: "#ffd166",
};
// Category colours, same order as --series-1 … --series-8 (dark-theme steps, readable on a dark background)
const SERIES = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#2a9d2a", "#9085e9", "#e66767"];

const font = (size, weight = 400) => `${weight} ${size}px ${FONT}`;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Shortens text with an ellipsis so that it fits maxWidth.
function fit(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(s + "…").width > maxWidth) s = s.slice(0, -1);
  return s.trimEnd() + "…";
}

function drawBackground(ctx) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, COLORS.bgFrom);
  g.addColorStop(1, COLORS.bgTo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Two large, faint circles as decoration
  ctx.fillStyle = COLORS.faint;
  ctx.beginPath();
  ctx.arc(W - 60, 160, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-40, H - 260, 220, 0, Math.PI * 2);
  ctx.fill();
}

function drawBar(ctx, data, y) {
  const x = PAD;
  const w = W - 2 * PAD;
  const h = 44;
  const max = Math.max(data.scaleMax, data.totalValue * 1.05);

  ctx.save();
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = COLORS.track;
  ctx.fill();
  ctx.clip();
  let cx = x;
  data.segments.forEach((s) => {
    if (s.value <= 0) return;
    const sw = (s.value / max) * w;
    ctx.fillStyle = SERIES[s.colorIndex % SERIES.length];
    ctx.fillRect(cx, y, Math.max(0, sw - 3), h); // 3px gap between segments
    cx += sw;
  });
  ctx.restore();

  // Target band (label above the bar) and markers (labels below), as on the page
  const xAt = (value) => x + (value / max) * w;
  const bx = xAt(data.target.from);
  const bw = xAt(data.target.to) - bx;
  const bandColor = data.target.reached ? COLORS.good : COLORS.text;
  roundRect(ctx, bx, y - 6, bw, h + 12, 10);
  ctx.strokeStyle = bandColor;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = bandColor;
  ctx.font = font(26, 700);
  const bandLabel = (data.target.reached ? "✓ " : "") + data.target.label;
  ctx.fillText(bandLabel, bx + bw / 2 - ctx.measureText(bandLabel).width / 2, y - 18);

  ctx.font = font(24, 600);
  data.markers.forEach((m) => {
    const mx = xAt(m.value);
    const color = m.reached ? COLORS.good : COLORS.muted;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mx, y - 6);
    ctx.lineTo(mx, y + h + 6);
    ctx.stroke();
    const label = (m.reached ? "✓ " : "") + m.label;
    const lw = ctx.measureText(label).width;
    const lx = mx + lw / 2 > W - PAD ? mx - lw : mx - lw / 2;
    ctx.fillStyle = color;
    ctx.fillText(label, lx, y + h + 34);
  });
}

function drawStat(ctx, x, y, w, label, value) {
  roundRect(ctx, x, y, w, 140, 22);
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fill();
  ctx.fillStyle = COLORS.muted;
  ctx.font = font(30, 500);
  ctx.fillText(fit(ctx, label, w - 60), x + 30, y + 50);
  ctx.fillStyle = COLORS.text;
  ctx.font = font(56, 800);
  ctx.fillText(fit(ctx, value, w - 60), x + 30, y + 112);
}

// Largest font size (≤ max) at which text fits on one line.
function fitSize(ctx, text, maxWidth, max, min, weight) {
  let size = max;
  ctx.font = font(size, weight);
  while (ctx.measureText(text).width > maxWidth && size > min) {
    size -= 4;
    ctx.font = font(size, weight);
  }
  return size;
}

function draw(ctx, data) {
  drawBackground(ctx);
  ctx.textBaseline = "alphabetic";

  // Header: app name + year
  ctx.fillStyle = COLORS.muted;
  ctx.font = font(32, 700);
  ctx.fillText(data.appName.toUpperCase(), PAD, 120);
  ctx.font = font(32, 700);
  const yearText = String(data.year);
  const yw = ctx.measureText(yearText).width;
  roundRect(ctx, W - PAD - yw - 40, 82, yw + 40, 54, 27);
  ctx.fillStyle = COLORS.faint;
  ctx.fill();
  ctx.fillStyle = COLORS.text;
  ctx.fillText(yearText, W - PAD - yw - 20, 120);

  // Headline (one line) + big number
  const textWidth = W - 2 * PAD;
  ctx.fillStyle = COLORS.text;
  fitSize(ctx, data.headline, textWidth, 54, 36, 600);
  ctx.fillText(data.headline, PAD, 240);
  const size = fitSize(ctx, data.total, textWidth, 190, 100, 800);
  let y = 240 + 30 + size * 0.8;
  ctx.fillText(data.total, PAD, y);

  // Status relative to the targets (one line)
  ctx.fillStyle = data.statusReached ? COLORS.good : COLORS.highlight;
  fitSize(ctx, data.status, textWidth, 40, 28, 700);
  y += 75;
  ctx.fillText(data.status, PAD, y);

  // Bar with the target band and markers
  const barY = y + 80;
  drawBar(ctx, data, barY);

  // Cuts vs taxes
  y = barY + 44 + 66;
  const half = (textWidth - 24) / 2;
  drawStat(ctx, PAD, y, half, data.cutsLabel, data.cuts);
  drawStat(ctx, PAD + half + 24, y, half, data.taxesLabel, data.taxes);

  // Biggest choices (must end above the footer at H - 200)
  y += 140 + 64;
  if (data.top.length) {
    ctx.fillStyle = COLORS.muted;
    ctx.font = font(30, 600);
    ctx.fillText(data.topLabel, PAD, y);
    data.top.forEach((item) => {
      y += 58;
      ctx.font = font(36, 800);
      const aw = ctx.measureText(item.amount).width;
      ctx.fillStyle = COLORS.text;
      ctx.fillText(item.amount, W - PAD - aw, y);
      ctx.font = font(34, 500);
      ctx.fillText(fit(ctx, item.name, W - 2 * PAD - aw - 30), PAD, y);
    });
  }

  // Footer: call to action + source
  ctx.fillStyle = COLORS.highlight;
  ctx.font = font(52, 800);
  ctx.fillText(data.cta, PAD, H - 150);
  ctx.fillStyle = COLORS.muted;
  ctx.font = font(26, 500);
  ctx.fillText(fit(ctx, data.source, W - 2 * PAD), PAD, H - 98);
  if (data.url) {
    ctx.fillStyle = COLORS.text;
    ctx.font = font(30, 700);
    ctx.fillText(fit(ctx, data.url, W - 2 * PAD), PAD, H - 56);
  }
}

// data: { appName, year, headline, total, totalValue, status, statusReached, scaleMax, segments: [{ value, colorIndex }],
//         target: { from, to, label, reached }, markers: [{ value, label, reached }], cutsLabel, cuts, taxesLabel, taxes, topLabel, top: [{ name, amount }],
//         cta, source, url }
// Returns a Promise<Blob> (image/png).
export function renderShareImage(data) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  draw(canvas.getContext("2d"), data);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/png")
  );
}

