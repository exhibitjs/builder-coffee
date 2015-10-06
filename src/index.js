'use strict';

import coffeeScript from 'coffee-script';

const coffeeExt = /\.(coffee|litcoffee|coffee\.md)$/;
const literateCoffeeExt = /\.(litcoffee|coffee\.md)$/;

export default function () {
  return function exhibitCoffee(filename, contents) {
    // pass non-coffee files straight through
    if (!coffeeExt.test(filename)) return contents;

    const jsFilename = filename.replace(coffeeExt, '.js');
    const source = contents.toString();
    let compiled;

    try {
      compiled = coffeeScript.compile(source, {
        sourceMap: true,
        generatedFile: filename,
        inline: true,
        literate: literateCoffeeExt.test(filename),
      });
    }
    catch (err) {
      throw new this.SourceError({
        filename,
        message: err.message,
        text: source,
        line: err.location.first_line + 1,
        column: err.location.first_column + 1,
        endLine: err.location.last_line + 1,
        endColumn: err.location.last_column + 1,
      });
    }

    const comment = this.util.convertSourceMap
      .fromJSON(compiled.v3SourceMap)
      .setProperty('sources', [filename])
      .toComment();

    return {
      [jsFilename]: compiled.js + '\n' + comment,
    };
  };
}
