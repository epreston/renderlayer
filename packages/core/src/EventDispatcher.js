class EventDispatcher {
  // https://github.com/mrdoob/eventdispatcher.js/
  #listeners = /* @__PURE__ */ new Map();

  addEventListener(type, listener) {
    const listeners = this.#listeners;

    if (!listeners.has(type)) {
      listeners.set(type, []);
    }

    if (!listeners.get(type).includes(listener)) {
      listeners.get(type).push(listener);
    }
  }

  hasEventListener(type, listener) {
    const listeners = this.#listeners;

    return listeners.has(type) && listeners.get(type).includes(listener);
  }

  removeEventListener(type, listener) {
    const listeners = this.#listeners;
    const listenerArray = listeners.get(type);

    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);

      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }

  dispatchEvent(event) {
    const listeners = this.#listeners;
    const listenerArray = listeners.get(event.type);

    if (listenerArray !== undefined) {
      event.target = this;

      // Make a copy, in case listeners are removed while iterating.
      const array = listenerArray.slice(0);

      for (let i = 0, l = array.length; i < l; i++) {
        array[i].call(this, event);
      }

      event.target = null;
    }
  }
}

export { EventDispatcher };
