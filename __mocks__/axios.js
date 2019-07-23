const mockAxios = jest.genMockFromModule('axios')

/*var axiosInst = {
    request: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    getUri: jest.fn()
} */

mockAxios.create = jest.fn(()=> mockAxios)

export default mockAxios