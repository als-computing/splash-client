import PageUpdater from '@/components/editor/PageUpdater';
import Vue from 'vue';
import responses from '../../../responses/pages-responses';


jest.mock('vue');
Vue.prototype.$api = {
  get: jest.fn(),
  put: jest.fn(),
};

const mockUid = 'the_one_ring';
const mockEndpoint = 'compounds';
const mockResponse = responses.boron;

describe('PageUpdater class construction', () => {
  it('validates its arguments on construction properly', () => {
    function testConstructorErrors(errType, errMessage, version) {
      const construct = () => new PageUpdater(mockEndpoint, mockUid, version);
      expect(construct).toThrowError(errType);
      expect(construct).toThrowError(errMessage);
    }
    testConstructorErrors(TypeError, /^4th parameter `version` must be an integer or undefined$/, '2');
    testConstructorErrors(TypeError, /^4th parameter `version` must be an integer or undefined$/, 5.54);
    testConstructorErrors(RangeError, /^4th parameter `version` must be positive$/, 0);
    testConstructorErrors(RangeError, /^4th parameter `version` must be positive$/, -1);
  });
});

describe('PageUpdater no version argument', () => {

  beforeEach(() => {
    Vue.prototype.$api.get.mockClear();
    Vue.prototype.$api.put.mockClear();
  });
  const testUpdater = new PageUpdater(mockEndpoint, mockUid);


  it('initializes by sending the correct axios request', async () => {
    // I do JSON.parse(JSON.stringify(mockData)) to deep clone so that any edits
    // made by this class won'r transfer to the original imported object
    Vue.prototype.$api.get.mockResolvedValue(JSON.parse(JSON.stringify(mockResponse)));
    await testUpdater.init();
    expect(Vue.prototype.$api.get).toBeCalledWith(`${mockEndpoint}/${mockUid}`);
    expect(Vue.prototype.$api.get).toBeCalledTimes(1);
    expect(testUpdater.data).toEqual(mockResponse.data);
  });

  it('handles erroneous arguments to updateDataProperty method correctly', async () => {
    async function testFunctionErrors(errType, errMessage, arg1, arg2, arg3) {
      const update = async () => {
        await testUpdater.updateDataProperty(arg1, arg2, arg3);
      };

      await expect(update()).rejects.toThrowError(errType);
      await expect(update()).rejects.toThrowError(errMessage);
      expect(testUpdater.data).toEqual(mockResponse.data);
    }
    await testFunctionErrors(TypeError, /^1st positional argument must be a string$/, 5, 'bar', {});
    await testFunctionErrors(TypeError, /^2nd positional argument must be a string$/, 'bar', 5, {});
    await testFunctionErrors(TypeError, /^3rd positional argument must be a string, boolean, number, or object$/, 'bar', 'foo');
    await testFunctionErrors(TypeError, /^1st positional argument: title\.bar, must lead to an object, not a primitive$/, 'title.bar', 'foo', {});
    await testFunctionErrors(TypeError, /^1st positional argument: title, must lead to an object, not a primitive$/, 'title', 'foo', {});
    await testFunctionErrors(TypeError, /^1st positional argument: metadata\.tree, leads to undefined or null property in data$/, 'metadata.tree', 'foo', {});
    await testFunctionErrors(TypeError, /^1st positional argument: metadata\.__proto__, leads to an inherited property in the data, it must lead to one of the object's own properties$/, 'metadata.__proto__', 'foo', {});
    await testFunctionErrors(TypeError, /^2nd positional argument: hasOwnProperty, leads to an inherited property in the data, it must lead to one of the object's own properties$/, 'metadata', 'hasOwnProperty', {});
    await testFunctionErrors(Error, /^Cannot update root level property `splash_md`$/, 'splash_md.h.l', 'bar', {});
    await testFunctionErrors(Error, /^Cannot update root level property `splash_md`$/, 'splash_md', 'bar', {});
    await testFunctionErrors(Error, /^Cannot update root level property `splash_md`$/, '', 'splash_md', {});

    expect(Vue.prototype.$api.put).toHaveBeenCalledTimes(0);
  });

  it('restores the original data object when an axios error is thrown and re-throws axios error', async () => {
    Vue.prototype.$api.put.mockImplementation(async () => {
      throw new Error('Test Error');
    });
    const update = async () => testUpdater.updateDataProperty('', 'metadata', []);
    await expect(update()).rejects.toThrowError(/^Test Error$/);

    expect(testUpdater.data).toEqual(mockResponse.data);
  });

  it('passes the correct args to axios, axios transforms the request correctly, and it updates data prop accordingly', async () => {
    Vue.prototype.$api.put.mockReset();

    await testUpdater.updateDataProperty('', 'metadata', [{ title: 'test', text: 'test' }]);
    // Deep copy
    const expectedData = JSON.parse(JSON.stringify(mockResponse.data));
    expectedData.metadata = [{ title: 'test', text: 'test' }];

    // Check to make sure the correct arguments are passed to axios
    expect(Vue.prototype.$api.put.mock.calls[0][0]).toEqual(`${mockEndpoint}/${mockUid}`);
    expect(Vue.prototype.$api.put.mock.calls[0][1]).toEqual(expectedData);

    // Ensure that the function in axios's transform request array argument removes the appropriate keys
    // from the document
    const removeVersionAndUid = Vue.prototype.$api.put.mock.calls[0][2].transformRequest[0];
    const cleanDoc = JSON.parse(removeVersionAndUid(expectedData));
    const { uid, splash_md } = expectedData;
    delete expectedData.uid;
    delete expectedData.splash_md;
    expect(cleanDoc).toEqual(expectedData);

    // Restore expectedData and compare with the updated data prop
    expectedData.uid = uid;
    expectedData.splash_md = splash_md;
    expect(testUpdater.data).toEqual(expectedData);
  });
});

describe('Page Updater with the version argument', () => {
  Vue.prototype.$api.get.mockClear();
  const testUpdater = new PageUpdater(mockEndpoint, mockUid, 4);

  it('initializes by sending the correct axios request', async () => {
    // I do JSON.parse(JSON.stringify(mockData)) to deep clone so that any edits
    // made by this class won'r transfer to the original imported object
    Vue.prototype.$api.get.mockResolvedValue(JSON.parse(JSON.stringify(mockResponse)));
    await testUpdater.init();
    expect(Vue.prototype.$api.get).toBeCalledWith(`${mockEndpoint}/${mockUid}?version=4`);
    expect(Vue.prototype.$api.get).toBeCalledTimes(1);
    expect(testUpdater.data).toEqual(mockResponse.data);
  });

  it('Throws an error when we attempt to update the document', () => {
    const update = async () => testUpdater.updateDataProperty('', 'metadata', []);
    expect(update()).rejects.toThrowError(/^Cannot update a specific version of a document.$/);
  });
});

// To be used for a later test
// Vue.prototype.$api.get.mockResolvedValue(JSON.parse(JSON.stringify(responses.boron2.data)));
// expect(Vue.prototype.$api.get).toBeCalledTimes(1);
// expect(Vue.prototype.$api.get).toBeCalledWith(`${mockEndpoint}/${mockUid}`);
// expect(testUpdater.data).toEqual(responses.boron2.data);
