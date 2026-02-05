class Clock {
  autoStart;

  startTime = 0;
  oldTime = 0;
  elapsedTime = 0;

  running = false;

  constructor(autoStart = true) {
    this.autoStart = autoStart;
  }

  start() {
    this.startTime = _now();

    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;
  }

  stop() {
    this.getElapsedTime();
    this.running = false;
    this.autoStart = false;
  }

  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }

  getDelta() {
    let diff = 0;

    if (this.autoStart && !this.running) {
      this.start();
      return 0;
    }

    if (this.running) {
      const newTime = _now();

      diff = (newTime - this.oldTime) / 1000;
      this.oldTime = newTime;

      this.elapsedTime += diff;
    }

    return diff;
  }
}

function _now() {
  return (typeof performance === 'undefined' ? Date : performance).now();
}

export { Clock };
