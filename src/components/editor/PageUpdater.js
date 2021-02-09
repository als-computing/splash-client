/* eslint-disable no-underscore-dangle */
import Vue from 'vue';

export default class PageUpdater {
  constructor(endpoint, uid, version = undefined) {
    this.uid = uid;
    this.endpoint = endpoint;

    if (!Number.isInteger(version) && version !== undefined) {
      throw new TypeError('4th parameter `version` must be an integer or undefined');
    }
    if (version <= 0) {
      throw new RangeError('4th parameter `version` must be positive');
    }
    this.version = version;
  }

  async init() {
    const resp = await Vue.prototype.$api.get(
      `${this.endpoint}/${this.uid}${this.version !== undefined ? `?version=${this.version}` : ''}`,
    );
    this.data = resp.data;
  }

  async reRequestDocument() {
    throw Error('Not implemented');
  }

  async updateDataProperty(path, property, newValue) {
    // Note that this only changes
    if (this.version !== undefined) {
      throw new Error('Cannot update a specific version of a document.');
    }
    let { data } = this;
    if (typeof path !== 'string') throw new TypeError('1st positional argument must be a string');
    if (typeof property !== 'string') throw new TypeError('2nd positional argument must be a string');
    if (newValue === null || newValue === undefined || typeof newValue === 'function') throw new TypeError('3rd positional argument must be a string, boolean, number, or object');
    if (path.startsWith('splash_md.') || path === 'splash_md' || (path === '' && property === 'splash_md')) {
      throw new Error('Cannot update root level property `splash_md`');
    }

    if (path !== '') {
      path.split('.').forEach((key) => {
        // Check to make sure we don't get an undefined or null property
        if (data[key] === undefined || data[key] === null) {
          throw new TypeError(
            `1st positional argument: ${path}, leads to undefined or null property in data`,
          );
        }
        // Check to make sure we are getting one of the object's real properties
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
          throw new TypeError(
            `1st positional argument: ${path}, leads to an inherited property in the data, it must lead to one of the object's own properties`,
          );
        }
        // Check to make sure that we get an object
        if (typeof data[key] !== 'object') {
          throw new TypeError(
            `1st positional argument: ${path}, must lead to an object, not a primitive`,
          );
        }

        data = data[key];
      });
    }
    // Check to make sure that this second argument is not an inherited property
    if (!Object.prototype.hasOwnProperty.call(data, property) && data[property] !== undefined) {
      throw new TypeError(
        `2nd positional argument: ${property}, leads to an inherited property in the data, it must lead to one of the object's own properties`,
      );
    }
    const oldValue = data[property];
    data[property] = newValue;
    try {
      await this._updateDatabase();
    } catch (error) {
      data[property] = oldValue;
      throw error;
    }
  }


  async _updateDatabase() {
    function removeFromStringify(data) {
      return JSON.stringify(data, (key, value) => {
        if (key === 'splash_md') return undefined;
        if (key === 'uid') return undefined;
        return value;
      });
    }

    await Vue.prototype.$api.put(
      `${this.endpoint}/${this.uid}`,
      this.data,
      {
        transformRequest: [removeFromStringify],
      },
    );
  }
}
