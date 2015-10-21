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

function get_timestamp(url_or_path) {
  return url_or_path.match(/(\d{8}-\d{6})/)[0];
}

function get_stream_for_input_param(url_or_path) {
  if (url_or_path.indexOf('http') === 0) {
    console.log("streaming from URL "+ url_or_path);
    return request(url_or_path);
  } else {
    console.log("reading from file "+ url_or_path);
    return fs.createReadStream(url_or_path);
  }
}

function insert_hourly(input_stream, timestamp) {
  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var query = "INSERT INTO view_counts_hourly (path, lang, count, hour) VALUES ($1, $2, $3, $4)";
    pg.prepare('insert_hourly', query, 4, function(prepare_err) {
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
        console.log(url + "\n" + error);
        process.exit(1);
      });

      rl.on('line', function (line) {
        var parts = line.split(' ');

        var lang = parts[0];
        var name = parts[1];
        var views = parts[2];

        i++;

        if (i%1000 ===0) console.log(i);

        pg.executeSync('insert_hourly', [ name, lang, views, timestamp ]);
      });

      rl.on('close', function() {
        console.log(timestamp + ": " + i);

        pg.end(function() {
          process.exit(0);
        });
      });
    });
  });
}

insert_hourly(get_stream_for_input_param(url_or_path), get_timestamp(url_or_path));
