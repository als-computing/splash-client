export default {
  AUTOCOMPLETE: {
    // https://www.elastic.co/guide/en/elasticsearch/reference/6.8/search-suggesters-completion.html#search-suggesters-completion

    // The _source field specifies that elasticsearch should only return the text of each
    // entry in the options array for each different query,
    // An explanation of this is laid out at the end of this file
    _source: ['researcherNameSuggestions.text', 'experimentNameSuggestions.text', 'groupNameSuggestions.text', 'solutesSuggestions.text', 'polymerSuggestions.text', 'institutionSuggestions.text'],
    suggest: {
      text: '',
      // Following are the queries we are
      // performing, the top name (e.g. researcherNameSuggestions)
      // for each is the arbitrary name we are giving the query.
      // They're only really for referencing the query data when
      // it comes back from elastic in JSON
      // Then the completion field gives options for each query
      // where "field" specifies the document field we
      // are performing the query on
      // Example responses can be seen at the end of this file
      researcherNameSuggestions: {
        completion: {
          field: 'researcher.name.autocomplete',
          skip_duplicates: true,
          size: 10,
        },
      },
      experimentNameSuggestions: {
        completion: {
          field: 'name.autocomplete',
          skip_duplicates: true,
          size: 10,
        },
      },
      groupNameSuggestions: {
        completion: {
          field: 'researcher.group.autocomplete',
          skip_duplicates: true,
          size: 10,
        },
      },
      solutesSuggestions: {
        completion: {
          field: 'trials.solutes_present.autocomplete',
          skip_duplicates: true,
          size: 10,
        },
      },
      polymerSuggestions: {
        completion: {
          field: 'trials.membrane_or_polymer.autocomplete',
          skip_duplicates: true,
          size: 10,
        },
      },
      institutionSuggestions: {
        completion: {
          field: 'researcher.institution.autocomplete',
          skip_duplicates: true,
          size: 10,
        },
      },
    },
  },
  FUZZY_AUTOCOMPLETE: {
    // Explanation here: https://www.elastic.co/guide/en/elasticsearch/reference/6.8/search-suggesters-completion.html#fuzzy
    _source: ['researcherNameSuggestions.text', 'experimentNameSuggestions.text', 'groupNameSuggestions.text', 'solutesSuggestions.text', 'polymerSuggestions.text', 'institutionSuggestions.text'],
    suggest: {
      text: '',
      researcherNameSuggestions: {

        completion: {
          field: 'researcher.name.autocomplete',
          fuzzy: {},
          skip_duplicates: true,
        },
      },
      experimentNameSuggestions: {

        completion: {
          field: 'name.autocomplete',
          fuzzy: {},
          skip_duplicates: true,
        },
      },
      groupNameSuggestions: {

        completion: {
          field: 'researcher.group.autocomplete',
          fuzzy: {},
          skip_duplicates: true,
        },
      },
      solutesSuggestions: {

        completion: {
          field: 'trials.solutes_present.autocomplete',
          fuzzy: {},
          skip_duplicates: true,
        },
      },
      polymerSuggestions: {

        completion: {
          field: 'trials.membrane_or_polymer.autocomplete',
          fuzzy: {},
          skip_duplicates: true,
        },
      },
      institutionSuggestions: {

        completion: {
          field: 'researcher.institution.autocomplete',
          fuzzy: {},
          skip_duplicates: true,
        },
      },
    },
  },
};

