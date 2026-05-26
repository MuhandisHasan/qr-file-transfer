class Scanner {
    constructor() {
        this.video = document.createElement("video");
        this.videoCanvas = document.createElement('canvas');
        this.videoCtx = this.videoCanvas.getContext('2d');

        this.IDEAL_WIDTH = 1280;
        this.IDEAL_HEIGHT = 720;
        this.MAX_WIDTH = 1280;
        this.MAX_HEIGHT = 720;
    }

    start() {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: {max: this.MAX_WIDTH, ideal: this.IDEAL_WIDTH}, height: {max: this.MAX_HEIGHT, ideal: this.IDEAL_HEIGHT} } }).then((stream) => {
            this.video.srcObject = stream;
            this.video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
            this.video.play();

            const track = stream.getVideoTracks()[0];
            const settings = track.getSettings();

            this.videoCanvas.width = settings.width;
            this.videoCanvas.height = settings.height;

            requestAnimationFrame(() => this.tick());
        });
    }

    tick() {
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.videoCtx.drawImage(this.video, 0, 0, this.videoCanvas.width, this.videoCanvas.height);

            const imageData = this.videoCtx.getImageData(0, 0, this.videoCanvas.width, this.videoCanvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                console.log(code);
            }
        }
      requestAnimationFrame(() => this.tick());
    }
}