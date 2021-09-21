import Vue from 'vue';
import Citation from 'citation-js';
import DOMPurify from 'dompurify';
import { isDoiFormat } from '@/utils';

async function getDOIFromService(doi) {
  try {
    return Vue.prototype.$doi_service.get(`/${doi}`);
  } catch (e) {
    console.log(e);
    throw e;
  }
}
async function getSplashReferenceByDOI(doi) {
  const response = await Vue.prototype.$api.get(`${Vue.prototype.$references_url}/doi/${doi}`);
  return response;
}

async function getSplashReferenceByUID(uid) {
  const response = await Vue.prototype.$api.get(`${Vue.prototype.$references_url}/uid/${uid}`);
  return response;
}

/* async function getSplashReference(id) {
  if (isDoiFormat(id)) return getSplashReferenceByDOI(id);
  return getSplashReferenceByUID(id);
} */

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
      const splashResult = await getSplashReferenceByDOI(doi);
      if (splashResult.data.length !== 0) return { response: splashResult, where: 'splash' };
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

  async requestReference(uid) {
    // This function will attempt to get the current reference from the splash database. If it succeeds it will return
    // an object that looks like this: {uid: "XXXXXXX", citation:"<HTML FORMAT OF THE CITATION>", error: false}
    // If it does not exist in the db (404 response) Then it will return:
    //  { uid: 'XXXXXXX', citation: 'Could not find reference.', error: true,}
    // For any other non 404 error it will return:
    // { uid: 'XXXXX', citation: `Error connecting to server when getting reference. Try reloading the page.`, error: true, }
    try {
      const response = await getSplashReferenceByUID(uid);
      return {
        uid,
        citation: this.generateHtmlCitation(response.data),
        error: false,
      };
    } catch (e) {
      if (e.response === undefined || e.response.status !== 404) {
        return {
          uid,
          citation: 'Error connecting to server when getting reference. Try reloading the page.',
          error: true,
        };
      }
      return {
        uid,
        citation: 'Could not find reference.',
        error: true,
      };
    }
  },
};
