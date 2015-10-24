var zlib = require('zlib');
var fs = require('fs');

var fs =  require('fs-extra');
var path = require('path');

var url_or_path = process.argv[2];

var request = require('request');

var Pg = require('pg-native');

var pg = new Pg();
var conString = "postgres://julian@localhost/wikipedia";

var i = 0;

function get_stream_for_input_param(url_or_path) {
  if (url_or_path.indexOf('http') === 0) {
    console.log("streaming from URL "+ url_or_path);
    return request(url_or_path);
  } else {
    console.log("reading from file "+ url_or_path);
    return fs.createReadStream(url_or_path);
  }
}

function countRequests(input_stream) {
  pg.connect(conString, function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var asyncQuery = "SET SESSION synchronous_commit = off";
    pg.querySync(asyncQuery);

    var pg95query = "INSERT INTO view_counts (path, language, count) VALUES( $1::text, $2, $3) \
    ON CONFLICT (language, path) DO UPDATE SET count = view_counts.count + EXCLUDED.count;";

    pg.prepare('update_count', pg95query, 3, function(prepare_err) {
      if (prepare_err) throw prepare_err;
      var zpipe = zlib.createGunzip();

      var rl = require('readline').createInterface({
        input: input_stream.pipe(zpipe)
      });

      input_stream.on('error', function(error) {
        console.log(error);
        process.exit(1);
      });

      zpipe.on('error', function(error) {
        console.log(url_or_path + "\n" + error);
        process.exit(1);
      });

      rl.on('line', function (line) {
        var parts = line.split(' ');

        var lang = parts[0];
        var name = parts[1];
        var views = parts[2];
        i++;

        // remove this to import other languages and proejcts
        // it will significantly increase the amount of data inserted
        if (lang !== 'en') {
          return;
        }

        pg.executeSync('update_count', [ name, lang, views ]);
      });

      rl.on('close', function() {
        console.log(url_or_path + ": " + i);

        pg.end(function() {
          process.exit(0);
        });
      });
    });
  });
}

countRequests(get_stream_for_input_param(url_or_path));
