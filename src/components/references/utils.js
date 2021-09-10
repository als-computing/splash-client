import Vue from 'vue';
import Citation from 'citation-js';
import DOMPurify from 'dompurify';

async function getDOIFromService(doi) {
  const response = await Vue.prototype.$doi_service.get(`/${doi}`);
  return response;
}
async function getSplashReference(doi) {
  const response = await Vue.prototype.$api.get(`${Vue.prototype.$references_url}/doi/${doi}`);
  return response;
}
async function createReference(reference) {
  const response = await Vue.prototype.$api.post(`${Vue.prototype.$references_url}`, reference);
  return response;
}

const CITE_FORMAT = { format: 'html', template: 'apa', lang: 'en-US' };

export default {
  getDOIFromService,
  addRefObjectToSplash: createReference,

  generateHtmlCitation(reference) {
    return DOMPurify.sanitize(new Citation(reference).format('bibliography', CITE_FORMAT));
  },

  generateInTextCitation(reference) {
    return DOMPurify.sanitize(new Citation(reference).format('citation'));
  },
  async checkDOIExists(doi) {
    try {
      return { response: (await getSplashReference(doi)), where: 'splash' };
    } catch (e) {
      console.log('caught');
      if (e.response.status !== 404) {
        throw e;
      }
    }
    try {
      return { response: (await getDOIFromService(doi)), where: 'service' };
    } catch (e) {
      if (e.response.status !== 404) {
        throw e;
      }
    }
    return false;
  },

  async getRefOrCreateIfNotExists(doi) {
    let resp = await this.requestReference(doi);
    if (resp === 404) {
      resp = this.makeReference(doi);
    }
    return resp;
  },

  async requestReference(doi) {
    // This function will attempt to get the current doi from the splash database. If it succeeds it will return
    // an object that looks like this: {doi: "10.XX/XX", citation:"<HTML FORMAT OF THE CITATION>", error: false}
    // If it does not exist in the db (404 response) Then it will return the integer 404. For any other
    // non 404 error it will return:
    // { doi, citation: `Error connecting to server when getting: ${doi}. Try reloading the page.`, error: true, }
    try {
      const response = await getSplashReference(doi);
      return {
        doi,
        citation: this.generateHtmlCitation(response.data),
        error: false,
      };
    } catch (e) {
      console.log(e);
      if (e.response.status !== 404) {
        return {
          doi,
          citation: `Error connecting to server when getting: ${doi}. Try reloading the page.`,
          error: true,
        };
      }
      return 404;
    }
  },

  async makeReference(doi) {
    // This function will attempt to find the reference from the doi rest service and use this
    // to create a new reference in the splash database.
    // If the doi does not exist in the rest service (404 response) it will return
    // an object like: { doi, citation: `Could not find: ${doi}`, error: true }
    // If it succeeds in creating this new citation then it will return an object
    // like this: {doi: "10.XX/XX", citation:"<HTML FORMAT OF THE CITATION>", error: false}

    // For non-404 errors in retrieving from the DOI reference service or for ANY ERROR in creating a new doi
    // in the splash db it will return:
    // { doi, citation: `Error in creating new reference: ${doi}. Try reloading the page.`, error: true, }
    let response = {};
    try {
      response = await getDOIFromService(doi);
    } catch (e) {
      console.log(e);
      if (e.response.status === 404) {
        // All the code commented out is when we attempt to create a new empty reference
        // If one in the document does not exist. For now we are only notifying the user
        // That it doesn't exist rather than making an empty one in the database
        // try {
        // await createReference({ DOI: doi, origin_url: 'none' });
        return {
          doi,
          citation: `Could not find: ${doi}`,
          error: true,
        };
        /* } catch (err) {
              return {
                doi,
                citation: `${doi} COULDN'T SAVE REFERENCE TO SERVER OR GET REFERENCE INFO. FOR THE DEV: IMPLEMENT TRY AGAIN FUNCTIONALITY`,
                html: false,
              };
            } */
      }
      return {
        doi,
        citation: `Error in creating new reference: ${doi}. Try reloading the page.`,
        error: true,
      };
    }
    try {
      response.data.DOI = doi;
      response.data.origin_url = response.request.responseURL;
      await createReference(response.data);
      return {
        doi,
        citation: this.generateHtmlCitation(response.data),
        error: false,
      };
    } catch (e) {
      console.log(e);
      return {
        doi,
        citation: `Error in creating new reference: ${doi}. Try reloading the page.`,
        error: true,
      };
    }
  },
};
