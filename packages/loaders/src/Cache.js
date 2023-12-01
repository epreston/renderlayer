const Cache = {
  enabled: false,

  files: {}, // EP: use map

  add(key, file) {
    if (this.enabled === false) return;

    // console.log( 'Cache', 'Adding key:', key );

    this.files[key] = file;
  },

  get(key) {
    if (this.enabled === false) return;

    // console.log( 'Cache', 'Checking key:', key );

    return this.files[key];
  },

  remove(key) {
    delete this.files[key];
  },

  clear() {
    this.files = {};
  }
};

export { Cache };
