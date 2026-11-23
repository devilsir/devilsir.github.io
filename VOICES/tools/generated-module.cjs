'use strict';
const fs = require('node:fs');
const path = require('node:path');

function writeModule(file, source) {
  const id = path.basename(file, '.js');
  const module = [
    '(function (initialize) {',
    '  if (window.VoicesModules) window.VoicesModules.define(' + JSON.stringify(id) + ', initialize);',
    "  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');",
    '  else initialize();',
    '})(function () {',
    source.trimEnd(),
    '});',
    ''
  ].join('\n');
  fs.writeFileSync(file, module);
}

module.exports = { writeModule };
