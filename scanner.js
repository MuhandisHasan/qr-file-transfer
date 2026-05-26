class Scanner {
    /**
     * @type HTMLVideoElement
    */
    video;

    /**
     * @type HTMLCanvasElement
    */
    videoCanvas;

    /**
     * @type Number
    */
    IDEAL_WIDTH;

    /**
     * @type Number
    */
    IDEAL_HEIGHT;

    /**
     * @type Number
    */
    MAX_WIDTH;

    /**
     * @type Number
    */
    MAX_HEIGHT;

    /**
     * @type Function
     * @params {Object}
    */
    onStartScan;
    
    /**
     * @type Function
     * @params {Object}
    */
    onStopScan;

    /**
     * @type Function
     * @params {Object}
    */
    onCodeDetect;

    /**
     * @type CanvasRenderingContext2D
     */
    #videoCtx;

    /**
     * @type Boolean
     */
    #scanning;

    /**
     * @type MediaStream
     */
    #stream;

    constructor() {
        this.video = document.createElement("video");
        this.videoCanvas = document.createElement('canvas');
        this.#videoCtx = this.videoCanvas.getContext('2d');

        this.IDEAL_WIDTH = 1280;
        this.IDEAL_HEIGHT = 720;
        this.MAX_WIDTH = 1280;
        this.MAX_HEIGHT = 720;
    }

    start() {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: {max: this.MAX_WIDTH, ideal: this.IDEAL_WIDTH}, height: {max: this.MAX_HEIGHT, ideal: this.IDEAL_HEIGHT} } }).then((stream) => {
            this.#stream = stream;
            this.video.srcObject = this.#stream;
            this.video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
            this.video.play();

            const track = this.#stream.getVideoTracks()[0];
            const settings = track.getSettings();

            this.videoCanvas.width = settings.width;
            this.videoCanvas.height = settings.height;

            if (typeof this.onStartScan === 'function') {
                this.onStartScan();
            }

            this.#scanning = true; 
            requestAnimationFrame(() => this.tick());
        });
    }

    stop() {
        this.#scanning = false;

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.video) {
            this.video.pause();
            this.video.srcObject = null;
        }

        if (typeof this.onStopScan === 'function') {
            this.onStopScan();
        }
    }

    tick() {
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.#videoCtx.drawImage(this.video, 0, 0, this.videoCanvas.width, this.videoCanvas.height);

            const imageData = this.#videoCtx.getImageData(0, 0, this.videoCanvas.width, this.videoCanvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                if (typeof this.onCodeDetect === 'function') {
                    this.onCodeDetect(code);
                }
            }
        }

      requestAnimationFrame(() => this.tick());
    }
}