import { describe, expect, it, test, vi } from 'vitest';

import { WorkerPool } from '../src/WorkerPool.js';

describe('KTX2', () => {
  describe('WorkerPool', () => {
    test('constructor', () => {
      const object = new WorkerPool();
      expect(object).toBeDefined();
    });

    test('pool', () => {
      const object = new WorkerPool();
      expect(object.pool).toBe(4);
    });

    test('queue', () => {
      const object = new WorkerPool();
      expect(object.queue).toBeDefined();
    });

    test('workers', () => {
      const object = new WorkerPool();
      expect(object.workers).toBeDefined();
    });

    test('workersResolve', () => {
      const object = new WorkerPool();
      expect(object.workersResolve).toBeDefined();
    });

    test('workerStatus', () => {
      const object = new WorkerPool();
      expect(object.workerStatus).toBe(0);
    });

    test('dispose', () => {
      const object = new WorkerPool();
      object.dispose();

      expect(object).toBeDefined();
    });

    test.todo('setWorkerCreator', () => {
      //const object = new WorkerPool();
      // object.setWorkerCreator();
    });

    test('setWorkerLimit', () => {
      const object = new WorkerPool();

      expect(object.pool).toBe(4);

      object.setWorkerLimit(1);

      expect(object.pool).toBe(1);
    });

    test.todo('postMessage', () => {
      //const object = new WorkerPool();
      // object.postMessage();
    });
  });
});
