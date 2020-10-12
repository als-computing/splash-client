import DocumentUpdater from '@/components/editor/DocumentUpdater';
import Vue from 'vue';
import responses from '../../../responses/compound-responses';


jest.mock('vue');
Vue.prototype.$api = {
  get: jest.fn(),
  put: jest.fn(),
};

const mockUid = 'the_one_ring';
const mockEndpoint = 'compounds';
const mockResponse = responses.boron;

describe('documentUpdater class', () => {
  const testUpdater = new DocumentUpdater(mockEndpoint, mockUid);

  it('initializes by sending the correct axios request', async () => {
    // I do JSON.parse(JSON.stringify(mockData)) to deep clone so that any edits
    // made by this class won'r transfer to the original imported object
    Vue.prototype.$api.get.mockResolvedValue(JSON.parse(JSON.stringify(mockResponse)));
    await testUpdater.init();
    expect(Vue.prototype.$api.get).toBeCalledWith(`${mockEndpoint}/${mockUid}`);
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
    await testFunctionErrors(TypeError, /^3rd positional argument cannot be null or undefined$/, 'bar', 'foo');
    await testFunctionErrors(TypeError, /^1st positional argument: species\.bar, leads to undefined or null property in data$/, 'species.bar', 'foo', {});
    await testFunctionErrors(TypeError, /^1st positional argument: species\.bar, leads to undefined or null property in data$/, 'species.bar', 'foo', {});
    await testFunctionErrors(TypeError, /^1st positional argument: species, must lead to an object, not a primitive$/, 'species', 'foo', {});
  });

  it('restores the original data object when an axios error is thrown and re-throws axios error', async () => {
    Vue.prototype.$api.put.mockImplementation(async () => {
      throw new Error('Test Error');
    });
    const update = async () => testUpdater.updateDataProperty('metadata', '', []);
    await expect(update()).rejects.toThrowError(/^Test Error$/);

    expect(testUpdater.data).toEqual(mockResponse.data);
  });

  it('passes the correct args to axios, and changes the data prop to match when the request is successful', async () => {
    Vue.prototype.$api.put.mockReset();
    await testUpdater.updateDataProperty('', 'metadata', [{ title: 'test', text: 'test' }]);
    const expectedData = JSON.parse(JSON.stringify(mockResponse.data));
    expectedData.metadata = [{ title: 'test', text: 'test' }];

    expect(Vue.prototype.$api.put.mock.calls[0][0]).toEqual(`${mockEndpoint}/${mockUid}`);
    expect(Vue.prototype.$api.put.mock.calls[0][1]).toEqual(expectedData);
    const removeUid = Vue.prototype.$api.put.mock.calls[0][2].transformRequest[0];

    const uidRemoved = JSON.parse(removeUid(expectedData));

    const { uid } = expectedData;
    delete expectedData.uid;
    expect(uidRemoved).toEqual(expectedData);
    expectedData.uid = uid;
    expect(testUpdater.data).toEqual(expectedData);


    await testUpdater.updateDataProperty('documentation', 'sections', [{ title: 'test', text: 'test' }]);
    expectedData.documentation.sections = [{ title: 'test', text: 'test' }];

    expect(Vue.prototype.$api.put.mock.calls[0][1]).toEqual(expectedData);

    expect(testUpdater.data).toEqual(expectedData);
  });
});
