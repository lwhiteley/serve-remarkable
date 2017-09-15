
const codeBlocks = require('gfm-code-blocks');

const getLine = (state, line) => {
    var pos = state.bMarks[line] + state.blkIndent,
        max = state.eMarks[line];
  
    return state.src.substr(pos, max - pos);
  }

const createGroup = (markdown) => {

    // console.log(codeBlocks(fileContents));
    // console.log('create grou')
    return (state, startLine, endLine, checkMode) => {
        if (getLine(state, startLine) == '[codegroup]') {
            let startPgn = startLine + 1;
            let nextLine = startPgn;
            while (nextLine < endLine) {
              if (getLine(state, nextLine) == '[/codegroup]') {
                state.tokens.push({
                  type: 'codegroup',
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
const renderCodeGroup = (md, content, block) => {
    // console.log(content)
    const parsedCodeBlocks = codeBlocks(content);
    parsedCodeBlocks.forEach((item, i) => {
        //TODO: remove descriptor from langauge name
        //TODO: use descriptor or lang as title
        const render = md.render(item.block);
        const descriptor = item.lang;
        const active = 1 === 0 ? ' active' : '';
        const lang = `<!-- lang section -->
        <div role="tabpanel" class="tab-pane lang-section${active}" id="home"">
            <div class="lang-title">${descriptor}</div>
            <div class="code-view">${render}</div>
        </div>  <!-- lang section end -->`;
        item.rendered = lang;
    });
    // console.log(parsedCodeBlocks)
    const allSections = md.render(content);
    const group = `<!-- codegroup -->
    <div class="codegroup">
    ${allSections}
    </div>  <!-- codegroup end -->`;
    return group;
};

module.exports = (md) => {

    md.block.ruler.before('code', 'codegroup', createGroup(md), {alt: []});
    // md.block.ruler.push('katex', parseBlockKatex, options);
    md.renderer.rules.codegroup = function(tokens, idx) {
        return renderCodeGroup(md, tokens[idx].content, tokens[idx].block);
    };
};