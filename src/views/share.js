// Sharing the result as an image: preview dialog, native share sheet on phones, download elsewhere.

import { state } from "../state.js";
import { M, flow, flowYear, totals, selectedImpact } from "../model.js";
import { t, loc, nameOf, formatAmount } from "../text.js";
import { $, toast } from "../ui.js";
import { renderShareImage } from "../share-image.js";

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
  // The address is printed on the image only when the page is hosted somewhere
  const hosted = /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

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
    url: hosted ? (location.host + location.pathname).replace(/\/(index\.html)?$/, "") : "",
  };
}

let imageFile = null;
let imageUrl = null;

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

  const img = $("#share-image");
  img.src = imageUrl;
  img.alt = t("imageAlt", { total: formatAmount(totals().total), year: flowYear() });
  $("#image-download").href = imageUrl;
  $("#image-download").download = t("imageFileName");
  $("#image-share").hidden = !navigator.canShare?.({ files: [imageFile] });
  $("#image-dialog").showModal();
}

// Only the file is shared: several apps (WhatsApp on iOS in particular) fail when a file comes with text.
async function shareImageFile() {
  try {
    await navigator.share({ files: [imageFile] });
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
