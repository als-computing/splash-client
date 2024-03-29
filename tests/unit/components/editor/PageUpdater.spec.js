import PageUpdater from '@/components/editor/PageUpdater';
import Vue from 'vue';
import responses from '../../../responses/pages-responses';

jest.mock('vue');
Vue.prototype.$api = {
  get: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
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
    await testFunctionErrors(TypeError, /^1st positional argument: references\.undefined_prop, leads to undefined or null property in data$/, 'references.undefined_prop', 'foo', {});
    await testFunctionErrors(TypeError, /^1st positional argument: references\.__proto__, leads to an inherited property in the data, it must lead to one of the object's own properties$/, 'references.__proto__', 'foo', {});
    await testFunctionErrors(TypeError, /^2nd positional argument: hasOwnProperty, leads to an inherited property in the data, it must lead to one of the object's own properties$/, 'references', 'hasOwnProperty', {});
    await testFunctionErrors(Error, /^Cannot update root level property `splash_md`$/, 'splash_md.h.l', 'bar', {});
    await testFunctionErrors(Error, /^Cannot update root level property `splash_md`$/, 'splash_md', 'bar', {});
    await testFunctionErrors(Error, /^Cannot update root level property `splash_md`$/, '', 'splash_md', {});

    expect(Vue.prototype.$api.put).toHaveBeenCalledTimes(0);
  });

  it('restores the original data object when an axios error is thrown and re-throws axios error', async () => {
    Vue.prototype.$api.put.mockImplementation(async () => {
      throw new Error('Test Error');
    });
    const update = async () => testUpdater.updateDataProperty('', 'references', []);
    await expect(update()).rejects.toThrowError(/^Test Error$/);

    expect(testUpdater.data).toEqual(mockResponse.data);
  });

  it('passes the correct args to axios, axios transforms the request correctly, and it updates data prop accordingly', async () => {
    const mockPutResponse = { data: { uid: 'testing_uid', splash_md: { date: 'TEST DATE' } } };
    Vue.prototype.$api.put.mockResolvedValue(mockPutResponse);

    const { etag } = testUpdater.data.splash_md;
    // Deep copy
    const apiArg = JSON.parse(JSON.stringify(testUpdater.data));
    apiArg.references = [{ doi: 'test', in_test: false }];
    await testUpdater.updateDataProperty('', 'references', [{ doi: 'test', in_test: false }]);

    // Check to make sure the correct arguments are passed to axios
    expect(Vue.prototype.$api.put.mock.calls[0][0]).toEqual(`${mockEndpoint}/${mockUid}`);
    // Check to make sure that the data property was passed to the api
    expect(Vue.prototype.$api.put.mock.calls[0][1]).toBe(testUpdater.data);
    // Check to make sure that the etag is included in the headers
    expect(Vue.prototype.$api.put.mock.calls[0][2].headers).toEqual({ 'If-Match': etag });

    // Ensure that the function in axios's transform request array argument removes the appropriate keys
    // from the document
    const removeVersionAndUid = Vue.prototype.$api.put.mock.calls[0][2].transformRequest[0];
    const cleanDoc = JSON.parse(removeVersionAndUid(apiArg));
    const { uid } = apiArg;
    delete apiArg.uid;
    delete apiArg.splash_md;
    expect(cleanDoc).toEqual(apiArg);

    // Test to make sure that the final data prop matches what we expect
    const expectedData = apiArg;
    expectedData.splash_md = mockPutResponse.data.splash_md;
    expectedData.uid = uid;
    expect(testUpdater.data).toEqual(expectedData);
  });
  it('makes a request with the correct etag when it is passed as an argument', async () => {
    const mockPutResponse = { data: { uid: 'testing_uid', splash_md: { date: 'TEST DATE' } } };
    Vue.prototype.$api.put.mockResolvedValue(mockPutResponse);

    const CUSTOM_ETAG = "I'M THE NEW ETAG";
    await testUpdater.updateDataProperty('', 'references', [{ doi: 'test', in_test: false }], CUSTOM_ETAG);

    // Check to make sure that the etag is included in the headers
    expect(Vue.prototype.$api.put.mock.calls[0][2].headers).toEqual({ 'If-Match': CUSTOM_ETAG });
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
    const update = async () => testUpdater.updateDataProperty('', 'references', []);
    expect(update()).rejects.toThrowError(/^Cannot update a specific version of a document.$/);
  });
});

describe('PageUpdater protects its properties', () => {
  Vue.prototype.$api.get.mockClear();
  const testUpdater = new PageUpdater(mockEndpoint, mockUid);

  it('throws an error when we attempt to set the data prop', async () => {
    Vue.prototype.$api.get.mockResolvedValue(JSON.parse(JSON.stringify(mockResponse)));
    await testUpdater.init();
    expect(() => {
      testUpdater.data = {};
    }).toThrowError();
  });
});

