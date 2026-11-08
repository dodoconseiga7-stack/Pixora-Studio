/**
 * Réduit une image dans le navigateur avant l'envoi (WebP, côté le plus long limité) :
 * envoi rapide même en 3G, et stockage léger. La transparence des logos est conservée.
 */
export async function reduireImage(f: File, cote = 1600, qualite = 0.88): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(f.type)) throw new Error('Format non accepté : utilisez une image JPG, PNG ou WebP.');
  const bitmap = await createImageBitmap(f);
  const r = Math.min(1, cote / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * r), h = Math.round(bitmap.height * r);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/webp', qualite));
  if (!blob) return f;
  // Certains navigateurs (anciens Safari) ne savent pas produire du WebP et renvoient du PNG : on garde le vrai type.
  const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/jpeg' ? 'jpg' : 'png';
  return new File([blob], `${f.name.replace(/\.\w+$/, '')}.${ext}`, { type: blob.type || 'image/png' });
}
