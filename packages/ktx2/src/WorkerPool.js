/**
 * Callback that creates a Worker.
 * @callback WorkerCreator
 * @returns {Worker} A new Worker instance.
 */

class WorkerPool {
  pool = 4;
  queue = [];
  workers = [];
  workersResolve = [];
  workerStatus = 0;

  /** @type {WorkerCreator} workerCreator  */
  #workerCreator;

  constructor(pool = 4) {
    this.pool = pool;
  }

  dispose() {
    this.workers.forEach((worker) => worker.terminate());
    this.workersResolve.length = 0;
    this.workers.length = 0;
    this.queue.length = 0;
    this.workerStatus = 0;
  }

  /** @param {WorkerCreator} workerCreator  */
  setWorkerCreator(workerCreator) {
    this.#workerCreator = workerCreator;
  }

  setWorkerLimit(pool) {
    this.pool = pool;
  }

  postMessage(msg, transfer) {
    return new Promise((resolve) => {
      const workerId = this.#getIdleWorker();

      if (workerId !== -1) {
        this.#initWorker(workerId);
        this.workerStatus |= 1 << workerId;
        this.workersResolve[workerId] = resolve;
        this.workers[workerId].postMessage(msg, transfer);
      } else {
        this.queue.push({ resolve, msg, transfer });
      }
    });
  }

  #initWorker(workerId) {
    if (!this.workers[workerId]) {
      const worker = this.#workerCreator();
      worker.addEventListener('message', this.#onMessage.bind(this, workerId));
      this.workers[workerId] = worker;
    }
  }

  #getIdleWorker() {
    for (let i = 0; i < this.pool; i++) if (!(this.workerStatus & (1 << i))) return i;

    return -1;
  }

  #onMessage(workerId, msg) {
    const resolve = this.workersResolve[workerId];
    resolve && resolve(msg);

    if (this.queue.length) {
      const { resolve, msg, transfer } = this.queue.shift();
      this.workersResolve[workerId] = resolve;
      this.workers[workerId].postMessage(msg, transfer);
    } else {
      this.workerStatus ^= 1 << workerId;
    }
  }
}

export { WorkerPool };
