import fsPromise from 'node:fs/promises';
import fs from 'fs';
import path from 'node:path';
import QRCode from "qrcode";
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import sharp from 'sharp';

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    // slice(start, end) extracts elements from start up to end (not inclusive)
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function readChunks(dirPath) {
  try {
    // get all files in directory
    const files = await fsPromise.readdir(dirPath);

    // keep only chunk-*.png and sort by chunk number
    const chunkFiles = files
      .filter(file => /^chunk-\d+\.png$/.test(file))
      .sort((a, b) => {
        const aNum = Number(a.match(/\d+/)[0]);
        const bNum = Number(b.match(/\d+/)[0]);
        return aNum - bNum;
      });

    // read files in sorted order
    const buffers = await Promise.all(
      chunkFiles.map(file => fsPromise.readFile(path.join(dirPath, file)))
    );

    return buffers;

  } catch (err) {
    console.error('Error reading chunks:', err);
    throw err;
  }
}

async function scanChunks() {
    const buffers = await readChunks('chunks');

    const data = [];
    for (let i = 0; i < buffers.length; i++) {
        const buffer = buffers[i];
        
        const png = PNG.sync.read(buffer);

        const code = jsQR(png.data, png.width, png.height);

        data.push(...code.binaryData);
    }

    sharp(Buffer.from(data)).toFile('result.png');

    // console.log();
}

scanChunks();


// // 1. Read the image file into a raw ArrayBuffer/Buffer
// const buffer = fs.readFileSync('test.png');

// // 2. Parse the PNG file to extract the raw pixel data
// const png = PNG.sync.read(buffer);

// // 3. Pass the raw Uint8Array (png.data) into the QR scanner
// const code = jsQR(png.data, png.width, png.height);
// console.log(code.binaryData);

// QRCode.toFile(
//   'foo.png',
//   [{ data: new Uint8ClampedArray([253,254,255]), mode: 'byte' }]

// async function generateQRChunks() {

// // For binary data (like images), omit the encoding
// fs.readFile('files/test.png', async (err, data) => {
// if (err) throw err;
//     const compressed = await sharp(data).png({quality: 100, compressionLevel: 9}).toBuffer();
//     const view = new Uint8Array(compressed);
//     const chunks = chunkArray(view, 250);
    
//     for (let i = 0; i < chunks.length; i++) {
//         const chunk = chunks[i];
//         QRCode.toFile(`chunks/chunk-${i}.png`, [{ data: new Uint8ClampedArray(chunk), mode: 'byte'}], {errorCorrectionLevel: "Q"});
//     }
// });

// };


// For binary data (like images), omit the encoding
// fs.readFile('test.png', (err, data) => {
//   if (err) throw err;
//     console.log(new Uint8Array(data.buffer));
// });