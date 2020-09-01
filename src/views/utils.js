import marked from 'marked';
import DOMPurify from 'dompurify';

export default {
  parseMarkDown(markdown) {
    const html = marked(markdown);
    return DOMPurify.sanitize(html);
  },
};
