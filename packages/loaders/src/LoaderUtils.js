class LoaderUtils {
  static decodeText(array) {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder().decode(array);
    }

    // Avoid the String.fromCharCode.apply(null, array) shortcut, which
    // throws a "maximum call stack size exceeded" error for large arrays.

    let s = '';

    for (let i = 0, il = array.length; i < il; i++) {
      // Implicitly assumes little-endian.
      s += String.fromCharCode(array[i]);
    }

    try {
      // merges multi-byte utf-8 characters.

      return decodeURIComponent(escape(s));
    } catch (e) {
      // see #16358

      return s;
    }
  }

  static extractUrlBase(url) {
    const index = url.lastIndexOf('/');

    if (index === -1) return './';

    return url.slice(0, index + 1);
  }

  static resolveURL(url, path) {
    // Invalid URL
    if (typeof url !== 'string' || url === '') return '';

    // Host Relative URL
    if (/^https?:\/\//i.test(path) && /^\//.test(url)) {
      path = path.replace(/(^https?:\/\/[^/]+).*/i, '$1');
    }

    // Absolute URL http://,https://,//
    if (/^(https?:)?\/\//i.test(url)) return url;

    // Data URI
    if (/^data:.*,.*$/i.test(url)) return url;

    // Blob URI
    if (/^blob:.*$/i.test(url)) return url;

    // File URI - EP: Patch to avoid returning relative URL
    if (/^file:.*$/i.test(url)) return url;

    // EP: infer paths ?
    if (!path) {
      path = document.baseURI || window.location.href;
    }

    try {
      return new URL(url, path).href;
    } catch (e) {
      // Bad url or baseURI structure. Do not attempt to resolve.
      return '';
    }

    // EP: Does not handle edge case 'file.txt' becomes
    // //example.comfile.txt  (missing slash)

    // Relative URL
    // return path + url;
  }

  static withTrailingSlash(path) {
    if (path[path.length - 1] !== '/') {
      return `${path}/`;
    }
    return path;
  }
}

export { LoaderUtils };
