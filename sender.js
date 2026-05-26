const fileInput = document.getElementById('file-input');
const sendBtn = document.querySelector('.send-btn');
const uploadSection = document.getElementById('upload-section');
const canvasElement = document.getElementById('canvas');
const progressBar = document.querySelector('.progress-bar')
const barFill = document.querySelector('.fill')
const videoElement = document.querySelector('video');

const BYTE_CHUNK_SIZE = 300;
const PERCENT = 100;

function loadQrUI() {
    sendBtn.classList.remove('loading');
    uploadSection.classList.add('hidden');
    canvasElement.classList.remove('hidden');
    progressBar.classList.remove('hidden');
}

// QRCode.toCanvas(canvasElement, 'heyhey', {width: 1000});

// 1. Enable the 'Send' button only when a file is chosen
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        sendBtn.disabled = false;
    } else {
        sendBtn.disabled = true;
    }
});

async function compressLoop(img, options) {
    let lastSize = img.size;
    while(true) {
        const compressedFile = await imageCompression(img, options);
        
        const compressionPercentage = ((lastSize - compressedFile.size) * 100) / lastSize;
        console.log(compressionPercentage);

        if(lastSize === compressedFile.size || compressionPercentage < 0) {
            return img;
            break;
        }

        img = compressedFile;
        lastSize = compressedFile.size;
    }
}

// const codes = setInterval(()=>{
//                 QRCode.toCanvas(canvasElement, [{ data: new Uint8ClampedArray(chunks[i]), mode: 'byte' }], { errorCorrectionLevel: 'M'});
//                 i++;
                
//                 const progress = (i / chunks.length) * PERCENT;
//                 barFill.style.width = `${progress}%`;

//                 if(i === chunks.length) { clearInterval(codes) };
//             }, 50);

sendBtn.addEventListener('click', async () => {
    
    sendBtn.classList.add('loading');

    const file = fileInput.files[0];
    const compressedFile = await imageCompression(file);

    const compressionPercentage = ((file.size - compressedFile.size) * 100) / file.size;

    if (compressionPercentage > 0) {
        console.log('Success');
    }else{
        console.log('not compressed');
    }

    // if (compressedFile) {
    //     const reader = new FileReader();
    //     reader.onload = () => {
    //         const result = new Uint8ClampedArray(reader.result);
    //         const chunks = chunkArray(result, BYTE_CHUNK_SIZE);
            
    //         loadQrUI();
            
    //         // startTransfer(chunks);
    //     };

    //     reader.readAsArrayBuffer(compressedFile);
    // }
});

// async function startTransfer(chunks) {
//     const qrScanner = new QrScanner(
//     videoElement,
//     result => console.log('decoded qr code:', result),
//     { returnDetailedScanResult: true },
// );
//     qrScanner.start();

// }


