import coffeeScript from 'coffee-script';

const coffeeExt = /\.(coffee|litcoffee|coffee\.md)$/;
const literateCoffeeExt = /\.(litcoffee|coffee\.md)$/;

export default function () {
  return function exhibitCoffee(job) {
    const {path, contents, util: {SourceError, convertSourceMap}} = job;

    // pass non-coffee files straight through
    if (!coffeeExt.test(path)) return contents;

    const jsFilename = path.replace(coffeeExt, '.js');
    const source = contents.toString();
    let compiled;

    try {
      compiled = coffeeScript.compile(source, {
        sourceMap: true,
        generatedFile: path,
        inline: true,
        literate: literateCoffeeExt.test(path),
      });
    }
    catch (err) {
      throw new SourceError({
        filename: path,
        message: err.message,
        text: source,
        line: err.location.first_line + 1,
        column: err.location.first_column + 1,
        endLine: err.location.last_line + 1,
        endColumn: err.location.last_column + 1,
      });
    }

    const comment = convertSourceMap
      .fromJSON(compiled.v3SourceMap)
      .setProperty('sources', [path])
      .toComment();

    return {
      [jsFilename]: compiled.js + '\n' + comment,
    };
  };
}