/* An explanation of the _source field:
The _source field specifies the parts of the
queries that we should return from elasticsearch.
Take this query for instance:

GET /search/run_start/_search

{
    "suggest": {
        "sample": {
            "prefix": "{1=s",
            "completion": {
                "field": "sample.autocomplete"
            }
        },
        "uid": {
            "prefix": "0f",
            "completion": {
                "field": "uid.autocomplete"
            }
        }
    }
}

Elasticsearch would return:

{
    "took": 4,
    "timed_out": false,
    "_shards": {
        "total": 1,
        "successful": 1,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
            "value": 0,
            "relation": "eq"
        },
        "max_score": null,
        "hits": []
    },
    "suggest": {
        "sample": [
            {
                "text": "{1=s",
                "offset": 0,
                "length": 4,
                "options": [
                    {
                        "text": "{1=sample1,2=KM3245432}",
                        "_index": "splash.run_start",
                        "_type": "_doc",
                        "_id": "5f244ab3f8af7359e3ee5900",
                        "_score": 1.0,
                        "_ignored": [
                            "time"
                        ],
                        "_source": {
                            "background_roi": "None",
                            "clip_to_roi": "No",
                            "curvature": 0,
                            "data_file": "C:\\Beamline Controls\\BCS Setup Data\\200312\\CCD Scan 64781",
                            "delay_after_move": 0,
                            "detector": "CCD",
                            "motor_file": "Y:\\MWET EFRC\\03.12.2020\\2020 03 12\\GI_RSoXS.txt",
                            "plan_name": "One Motor From File",
                            "roi": "1309 526 2539 1627",
                            "sample": "{1=sample1,2=KM3245432}",
                            "stay_at_end": 0,
                            "time": 1596213939.7743134,
                            "uid": "0c30d227-bcad-4f6f-af0e-72b36347c020",
                            "x_motor": "Beamline Energy"
                        }
                    },
                    {
                        "text": "{1=sample1,2=KM3245432}",
                        "_index": "splash.run_start",
                        "_type": "_doc",
                        "_id": "5f244ab4f8af7359e3ee5927",
                        "_score": 1.0,
                        "_source": {
                            "background_roi": "None",
                            "clip_to_roi": "No",
                            "curvature": 0,
                            "data_file": "C:\\Beamline Controls\\BCS Setup Data\\200312\\CCD Scan 64767",
                            "delay_after_move": 0,
                            "detector": "CCD",
                            "motor_file": "Y:\\TempDATA\\WenkaiZhong\\C_edge.txt",
                            "plan_name": "One Motor From File",
                            "roi": "1309 526 2539 1627",
                            "sample": "{1=sample1,2=KM3245432}",
                            "stay_at_end": 0,
                            "time": 1596213940.373389,
                            "uid": "69cc5554-4199-48fa-a620-9f409a778e16",
                            "x_motor": "Beamline Energy"
                        }
                    },
                    {
                        "text": "{1=sample1,2=KM3245432}",
                        "_index": "splash.run_start",
                        "_type": "_doc",
                        "_id": "5f244ab5f8af7359e3ee5af5",
                        "_score": 1.0,
                        "_ignored": [
                            "time"
                        ],
                        "_source": {
                            "background_roi": "None",
                            "clip_to_roi": "No",
                            "curvature": 0,
                            "data_file": "C:\\Beamline Controls\\BCS Setup Data\\200312\\CCD Scan 64783",
                            "delay_after_move": 0,
                            "detector": "CCD",
                            "motor_file": "Y:\\MWET EFRC\\03.12.2020\\2020 03 12\\GI_RSoXS.txt",
                            "plan_name": "One Motor From File",
                            "roi": "1309 526 2539 1627",
                            "sample": "{1=sample1,2=KM3245432}",
                            "stay_at_end": 0,
                            "time": 1596213941.8697748,
                            "uid": "4c8732cb-f1ee-43f1-8dc6-c6c0c7c1ece1",
                            "x_motor": "Beamline Energy"
                        }
                    },
                    {
                        "text": "{1=sample1,2=KM3245432}",
                        "_index": "splash.run_start",
                        "_type": "_doc",
                        "_id": "5f244ab5f8af7359e3ee5b1c",
                        "_score": 1.0,
                        "_ignored": [
                            "time"
                        ],
                        "_source": {
                            "background_roi": "None",
                            "clip_to_roi": "No",
                            "curvature": 0,
                            "data_file": "C:\\Beamline Controls\\BCS Setup Data\\200312\\CCD Scan 64765",
                            "delay_after_move": 0,
                            "detector": "CCD",
                            "motor_file": "Y:\\TempDATA\\WenkaiZhong\\C_edge.txt",
                            "plan_name": "One Motor From File",
                            "roi": "1309 526 2539 1627",
                            "sample": "{1=sample1,2=KM3245432}",
                            "stay_at_end": 0,
                            "time": 1596213941.9845214,
                            "uid": "0d90c550-cbfe-4835-915f-410b8b3b3fd9",
                            "x_motor": "Beamline Energy"
                        }
                    },
                ]
            }
        ],
        "uid": [
            {
                "text": "0f",
                "offset": 0,
                "length": 2,
                "options": [
                    {
                        "text": "0f6ca3f9-e37f-4118-b007-9f0b794db779",
                        "_index": "splash.run_start",
                        "_type": "_doc",
                        "_id": "5f244ab9f8af7359e3ee6146",
                        "_score": 1.0,
                        "_ignored": [
                            "time"
                        ],
                        "_source": {
                            "background_roi": "None",
                            "clip_to_roi": "No",
                            "curvature": 0,
                            "data_file": "C:\\Beamline Controls\\BCS Setup Data\\200312\\CCD Scan 64770",
                            "delay_after_move": 0,
                            "detector": "CCD",
                            "motor_file": "Y:\\TempDATA\\WenkaiZhong\\C_edge.txt",
                            "plan_name": "One Motor From File",
                            "roi": "1309 526 2539 1627",
                            "sample": "{1=sample1,2=KM3245432}",
                            "stay_at_end": 0,
                            "time": 1596213945.8506913,
                            "uid": "f36ca3f9-e37f-4118-b007-9f0b794db779",
                            "x_motor": "Beamline Energy"
                        }
                    }
                ]
            }
        ]
    }
}

We don't want it to return the entire document but instead only the top level text field
in each object in the options arrays. To do this we make use of the "_source" parameter

GET search/run_start/_search

{
    "_source": ["uid.text", "sample.text"],
    "suggest": {
        "sample": {
            "prefix": "{1=s",
            "completion": {
                "field": "sample.autocomplete"
            }
        },
        "uid": {
            "prefix": "0f",
            "completion": {
                "field": "uid.autocomplete"
            }
        }
        }
    }

Elasticsearch now returns:

{
    "took": 5,
    "timed_out": false,
    "_shards": {
        "total": 1,
        "successful": 1,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
            "value": 0,
            "relation": "eq"
        },
        "max_score": null,
        "hits": []
    },
    "suggest": {
        "sample": [
            {
                "text": "{1=s",
                "offset": 0,
                "length": 4,
                "options": [
                    {
                        "text": "{1=sample1,2=KM3245432}",
                        "_index": "splash.run_start",
                        "_type": "_doc",
                        "_id": "5f244ab3f8af7359e3ee5900",
                        "_score": 1.0,
                        "_ignored": [
                            "time"
                        ],
                        "_source": {}
                    },
                    {
                        "text": "{1=sample1,2=KM3245432}",
                        "_index": "splash.run_start",
                        "_type": "_doc",
                        "_id": "5f244ab4f8af7359e3ee5927",
                        "_score": 1.0,
                        "_source": {}
                    },
                    {
                        "text": "{1=sample1,2=KM3245432}",
                        "_index": "splash.run_start",
                        "_type": "_doc",
                        "_id": "5f244ab5f8af7359e3ee5af5",
                        "_score": 1.0,
                        "_ignored": [
                            "time"
                        ],
                        "_source": {}
                    },
                    {
                        "text": "{1=sample1,2=KM3245432}",
                        "_index": "splash.run_start",
                        "_type": "_doc",
                        "_id": "5f244ab5f8af7359e3ee5b1c",
                        "_score": 1.0,
                        "_ignored": [
                            "time"
                        ],
                        "_source": {}
                    },
                    {
                        "text": "{1=sample1,2=KM3245432}",
                        "_index": "splash.run_start",
                        "_type": "_doc",
                        "_id": "5f244ab7f8af7359e3ee5cea",
                        "_score": 1.0,
                        "_ignored": [
                            "time"
                        ],
                        "_source": {}
                    }
                ]
            }
        ],
        "uid": [
            {
                "text": "0f",
                "offset": 0,
                "length": 2,
                "options": [
                    {
                        "text": "f36ca3f9-e37f-4118-b007-9f0b794db779",
                        "_index": "splash.run_start",
                        "_type": "_doc",
                        "_id": "5f244ab9f8af7359e3ee6146",
                        "_score": 1.0,
                        "_ignored": [
                            "time"
                        ],
                        "_source": {}
                    }
                ]
            }
        ]
    }
}
 */
