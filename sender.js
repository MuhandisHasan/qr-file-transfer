const fileInput = document.getElementById('file-input');
const sendBtn = document.querySelector('.send-btn');
const uploadSection = document.getElementById('upload-section');
const canvasElement = document.getElementById('canvas');
const progressBar = document.querySelector('.progress-bar')
const barFill = document.querySelector('.fill')
const commandTitle = document.querySelector('.command-title')

const BYTE_CHUNK_SIZE = 300;
const PERCENT = 100;

let allowCompression = true;

function loadQrUI() {
    sendBtn.classList.remove('loading');
    uploadSection.classList.add('hidden');
    canvasElement.classList.remove('hidden');
    progressBar.classList.remove('hidden');
    commandTitle.classList.remove('hidden');
}

function updateProgress(percentage) {
    barFill.style.width = `${percentage}%`;
}

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        sendBtn.disabled = false;
    } else {
        sendBtn.disabled = true;
    }
});

sendBtn.addEventListener('click', async () => {
    sendBtn.classList.add('loading');

    let file = fileInput.files[0];
    
    if(allowCompression) {
        const compressedFile = await imageCompression(file);

        const compressionPercentage = ((file.size - compressedFile.size) * 100) / file.size;

        if (compressionPercentage > 0) {
            file = compressedFile;
        }
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const result = new Uint8ClampedArray(reader.result);
            const chunks = chunkArray(result, BYTE_CHUNK_SIZE);
            
            loadQrUI();
            
            startTransfer(chunks);
        };

        reader.readAsArrayBuffer(file);
    }
});

async function startTransfer(chunks) {
    const scanner = new Scanner();

    let i = 0;
    let state = TRANSFER_STATE.NEW;
    
    let printChunk = (chunks,i,state) => {
        const data = new Uint8ClampedArray(chunks[i].length + 2);
        data[0] = state;
        data[1] = i;
        data.set(chunks[i], 2);

        QRCode.toCanvas(canvasElement, [{ data: data, mode: 'byte' }], { errorCorrectionLevel: 'M'});
    }

    scanner.onStartScan = () => {
        printChunk(chunks, 0, state);
        updateProgress(0);
    }
    
    scanner.onTick = () => {
        commandTitle.textContent = "Slowly adjust the device's position!";
    }

    scanner.onCodeDetect = (code) => {
        commandTitle.textContent = "Hold it there!";

        if (code.binaryData.length > 0) {
            const [codeState, codeIndex, ...codeData] = code.binaryData;

            if (codeIndex === i && equal(codeData, chunks[i])) {
                state = TRANSFER_STATE.NEW;
                i++;

                if (i === chunks.length) {
                    state = TRANSFER_STATE.COMPLETE;
                }

                const progress = (i / chunks.length) * PERCENT;
                updateProgress(progress);
            } else {
                state = TRANSFER_STATE.RETRY;
            };

            printChunk(chunks, i, state);
        }
    };

    scanner.start();
}

