import api from '../api/client';

/**
 * Descarga autenticada de archivos: los <a href> navegan SIN el header
 * Authorization, por eso los PDFs se piden con el cliente axios (interceptor
 * de token) y se guardan como blob.
 */
export async function downloadFile(url: string, fallbackFilename: string): Promise<void> {
  const response = await api.get(url, { responseType: 'blob' });
  const blob = new Blob([response.data as BlobPart], {
    type: (response.headers['content-type'] as string) ?? 'application/octet-stream',
  });
  const disposition = (response.headers['content-disposition'] as string) ?? '';
  const match = /filename="?([^";]+)"?/.exec(disposition);
  const filename = match?.[1] ?? fallbackFilename;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
