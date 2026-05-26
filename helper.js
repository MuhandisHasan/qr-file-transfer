const TRANSFER_STATE = Object.freeze({
    NEW: 0,
    CONFIRM: 1,
    RETRY: 2,
});

function equal(a, b, start = 0) {
  if (a.length !== b.length) return false;

  for (let i = start; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    // slice(start, end) extracts elements from start up to end (not inclusive)
    result.push(array.slice(i, i + size));
  }
  return result;
}


function downloadBlob(blob, filename) {
  // 1. Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // 2. Create a temporary anchor element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename; // Sets the suggested filename
  
  // 3. Programmatically click the link to trigger the download
  document.body.appendChild(link); // Required for some browsers like Firefox
  link.click();
  
  // 4. Clean up: remove the link and revoke the URL to free memory
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}