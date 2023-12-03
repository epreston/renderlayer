class WebGLAnimation {
  constructor() {
    this._context = null;
    this._isAnimating = false;
    this._animationLoop = null;
    this._requestId = null;
  }

  _onAnimationFrame(time, frame) {
    this._animationLoop(time, frame);
    this._requestId = this._context.requestAnimationFrame(this._onAnimationFrame.bind(this));
  }

  start() {
    if (this._isAnimating === true) return;
    if (this._animationLoop === null) return;

    this._requestId = this._context.requestAnimationFrame(this._onAnimationFrame.bind(this));
    this._isAnimating = true;
  }

  stop() {
    this._context.cancelAnimationFrame(this._requestId);
    this._isAnimating = false;
  }

  setAnimationLoop(callback) {
    this._animationLoop = callback;
  }

  setContext(value) {
    this._context = value;
  }
}

export { WebGLAnimation };
