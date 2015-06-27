'use strict';

import coffee from 'coffee-script';
import convertSourceMap from 'convert-source-map';

const coffeeExt = /\.(coffee|litcoffee|coffee\.md)$/;
const literateCoffeeExt = /\.(litcoffee|coffee\.md)$/;

export default function () {

  return function exhibitCoffee(filename, contents) {
    const results = {};

    // pass on non-coffee files
    if (!coffeeExt.test(filename)) return true;

    const jsFilename = filename.replace(coffeeExt, '.js');
    const source = contents.toString();
    let compiled;

    try {
      compiled = coffee.compile(source, {
        sourceMap: true,
        generatedFile: filename,
        inline: true,
        literate: literateCoffeeExt.test(filename),
      });
    }
    catch (err) {
      // console.dir(err);

      throw new this.SourceError({
        message: err.message,
        filename: filename,
        text: source,
        line: err.location.first_line + 1,
        column: err.location.first_column + 1,
        endLine: err.location.last_line + 1,
        endColumn: err.location.last_column + 1,
      });
    }

    const comment = convertSourceMap
      .fromJSON(compiled.v3SourceMap)
      .setProperty('sources', [filename])
      .toComment();

    results[jsFilename] = compiled.js + '\n' + comment;
    return results;
  };
}
