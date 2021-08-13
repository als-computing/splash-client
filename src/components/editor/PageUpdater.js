/* eslint-disable no-underscore-dangle */
import Vue from 'vue';

function removeFromStringify(data) {
  return JSON.stringify(data, (key, value) => {
    if (key === 'splash_md') return undefined;
    if (key === 'uid') return undefined;
    return value;
  });
}

const ARCHIVE_REQ_BODY = { archive_action: 'archive' };

const RESTORE_REQ_BODY = { archive_action: 'restore' };
export default class PageUpdater {
  constructor(endpoint, uid, version = undefined) {
    if (!Number.isInteger(version) && version !== undefined) {
      throw new TypeError('4th parameter `version` must be an integer or undefined');
    }
    if (version <= 0) {
      throw new RangeError('4th parameter `version` must be positive');
    }
    this.version = version;
    this.uid = uid;
    this.endpoint = endpoint;
    this._data = {};
  }

  async init() {
    const resp = await Vue.prototype.$api.get(
      `${this.endpoint}/${this.uid}${this.version !== undefined ? `?version=${this.version}` : ''}`,
    );
    this._data = resp.data;
  }

  get data() {
    return this._data;
  }

  async reRequestDocument() {
    throw Error('Not implemented');
  }

  async updateDataProperty(path, property, newValue, etag) {
    // The argument path should be a `string`, the argument `property` should also be a string, and
    // newValue should be what we want the new value of the specified property to be.
    // For example say I had a document like thus: {'data':{ 'sample': {'list':[]}}}
    // In order to update list I would call `updateDataProperty('data.sample', 'list', [1,2,3])`
    // If I wanted to update data, I would call: `updateDataProperty('','data', {})`
    if (this.version !== undefined) {
      throw new Error('Cannot update a specific version of a document.');
    }
    let { _data } = this;
    if (typeof path !== 'string') throw new TypeError('1st positional argument must be a string');
    if (typeof property !== 'string') throw new TypeError('2nd positional argument must be a string');
    if (newValue === null || newValue === undefined || typeof newValue === 'function') throw new TypeError('3rd positional argument must be a string, boolean, number, or object');
    if (path.startsWith('splash_md.') || path === 'splash_md' || (path === '' && property === 'splash_md')) {
      throw new Error('Cannot update root level property `splash_md`');
    }

    if (path !== '') {
      path.split('.').forEach((key) => {
        // Check to make sure we don't get an undefined or null property
        if (_data[key] === undefined || _data[key] === null) {
          throw new TypeError(
            `1st positional argument: ${path}, leads to undefined or null property in data`,
          );
        }
        // Check to make sure we are getting one of the object's real properties
        if (!Object.prototype.hasOwnProperty.call(_data, key)) {
          throw new TypeError(
            `1st positional argument: ${path}, leads to an inherited property in the data, it must lead to one of the object's own properties`,
          );
        }
        // Check to make sure that we get an object
        if (typeof _data[key] !== 'object') {
          throw new TypeError(
            `1st positional argument: ${path}, must lead to an object, not a primitive`,
          );
        }

        _data = _data[key];
      });
    }
    // Check to make sure that this second argument is not an inherited property
    if (!Object.prototype.hasOwnProperty.call(_data, property) && _data[property] !== undefined) {
      throw new TypeError(
        `2nd positional argument: ${property}, leads to an inherited property in the data, it must lead to one of the object's own properties`,
      );
    }
    const oldValue = _data[property];
    _data[property] = newValue;
    try {
      const response = await this._updateDatabase(etag);
      this._data.splash_md = response.data.splash_md;
    } catch (error) {
      _data[property] = oldValue;
      throw error;
    }
  }

  async archiveAction(action, etag) {
    if (action !== 'archive' && action !== 'restore') throw new Error("1st positional argument must match the string 'archive' or 'restore'");
    let etagVal = etag;
    if (etag === undefined) etagVal = this._data.splash_md.etag;
    const headers = { 'If-Match': etagVal };

    const response = await Vue.prototype.$api.patch(
      `${this.endpoint}/${this.uid}`,
      action === 'archive' ? ARCHIVE_REQ_BODY : RESTORE_REQ_BODY,
      {
        headers,
      },
    );

    this._data.splash_md = response.data.splash_md;
  }

  async _updateDatabase(etag) {
    let etagVal = etag;
    if (etag === undefined) etagVal = this._data.splash_md.etag;
    const headers = { 'If-Match': etagVal };

    return Vue.prototype.$api.put(
      `${this.endpoint}/${this.uid}`,
      this._data,
      {
        transformRequest: [removeFromStringify],
        headers,
      },
    );
  }
}
