export const base64ToBlob = (
  base64Data: string,
  contentType = "application/octet-stream",
): Blob => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length)
    .fill(0)
    .map((_, index) => byteCharacters.charCodeAt(index));

  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: contentType });
};

export const downloadBlobAsFile = (blob: Blob, fileName: string) => {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadBase64File = (
  base64Data: string,
  fileName: string,
  contentType = "application/octet-stream",
) => {
  const blob = base64ToBlob(base64Data, contentType);
  downloadBlobAsFile(blob, fileName);
};
