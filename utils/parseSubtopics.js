import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { marked } from 'marked'; //markdown to html
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
import { v4 as uuidv4 } from 'uuid';

const parseSubtopics = (body) => {
  const subtopics = [];
  const html = marked.parse(body);
  const dom = new JSDOM(html);

  dom.window.document.querySelectorAll('h3').forEach((el) => {
    const htmlId = uuidv4();
    el.setAttribute('id', htmlId);

    subtopics.push({
      name: el.textContent,
      htmlId,
    });
  });

  return {
    htmlBody: dom.serialize(),
    subtopics,
  };
};

export default parseSubtopics;
