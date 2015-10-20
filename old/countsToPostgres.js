var parse = require('csv-parse');
var fs = require('fs');
var transform = require('stream-transform');

var parser = parse({ delimiter: ',', relax: true});
var input = fs.createReadStream('./sortedCounts');
var stringify = require('csv-stringify');
var stringifier = stringify();

var transformer = transform(function(record) {
  var count = record[0];
  var combined_path = record[1];
  var separatorIndex = combined_path.indexOf(':::');
  var language = combined_path.substring(0, separatorIndex).trim();
  var path = combined_path.substring(separatorIndex+3);

  return [ path, language, count];
});
var stream = input.pipe(parser).pipe(transformer).pipe(stringifier).pipe(process.stdout);

stream.on('close', function() {
  process.exit(0);
});

