const fs = require('fs');
const Remarkable = require('remarkable');
const meta = require('remarkable-meta');
const Promise = require('bluebird');
const globule = require('globule');
const _ = require('lodash');
const replaceExt = require('replace-ext');
const writeFile = require('write');
const hljs = require('highlight.js');
const Prism = require('prismjs');
// const hljsSwift = require('highlight.js/src/languages/swift');
const yaml = require('yamljs')
const bust = require('html-bust');

const codeGroup = require('./plugins/codegroup.plugin')

// hljs.registerLanguage('swift');

const docFolder = 'source/docs'
const docPath = `./${docFolder}`;
const fileGlob = '**/*.md'
const publicFolder = 'public';
const htmlTemplate = fs.readFileSync('source/doc.template.html', 'utf8')
const config = yaml.parse(fs.readFileSync('source/config.yml', 'utf8'))

function renderContent (content, fileMeta, options) {
    const defaultOpts = {
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return Prism.highlight(lang, str);
            } catch (err) {}
          }
      
          try {
            return hljs.highlightAuto(str).value;
          } catch (err) {}
      
          return ''; // use external default escaping
        }
      };
      const opts = _.merge(defaultOpts, options)
      const markdown = new Remarkable(opts)

  markdown.use(meta)
  markdown.use(codeGroup);

  const rendered = markdown.render(content)
  markdown.meta.fileMeta = fileMeta;

  return {
    content: rendered,
    meta: markdown.meta
  }
}

const filepaths = globule.find(`${docPath}/${fileGlob}`);

filepaths.forEach((dir) => {
    const htmlPath = `./${replaceExt(dir, '.html')}`.replace(docFolder, publicFolder);
    const fileMeta = {
        path: dir,
        htmlPath,
    };
    const fileContents = fs.readFileSync(dir, 'utf8');
    const output = renderContent(fileContents, fileMeta);
    // console.log(output);
    const compiled = _.template(htmlTemplate);
    const html = compiled(output);
    // console.log(html)
    writeFile.sync(htmlPath, html);
});

