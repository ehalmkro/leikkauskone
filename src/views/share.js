// Sharing the result as an image: preview dialog, native share sheet on phones, download elsewhere.

import { state } from "../state.js";
import { M, flow, flowYear, totals, selectedImpact } from "../model.js";
import { t, loc, nameOf, formatAmount } from "../text.js";
import { $, toast } from "../ui.js";
import { renderShareImage } from "../share-image.js";

// The page address without protocol, or "" when the page is not hosted anywhere (opened locally)
function pageAddress() {
  const hosted = /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  return hosted ? (location.host + location.pathname).replace(/\/(index\.html)?$/, "") : "";
}

function imageData() {
  const { total, byType, byCategory } = totals();
  const { meter, milestones, categories, types } = flow();
  const { scaleMax, target, markers } = meter;
  const reached = milestones.filter((ms) => total >= ms.value);
  const next = milestones.find((ms) => total < ms.value);
  let status;
  if (!next) status = t("imageAllReached");
  else if (reached.length) status = t("imageReached", { name: loc(reached[reached.length - 1].name) });
  else status = t("imageMissing", { target: formatAmount(next.value), missing: formatAmount(next.value - total) });

  return {
    appName: t("appName"),
    theme: state.flow,
    year: flowYear(),
    headline: t("imageHeadline"),
    total: formatAmount(total),
    totalValue: total,
    status,
    statusReached: reached.length > 0,
    scaleMax,
    segments: categories.map((c, i) => ({ value: byCategory[c.id], colorIndex: i })),
    target: { from: target.from, to: target.to, label: loc(target.label), reached: total >= target.from },
    markers: markers.map((m) => ({ value: m.value, label: loc(m.label), reached: total >= m.value })),
    cutsLabel: t("imageCuts"),
    cuts: formatAmount(byType[types[0]]),
    taxesLabel: t("imageTaxes"),
    taxes: formatAmount(byType[types[1]]),
    topLabel: t("imageTop"),
    top: [...state.selected.keys()]
      .sort((a, b) => selectedImpact(b) - selectedImpact(a))
      .slice(0, 3)
      .map((id) => ({ name: nameOf(M[id]), amount: formatAmount(selectedImpact(id)) })),
    cta: t("imageCta"),
    source: t("imageSource"),
    url: pageAddress(),
  };
}

let imageFile = null;
let imageUrl = null;
let shareText = "";

async function openImageDialog() {
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
  const address = pageAddress();
  shareText = t("imageShareText", { total: formatAmount(totals().total) }) + (address ? ` https://${address}` : "");

  const img = $("#share-image");
  img.src = imageUrl;
  img.alt = t("imageAlt", { total: formatAmount(totals().total), year: flowYear() });
  $("#image-download").href = imageUrl;
  $("#image-download").download = t("imageFileName");
  $("#image-share").hidden = !navigator.canShare?.({ files: [imageFile] });
  $("#image-dialog").showModal();
}

// The image is shared with a short text and the link; where the browser cannot share both, the image alone.
async function shareImageFile() {
  const data = { files: [imageFile], text: shareText };
  if (!navigator.canShare(data)) delete data.text;
  try {
    await navigator.share(data);
  } catch (e) {
    if (e?.name === "AbortError") return;
    $("#image-download").click();
    toast(t("imageShareFailed"));
  }
}

export function bind() {
  const dialog = $("#image-dialog");
  $("#image-close").addEventListener("click", () => dialog.close());
  $("#image-share").addEventListener("click", shareImageFile);
  dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());
  // The share button appears on the result page and in the measures view
  document.addEventListener("click", (e) => e.target.closest("[data-share-image]") && openImageDialog());
}
