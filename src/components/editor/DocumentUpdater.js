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
    let object = this.data;
    if (typeof path !== 'string') throw new TypeError('1st positional argument must be a string');
    if (typeof property !== 'string') throw new TypeError('2nd positional argument must be a string');
    if (newValue === null || newValue === undefined) throw new TypeError('3rd positional argument cannot be null or undefined');
    if (path !== '') {
      path.split('.').forEach((key) => {
        object = object[key];
        if (object === undefined || object === null) {
          throw TypeError(
            `1st positional argument: ${path}, leads to undefined or null property in data`,
          );
        }
      });
    }
    if (typeof object !== 'object') {
      throw TypeError(
        `1st positional argument: ${path}, must lead to an object, not a primitive`,
      );
    }
    const oldValue = object[property];
    object[property] = newValue;
    try {
      await this._updateDatabase();
    } catch (error) {
      object[property] = oldValue;
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
