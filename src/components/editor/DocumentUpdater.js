/* eslint-disable no-underscore-dangle */
import Vue from 'vue';

export default class DocumentUpdater {
  constructor(endpoint, uid) {
    this.uid = uid;
    this.endpoint = endpoint;
  }

  async init() {
    const resp = await Vue.prototype.$api.get(
      `${this.endpoint}/${this.uid}`,
    );
    this.data = resp.data;
  }

  async updateDataProperty(path, property, newValue) {
    let { data } = this;
    if (typeof path !== 'string') throw new TypeError('1st positional argument must be a string');
    if (typeof property !== 'string') throw new TypeError('2nd positional argument must be a string');
    if (newValue === null || newValue === undefined || typeof newValue === 'function') throw new TypeError('3rd positional argument must be a string, boolean, number, or object');
    if (path !== '') {
      path.split('.').forEach((key) => {
        // Check to make sure we don't get an undefined or null property
        if (data[key] === undefined || data[key] === null) {
          throw TypeError(
            `1st positional argument: ${path}, leads to undefined or null property in data`,
          );
        }
        // Check to make sure we are getting one of the object's real properties
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
          throw TypeError(
            `1st positional argument: ${path}, leads to an inherited property in the data, it must lead to one of the object's own properties`,
          );
        }
        // Check to make sure that we get an object
        if (typeof data[key] !== 'object') {
          throw TypeError(
            `1st positional argument: ${path}, must lead to an object, not a primitive`,
          );
        }

        data = data[key];
      });
    }
    // Check to make sure that this second argument is not an inherited property
    if (!Object.prototype.hasOwnProperty.call(data, property) && data[property] !== undefined) {
      throw TypeError(
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
    function removeUidFromStringify(data) {
      return JSON.stringify(data, (key, value) => {
        if (key === 'uid') return undefined;
        return value;
      });
    }

    await Vue.prototype.$api.put(
      `${this.endpoint}/${this.uid}`,
      this.data,
      {
        transformRequest: [removeUidFromStringify],
      },
    );
  }
}
