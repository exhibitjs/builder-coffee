'use strict';

import coffee from 'coffee-script';
import convertSourceMap from 'convert-source-map';

const coffeeExt = /\.(coffee|litcoffee|coffee\.md)$/;
const literateCoffeeExt = /\.(litcoffee|coffee\.md)$/;

export default function () {

  return function exhibitCoffee(files) {
    return files.map((change) => {
      if (change.type === 'delete' || !coffeeExt.test(change.filename)) {
        return change;
      }

      const jsFilename = change.filename.replace(coffeeExt, '.js');
      const source = change.contents.toString();
      let compiled;

      try {
        compiled = coffee.compile(source, {
          sourceMap: true,
          generatedFile: change.filename,
          inline: true,
          literate: literateCoffeeExt.test(change.filename),
        });
      }
      catch (err) {
        console.dir(err);

        this.emit('error', {
          message: err.message,
          filename: change.filename,
          source: source,
          line: err.location.first_line + 1,
          column: err.location.first_column + 1,
          endLine: err.location.last_line + 1,
          endColumn: err.location.last_column + 1,
        });

        return {
          filename: jsFilename,
          contents: null,
        };
      }

      const comment = convertSourceMap
        .fromJSON(compiled.v3SourceMap)
        .setProperty('sources', [change.filename])
        .toComment();

      return {
        filename: jsFilename,
        contents: compiled.js + '\n' + comment,
      };
    });
  };
}
