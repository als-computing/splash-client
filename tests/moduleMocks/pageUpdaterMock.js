import pages from '../responses/pages-responses';

export default {
  mock: {
    data: pages.boron.data,
    init: jest.fn(),
    updateDataProperty: jest.fn(),
  },
  data: pages.boron.data,
};
