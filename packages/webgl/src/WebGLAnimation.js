class WebGLAnimation {
  constructor() {
    this.context = null;
    this.isAnimating = false;
    this.animationLoop = null;
    this.requestId = null;
  }

  onAnimationFrame(time, frame) {
    this.animationLoop(time, frame);
    this.requestId = this.context.requestAnimationFrame(this.onAnimationFrame.bind(this));
  }

  start() {
    if (this.isAnimating === true) return;
    if (this.animationLoop === null) return;

    this.requestId = this.context.requestAnimationFrame(this.onAnimationFrame.bind(this));
    this.isAnimating = true;
  }

  stop() {
    this.context.cancelAnimationFrame(this.requestId);
    this.isAnimating = false;
  }

  setAnimationLoop(callback) {
    this.animationLoop = callback;
  }

  setContext(value) {
    this.context = value;
  }
}

export { WebGLAnimation };
