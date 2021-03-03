const data = {

  species: 'Boron',
  metadata: [
    {
      title: 'produced_water_relevance',
      text: 'Toxicity (319)',
    },
    {
      title: 'origin',
      text: 'Presence in geologic formations (196)',
    },
    {
      title: 'fundamental_relevance',
      text: 'Uncharged at neutral pH (196)',
    },
  ],
  documentation: "MARKDOWN",
};

export default {
  mock: {
    data,
    init: jest.fn(),
    updateDataProperty: jest.fn(),
  },
  data,
};
