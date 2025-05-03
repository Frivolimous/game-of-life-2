class JMTicker {
    running = false;
    tickDelay = 30;
    lastTime = 0;
    tickInc = 0;
    framerate = 0;
    lastTickTime = 0;

    onTick;

    constructor(framerate) {
        this.tickDelay = 1000 / framerate;
    }

    start() {
        this.running = true;
        requestAnimationFrame(this.onFrame);
    }

    updateFramerate(framerate) {
        this.tickDelay = 1000 / framerate;
    }

    onFrame = (time) => {
        if (!this.running) return;
        var deltaTime = time - this.lastTime;
        this.lastTime = time;
        if (deltaTime > this.tickDelay * 5) deltaTime = 0;
        this.tickInc += deltaTime;

        if (this.tickInc > this.tickDelay) {
            this.tickInc -= this.tickDelay;
            if (this.onTick) this.onTick();
            this.framerate = 1000 / (time - this.lastTickTime);
            this.lastTickTime = time;
        }

        requestAnimationFrame(this.onFrame);
    }

    togglePause = () => {
        this.running = !this.running;

        if (this.running) {
            requestAnimationFrame(this.onFrame);
        }
    }
}