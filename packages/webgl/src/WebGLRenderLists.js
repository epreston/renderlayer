function painterSortStable(a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  } else if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  } else if (a.material.id !== b.material.id) {
    return a.material.id - b.material.id;
  } else if (a.z !== b.z) {
    return a.z - b.z;
  } else {
    return a.id - b.id;
  }
}

function reversePainterSortStable(a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  } else if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  } else if (a.z !== b.z) {
    return b.z - a.z;
  } else {
    return a.id - b.id;
  }
}

class WebGLRenderList {
  constructor() {
    this._renderItems = [];
    this._renderItemsIndex = 0;
    this.opaque = [];
    this.transmissive = [];
    this.transparent = [];
  }

  init() {
    this._renderItemsIndex = 0;
    this.opaque.length = 0;
    this.transmissive.length = 0;
    this.transparent.length = 0;
  }

  _getNextRenderItem(object, geometry, material, groupOrder, z, group) {
    let renderItem = this._renderItems[this._renderItemsIndex];

    if (renderItem === undefined) {
      renderItem = {
        id: object.id,
        object: object,
        geometry: geometry,
        material: material,
        groupOrder: groupOrder,
        renderOrder: object.renderOrder,
        z: z,
        group: group
      };

      this._renderItems[this._renderItemsIndex] = renderItem;
    } else {
      renderItem.id = object.id;
      renderItem.object = object;
      renderItem.geometry = geometry;
      renderItem.material = material;
      renderItem.groupOrder = groupOrder;
      renderItem.renderOrder = object.renderOrder;
      renderItem.z = z;
      renderItem.group = group;
    }

    this._renderItemsIndex++;

    return renderItem;
  }

  push(object, geometry, material, groupOrder, z, group) {
    const renderItem = this._getNextRenderItem(object, geometry, material, groupOrder, z, group);

    if (material.transmission > 0.0) {
      this.transmissive.push(renderItem);
    } else if (material.transparent === true) {
      this.transparent.push(renderItem);
    } else {
      this.opaque.push(renderItem);
    }
  }

  unshift(object, geometry, material, groupOrder, z, group) {
    const renderItem = this._getNextRenderItem(object, geometry, material, groupOrder, z, group);

    if (material.transmission > 0.0) {
      this.transmissive.unshift(renderItem);
    } else if (material.transparent === true) {
      this.transparent.unshift(renderItem);
    } else {
      this.opaque.unshift(renderItem);
    }
  }

  sort(customOpaqueSort, customTransparentSort) {
    if (this.opaque.length > 1) this.opaque.sort(customOpaqueSort || painterSortStable);
    if (this.transmissive.length > 1)
      this.transmissive.sort(customTransparentSort || reversePainterSortStable);
    if (this.transparent.length > 1)
      this.transparent.sort(customTransparentSort || reversePainterSortStable);
  }

  finish() {
    // Clear references from inactive renderItems in the list

    for (let i = this._renderItemsIndex, il = this._renderItems.length; i < il; i++) {
      const renderItem = this._renderItems[i];

      if (renderItem.id === null) break;

      renderItem.id = null;
      renderItem.object = null;
      renderItem.geometry = null;
      renderItem.material = null;
      renderItem.group = null;
    }
  }
}

class WebGLRenderLists {
  constructor() {
    this.lists = new WeakMap();
  }

  get(scene, renderCallDepth) {
    const listArray = this.lists.get(scene);
    let list;

    if (listArray === undefined) {
      list = new WebGLRenderList();
      this.lists.set(scene, [list]);
    } else {
      if (renderCallDepth >= listArray.length) {
        list = new WebGLRenderList();
        listArray.push(list);
      } else {
        list = listArray[renderCallDepth];
      }
    }

    return list;
  }

  dispose() {
    this.lists = new WeakMap();
  }
}

export { WebGLRenderLists, WebGLRenderList };
