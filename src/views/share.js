// Sharing: a link to the current choices, and a result image in a preview dialog.

import { CONFIG } from "../../content/config.js";
import { DATA } from "../../data/measures.js";
import { state, shareUrl } from "../state.js";
import { M, totals, selectedImpact } from "../model.js";
import { t, loc, nameOf, formatEur } from "../text.js";
import { $, toast } from "../ui.js";
import { renderShareImage } from "../share-image.js";

export async function shareLink() {
  const text = t("shareText", { total: formatEur(totals().total) });
  const url = shareUrl();
  try {
    if (navigator.share) {
      await navigator.share({ title: t("appName"), text, url });
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast(t("toastCopied"));
  } catch (e) {
    if (e?.name !== "AbortError") toast(t("toastCopyFailed"));
  }
}

function imageData() {
  const { spending, taxes, total, byCategory } = totals();
  const milestones = CONFIG.milestones;
  const reached = milestones.filter((ms) => total >= ms.value);
  const next = milestones.find((ms) => total < ms.value);
  let status;
  if (!next) status = t("imageAllReached");
  else if (reached.length) status = t("imageReached", { name: loc(reached[reached.length - 1].name) });
  else status = t("imageMissing", { target: formatEur(next.value), missing: formatEur(next.value - total) });
  // The address is printed on the image only when the page is hosted somewhere
  const hosted = /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  return {
    appName: t("appName"),
    year: state.year,
    headline: t("imageHeadline"),
    total: formatEur(total),
    totalValue: total,
    status,
    statusReached: reached.length > 0,
    scaleMax: CONFIG.scaleMax,
    segments: DATA.categories.map((c, i) => ({ value: byCategory[c.id], colorIndex: i })),
    milestones: milestones.map((ms) => ({ value: ms.value, label: loc(ms.short), reached: total >= ms.value })),
    cutsLabel: t("imageCuts"),
    cuts: formatEur(spending),
    taxesLabel: t("imageTaxes"),
    taxes: formatEur(taxes),
    topLabel: t("imageTop"),
    top: [...state.selected.keys()]
      .sort((a, b) => selectedImpact(b) - selectedImpact(a))
      .slice(0, 3)
      .map((id) => ({ name: nameOf(M[id]), amount: formatEur(selectedImpact(id)) })),
    cta: t("imageCta"),
    source: t("imageSource"),
    url: hosted ? (location.host + location.pathname).replace(/\/(index\.html)?$/, "") : "",
  };
}

let imageFile = null;
let imageUrl = null;

export async function openImageDialog() {
  let blob;
  try {
    blob = await renderShareImage(imageData());
  } catch {
    toast(t("imageFailed"));
    return;
  }
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = URL.createObjectURL(blob);
  imageFile = new File([blob], t("imageFileName"), { type: "image/png" });

  const img = $("#share-image");
  img.src = imageUrl;
  img.alt = t("imageAlt", { total: formatEur(totals().total), year: state.year });
  $("#image-download").href = imageUrl;
  $("#image-download").download = t("imageFileName");
  // Phones can share the file directly (e.g. to WhatsApp); elsewhere it is downloaded
  $("#image-share").hidden = !navigator.canShare?.({ files: [imageFile] });
  $("#image-dialog").showModal();
}

async function shareImageFile() {
  try {
    await navigator.share({ files: [imageFile], text: `${t("shareText", { total: formatEur(totals().total) })} ${shareUrl()}` });
  } catch (e) {
    if (e?.name !== "AbortError") toast(t("toastCopyFailed"));
  }
}

export function bind() {
  const dialog = $("#image-dialog");
  $("#image-close").addEventListener("click", () => dialog.close());
  $("#image-share").addEventListener("click", shareImageFile);
  dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());
  // Share buttons appear in several views
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-share-link]")) shareLink();
    if (e.target.closest("[data-share-image]")) openImageDialog();
  });
}
