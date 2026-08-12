/** Стискає фото в JPEG, щоб вкластися в ліміт Vercel (~4.5 МБ на запит). */

const MAX_EDGE = 1600;
const QUALITY_STEPS = [0.72, 0.62, 0.52, 0.42];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не вдалося прочитати зображення"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Не вдалося стиснути зображення"));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

export async function compressImageFile(
  file: File,
  maxBytes = 900_000,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  // вже маленьке — не чіпаємо
  if (file.size <= maxBytes && file.type === "image/jpeg") return file;

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  let best: Blob | null = null;
  for (const q of QUALITY_STEPS) {
    const blob = await canvasToBlob(canvas, "image/jpeg", q);
    best = blob;
    if (blob.size <= maxBytes) break;
  }

  if (!best) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([best], `${base}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export async function compressPhotosForUpload(
  files: File[],
  totalBudgetBytes = 3_400_000,
): Promise<File[]> {
  if (files.length === 0) return [];
  const perFile = Math.max(
    350_000,
    Math.floor(totalBudgetBytes / files.length),
  );
  const out: File[] = [];
  for (const f of files) {
    out.push(await compressImageFile(f, perFile));
  }
  return out;
}