describe("PageUpdater's archive and restore functionality", () => {
  let testUpdater;
  const ARCHIVE_REQ_BODY = { archive_action: 'archive' };
  const RESTORE_REQ_BODY = { archive_action: 'restore' };

  function testPatchResult(updater, expectedEndpoint, expectedReq, expectedEtag, expectedDataProp) {
    // Check to make sure the correct arguments are passed to axios
    expect(Vue.prototype.$api.patch.mock.calls[0][0]).toEqual(expectedEndpoint);
    // Check to make sure that the data property was passed to the api
    expect(Vue.prototype.$api.patch.mock.calls[0][1]).toEqual(expectedReq);
    // Check to make sure that the etag is included in the headers
    expect(Vue.prototype.$api.patch.mock.calls[0][2].headers).toEqual({ 'If-Match': expectedEtag });

    expect(updater.data).toEqual(expectedDataProp);
  }
  beforeEach(async () => {
    Vue.prototype.$api.get.mockClear();
    Vue.prototype.$api.patch.mockClear();

    testUpdater = new PageUpdater(mockEndpoint, mockUid);
    Vue.prototype.$api.get.mockResolvedValue(JSON.parse(JSON.stringify(mockResponse)));
    await testUpdater.init();
  });

  it('throws an error when we give an invalid action', async () => {
    const badArchiveAction = async () => testUpdater.archiveAction('bad_action', 'etag');
    expect(badArchiveAction()).rejects.toThrowError(/^1st positional argument must match the string 'archive' or 'restore'$/);
  });

  it('passes the correct args to axios, and it updates data prop accordingly for archive', async () => {
    const mockPatchResponse = { data: { uid: 'testing_uid', splash_md: { date: 'TEST DATE', archived: true, etag: 'new_etag1' } } };
    Vue.prototype.$api.patch.mockResolvedValue(mockPatchResponse);

    const { etag } = testUpdater.data.splash_md;
    // Deep copy
    const expectedData = JSON.parse(JSON.stringify(testUpdater.data));
    expectedData.splash_md = mockPatchResponse.data.splash_md;
    await testUpdater.archiveAction('archive');
    testPatchResult(testUpdater, `${mockEndpoint}/${mockUid}`, ARCHIVE_REQ_BODY, etag, expectedData);
  });

  it('passes the correct args to axios, and it updates data prop accordingly for restore', async () => {
    const mockPatchResponse = { data: { uid: 'testing_uid', splash_md: { date: 'TEST DATE', archived: false, etag: 'new_etag1' } } };
    Vue.prototype.$api.patch.mockResolvedValue(mockPatchResponse);

    const { etag } = testUpdater.data.splash_md;
    // Deep copy
    const expectedData = JSON.parse(JSON.stringify(testUpdater.data));
    expectedData.splash_md = mockPatchResponse.data.splash_md;
    await testUpdater.archiveAction('archive');
    testPatchResult(testUpdater, `${mockEndpoint}/${mockUid}`, ARCHIVE_REQ_BODY, etag, expectedData);
  });

  it('passes the correct etag when it is specified', async () => {
    const mockPatchResponse1 = { data: { uid: 'testing_uid', splash_md: { date: 'TEST DATE', archived: true, etag: 'new_etag1' } } };
    Vue.prototype.$api.patch.mockResolvedValue(mockPatchResponse1);

    let etag = 'my_own_etag';
    // Deep copy
    let expectedData = JSON.parse(JSON.stringify(testUpdater.data));
    expectedData.splash_md = mockPatchResponse1.data.splash_md;
    await testUpdater.archiveAction('archive', etag);
    testPatchResult(testUpdater, `${mockEndpoint}/${mockUid}`, ARCHIVE_REQ_BODY, etag, expectedData);

    Vue.prototype.$api.patch.mockClear();
    etag = 'my_own_etag2';
    // Deep copy
    expectedData = JSON.parse(JSON.stringify(testUpdater.data));
    expectedData.splash_md = mockPatchResponse1.data.splash_md;
    await testUpdater.archiveAction('restore', etag);
    testPatchResult(testUpdater, `${mockEndpoint}/${mockUid}`, RESTORE_REQ_BODY, etag, expectedData);
  });
});

// To be used for a later test
// Vue.prototype.$api.get.mockResolvedValue(JSON.parse(JSON.stringify(responses.boron2.data)));
// expect(Vue.prototype.$api.get).toBeCalledTimes(1);
// expect(Vue.prototype.$api.get).toBeCalledWith(`${mockEndpoint}/${mockUid}`);
// expect(testUpdater.data).toEqual(responses.boron2.data);
