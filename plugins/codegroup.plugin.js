
const codeBlocks = require('gfm-code-blocks');
const _ = require('lodash');

const PLUGIN_CONST = {
    langSeperator: '::',
    tokenName: 'codegroup',
};

const getLine = (state, line) => {
    var pos = state.bMarks[line] + state.blkIndent,
        max = state.eMarks[line];
  
    return state.src.substr(pos, max - pos);
};

const createGroup = (markdown) => {
    return (state, startLine, endLine, checkMode) => {
        if (getLine(state, startLine) == `[${PLUGIN_CONST.tokenName}]`) {
            let startPgn = startLine + 1;
            let nextLine = startPgn;
            while (nextLine < endLine) {
              if (getLine(state, nextLine) == `[/${PLUGIN_CONST.tokenName}]`) {
                state.tokens.push({
                  type: PLUGIN_CONST.tokenName,
                  content: state.getLines(startPgn, nextLine, state.blkIndent, true),
                  block: true,
                  lines: [ startLine, nextLine ],
                  level: state.level
                });
                state.line = nextLine + 1;
                return true;
              }
              nextLine ++;
            }
          }
          return false
    }
};

const getTabName = (lang) => {
    if (_.includes(lang, PLUGIN_CONST.langSeperator)) {
        const split = lang.split(PLUGIN_CONST.langSeperator);
        return split[1];
    }
    return lang;
};

const getLangName = (lang) => {
    if (_.includes(lang, PLUGIN_CONST.langSeperator)) {
        const split = lang.split(PLUGIN_CONST.langSeperator);
        return split[0];
    }
    return lang;
};

const renderCodeGroup = (md, content, block) => {
    const parsedCodeBlocks = codeBlocks(content);
    const navItems = [];
    const allSections = parsedCodeBlocks.map((item, i) => {
        const descriptor = item.lang;
        const tabId = `${descriptor.replace(PLUGIN_CONST.langSeperator, '-')}-${i}`;
        item.sanitizedBlock = item.block.replace(descriptor, getLangName(descriptor));
        const render = md.render(item.sanitizedBlock);
        const active = i === 0 ? ' active' : '';
        const lang = `<!-- lang section -->
        <div role="tabpanel" class="tab-pane lang-section${active}" id="${tabId}">
            ${render}
        </div>  <!-- lang section end -->`;
        item.rendered = lang;
        const nav = `
        <li role="presentation" class="${active}">
            <a href="#${tabId}" aria-controls="${tabId}" 
            role="tab" data-toggle="tab">${getTabName(descriptor)}</a>
        </li>`;
        navItems.push(nav);
        return item.rendered;
    });
  
    const group = `<!-- codegroup -->
    <div class="codegroup">
        <ul class="nav nav-tabs" role="tablist">
            ${navItems.join('')}
        </ul>
        <div class="tab-content">
            ${allSections.join('')}
        </div>
    </div>  <!-- codegroup end -->`;
    return group;
};

module.exports = (md) => {
    md.block.ruler.before('code', PLUGIN_CONST.tokenName, createGroup(md), {alt: []});
    md.renderer.rules.codegroup = function(tokens, idx) {
        return renderCodeGroup(md, tokens[idx].content, tokens[idx].block);
    };
};