const receiveSection = document.querySelector('#receive-section');
const receiveBtn = document.querySelector('.receive-btn');
const canvasElement = document.getElementById('canvas');
const progressBar = document.querySelector('.progress-bar')
const barFill = document.querySelector('.fill')

const BYTE_CHUNK_SIZE = 300;
const PERCENT = 100;

function loadQrUI() {
    receiveSection.classList.add('hidden');
    canvasElement.classList.remove('hidden');
}

receiveBtn.addEventListener('click', async () => {
    loadQrUI();
    startReceiver();
});

async function startReceiver() {
    const scanner = new Scanner();

    let chunks = [];
    let lastChunk;
    let lastIndex;
    let i = 0;
    let state = TRANSFER_STATE.NEW;
    
    let printChunk = (chunks,i,state) => {
        const data = new Uint8ClampedArray(chunks[i].length + 2);
        data[0] = state;
        data[1] = i;
        data.set(chunks[i], 2);

        QRCode.toCanvas(canvasElement, [{ data: data, mode: 'byte' }], { errorCorrectionLevel: 'M'});
    }

    scanner.onCodeDetect = (code) => {

        if(code.binaryData.length > 0) {
            const [codeState, codeIndex, ...codeData] = code.binaryData;

            if (codeState === TRANSFER_STATE.NEW && codeIndex !== lastIndex) {
                if (codeIndex > 0) {
                    chunks.push(lastChunk);
                }

                QRCode.toCanvas(canvasElement, [{ data: code.binaryData, mode: 'byte' }], { errorCorrectionLevel: 'M'});
                chunk = codeData;
                lastIndex = codeIndex;
            } else if (codeState === TRANSFER_STATE.RETRY) {
                QRCode.toCanvas(canvasElement, [{ data: code.binaryData, mode: 'byte' }], { errorCorrectionLevel: 'M'});
                chunk = codeData;
                lastIndex = codeIndex;
            } else if (codeState === TRANSFER_STATE.COMPLETE) {
                chunks.push(lastChunk);
                scanner.stop();
            }

        }

    };

    scanner.onStopScan = () => {
        console.log(chunks);
    }

    scanner.start();
}

