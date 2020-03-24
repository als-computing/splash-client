export default {
  fdNoSuggestions: {
    data: {
      took: 5,
      timed_out: false,
      _shards: {
        total: 1,
        successful: 1,
        skipped: 0,
        failed: 0,
      },
      hits: {
        total: {
          value: 0,
          relation: 'eq',
        },
        max_score: null,
        hits: [],
      },
      suggest: {
        experimentNameSuggestions: [
          {
            text: 'fd',
            offset: 0,
            length: 2,
            options: [],
          },
        ],
        groupNameSuggestions: [
          {
            text: 'fd',
            offset: 0,
            length: 2,
            options: [],
          },
        ],
        institutionSuggestions: [
          {
            text: 'fd',
            offset: 0,
            length: 2,
            options: [],
          },
        ],
        polymerSuggestions: [
          {
            text: 'fd',
            offset: 0,
            length: 2,
            options: [],
          },
        ],
        researcherNameSuggestions: [
          {
            text: 'fd',
            offset: 0,
            length: 2,
            options: [],
          },
        ],
        solutesSuggestions: [
          {
            text: 'fd',
            offset: 0,
            length: 2,
            options: [],
          },
        ],
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json; charset=UTF-8',
    },
    config: {
      url: 'http://127.0.0.1:9200/research_experiments/_search',
      method: 'post',
      data: '{"_source":["researcherNameSuggestions.options.text","experimentNameSuggestions.options.text","groupNameSuggestions.options.text","solutesSuggestions.options.text","polymerSuggestions.options.text","institutionSuggestions.options.text"],"suggest":{"text":"m","researcherNameSuggestions":{"completion":{"field":"researcher.name.autocomplete","skip_duplicates":true}},"experimentNameSuggestions":{"completion":{"field":"name.autocomplete","skip_duplicates":true}},"groupNameSuggestions":{"completion":{"field":"researcher.group.autocomplete","skip_duplicates":true}},"solutesSuggestions":{"completion":{"field":"trials.solutes_present.autocomplete","skip_duplicates":true}},"polymerSuggestions":{"completion":{"field":"trials.membrane_or_polymer.autocomplete","skip_duplicates":true}},"institutionSuggestions":{"completion":{"field":"researcher.institution.autocomplete","skip_duplicates":true}}}}',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      baseURL: 'http://127.0.0.1:9200',
      transformRequest: [
        null,
      ],
      transformResponse: [
        null,
      ],
      timeout: 0,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxContentLength: -1,
    },
    request: {},
  },
  moreThanTen: {
    data: {
      took: 11,
      timed_out: false,
      _shards: {
        total: 1,
        successful: 1,
        skipped: 0,
        failed: 0,
      },
      hits: {
        total: {
          value: 0,
          relation: 'eq',
        },
        max_score: null,
        hits: [],
      },
      suggest: {
        experimentNameSuggestions: [
          {
            text: 'm',
            offset: 0,
            length: 1,
            options: [
              {
                text: 'mesh customized architectures tests',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '73',
                _score: 1,
                _source: {},
              },
              {
                text: 'mesh viral metrics tests',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '45',
                _score: 1,
                _source: {},
              },
            ],
          },
        ],
        groupNameSuggestions: [
          {
            text: 'm',
            offset: 0,
            length: 1,
            options: [{
              text: 'Maria',
              _index: 'mwet.research_experiments',
              _type: '_doc',
              _id: '52',
              _score: 1,
              _source: {},
            }],
          },
        ],
        institutionSuggestions: [
          {
            text: 'm',
            offset: 0,
            length: 1,
            options: [{
              text: 'MIT',
              _index: 'mwet.research_experiments',
              _type: '_doc',
              _id: '7',
              _score: 1,
              _source: {},
            },
            {
              text: 'Morehouse',
              _index: 'mwet.research_experiments',
              _type: '_doc',
              _id: '10',
              _score: 1,
              _source: {},
            },
            {
              text: 'Mellon',
              _index: 'mwet.research_experiments',
              _type: '_doc',
              _id: '8',
              _score: 1,
              _source: {},
            },
            {
              text: 'Morphine',
              _index: 'mwet.research_experiments',
              _type: '_doc',
              _id: '70',
              _score: 1,
              _source: {},
            },
            ],
          },
        ],
        polymerSuggestions: [
          {
            text: 'm',
            offset: 0,
            length: 1,
            options: [{
              text: 'M45',
              _index: 'mwet.research_experiments',
              _type: '_doc',
              _id: '85',
              _score: 1,
              _source: {},
            }],
          },
        ],
        researcherNameSuggestions: [
          {
            text: 'm',
            offset: 0,
            length: 1,
            options: [
              {
                text: 'Mason Evans',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '21',
                _score: 1,
                _source: {},
              },
              {
                text: 'Michael Peck',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '22',
                _score: 1,
                _source: {},
              },
              {
                text: 'Mrs. Ashley Mcdowell',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '5',
                _score: 1,
                _source: {},
              },
            ],
          },
        ],
        solutesSuggestions: [
          {
            text: 'm',
            offset: 0,
            length: 1,
            options: [
              {
                text: 'Me',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '45',
                _score: 1,
                _source: {},
              },
              {
                text: 'Mg',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '18',
                _score: 1,
                _source: {},
              },
            ],
          },
        ],
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json; charset=UTF-8',
    },
    config: {
      url: 'http://127.0.0.1:9200/research_experiments/_search',
      method: 'post',
      data: '{"_source":["researcherNameSuggestions.options.text","experimentNameSuggestions.options.text","groupNameSuggestions.options.text","solutesSuggestions.options.text","polymerSuggestions.options.text","institutionSuggestions.options.text"],"suggest":{"text":"m","researcherNameSuggestions":{"completion":{"field":"researcher.name.autocomplete","skip_duplicates":true}},"experimentNameSuggestions":{"completion":{"field":"name.autocomplete","skip_duplicates":true}},"groupNameSuggestions":{"completion":{"field":"researcher.group.autocomplete","skip_duplicates":true}},"solutesSuggestions":{"completion":{"field":"trials.solutes_present.autocomplete","skip_duplicates":true}},"polymerSuggestions":{"completion":{"field":"trials.membrane_or_polymer.autocomplete","skip_duplicates":true}},"institutionSuggestions":{"completion":{"field":"researcher.institution.autocomplete","skip_duplicates":true}}}}',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      baseURL: 'http://127.0.0.1:9200',
      transformRequest: [
        null,
      ],
      transformResponse: [
        null,
      ],
      timeout: 0,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxContentLength: -1,
    },
    request: {},
  },

  s: {
    data: {
      took: 6,
      timed_out: false,
      _shards: {
        total: 1,
        successful: 1,
        skipped: 0,
        failed: 0,
      },
      hits: {
        total: {
          value: 0,
          relation: 'eq',
        },
        max_score: null,
        hits: [],
      },
      suggest: {
        experimentNameSuggestions: [
          {
            text: 's',
            offset: 0,
            length: 1,
            options: [
              {
                text: 'scale viral e-services tests',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '90',
                _score: 1,
                _source: {},
              },
              {
                text: 'strategize global action-items tests',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '86',
                _score: 1,
                _source: {},
              },
              {
                text: 'strategize viral e-tailers tests',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '14',
                _score: 1,
                _source: {},
              },
            ],
          },
        ],
        groupNameSuggestions: [
          {
            text: 's',
            offset: 0,
            length: 1,
            options: [
              {
                text: 'Sanchez',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '2',
                _score: 1,
                _source: {},
              },
              {
                text: 'Smith',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '5',
                _score: 1,
                _source: {},
              },
            ],
          },
        ],
        institutionSuggestions: [
          {
            text: 's',
            offset: 0,
            length: 1,
            options: [
              {
                text: 'Santa Cruz',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '102',
                _score: 1,
                _source: {},
              },

            ],
          },
        ],
        polymerSuggestions: [
          {
            text: 's',
            offset: 0,
            length: 1,
            options: [
              {
                text: 'S45',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '7',
                _score: 1,
                _source: {},
              },
            ],
          },
        ],
        researcherNameSuggestions: [
          {
            text: 's',
            offset: 0,
            length: 1,
            options: [
              {
                text: 'Steven Carroll',
                _index: 'mwet.research_experiments',
                _type: '_doc',
                _id: '37',
                _score: 1,
                _source: {},
              },
            ],
          },
        ],
        solutesSuggestions: [
          {
            text: 's',
            offset: 0,
            length: 1,
            options: [{
              text: 'Sl',
              _index: 'mwet.research_experiments',
              _type: '_doc',
              _id: '101',
              _score: 1,
              _source: {},
            }],
          },
        ],
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json; charset=UTF-8',
        },
        config: {
          url: 'http://127.0.0.1:9200/research_experiments/_search',
          method: 'post',
          data: '{"_source":["researcherNameSuggestions.options.text","experimentNameSuggestions.options.text","groupNameSuggestions.options.text","solutesSuggestions.options.text","polymerSuggestions.options.text","institutionSuggestions.options.text"],"suggest":{"text":"m","researcherNameSuggestions":{"completion":{"field":"researcher.name.autocomplete","skip_duplicates":true}},"experimentNameSuggestions":{"completion":{"field":"name.autocomplete","skip_duplicates":true}},"groupNameSuggestions":{"completion":{"field":"researcher.group.autocomplete","skip_duplicates":true}},"solutesSuggestions":{"completion":{"field":"trials.solutes_present.autocomplete","skip_duplicates":true}},"polymerSuggestions":{"completion":{"field":"trials.membrane_or_polymer.autocomplete","skip_duplicates":true}},"institutionSuggestions":{"completion":{"field":"researcher.institution.autocomplete","skip_duplicates":true}}}}',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=utf-8',
          },
          baseURL: 'http://127.0.0.1:9200',
          transformRequest: [
            null,
          ],
          transformResponse: [
            null,
          ],
          timeout: 0,
          xsrfCookieName: 'XSRF-TOKEN',
          xsrfHeaderName: 'X-XSRF-TOKEN',
          maxContentLength: -1,
        },
        request: {},
      },
    },
  },
};
