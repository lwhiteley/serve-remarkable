
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
    var allSections = parsedCodeBlocks.map((item, i) => {
        //TODO: remove descriptor from langauge name
        //TODO: use descriptor or lang as title
        const descriptor = item.lang;
        const render = md.render(item.block);
        const active = i === 0 ? ' active' : '';
        const lang = `<!-- lang section -->
        <div role="tabpanel" class="tab-pane lang-section${active}" id="${descriptor.replace('::', '-')}-${i}">
            ${render}
        </div>  <!-- lang section end -->`;
        item.rendered = lang;
        return item.rendered;
    });
    // console.log(allSections.join(''))
    // const allSections = md.render(content);
    const group = `<!-- codegroup -->
    <div class="codegroup">
        <ul class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active">
                <a href="#js-0" aria-controls="js-0" role="tab" data-toggle="tab">js</a>
            </li>
            <li role="presentation"><a href="#swift-2" aria-controls="swift-2" role="tab" data-toggle="tab">swift-2</a></li>
            <li role="presentation"><a href="#js-sdk-1" aria-controls="js::sdk-1" role="tab" data-toggle="tab">js::sdk-1</a></li>
        </ul>
        <div class="tab-content">
            ${allSections.join('')}
        </div>
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