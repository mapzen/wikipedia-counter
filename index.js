var zlib = require('zlib');
var fs = require('fs');

var fs =  require('fs-extra');
var path = require('path');

var url = process.argv[2];

var request = require('request');

var Pg = require('pg-native');

var pg = new Pg();
var conString = "postgres://julian@localhost/wikipedia";

var i = 0;

function countRequests(url) {
  console.log("counting " + url);

  pg.connect(conString, function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var queryBegin = "\
    BEGIN;\
    LOCK TABLE view_counts IN SHARE ROW EXCLUSIVE MODE;"

    var query = "\
    WITH upsert AS ( \
      UPDATE \
        view_counts \
      SET \
        count = count + $1 \
      WHERE \
        path = $2::text \
      RETURNING * \
    ) \
    \
    INSERT INTO view_counts (path, count) \
    \
    ( SELECT $2::text, 1 WHERE NOT EXISTS (SELECT * FROM upsert) );";

    var queryEnd="COMMIT;";

    pg.prepare('update_count', query, 3, function(prepare_err) {
      if (prepare_err) throw prepare_err;


      var req = request(url);
      var zpipe = zlib.createGunzip();

      var rl = require('readline').createInterface({
        input: req.pipe(zpipe)
      });

      req.on('error', function(error) {
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

        pg.querySync(queryBegin);
        pg.executeSync('update_count', [ views, name ]);
        pg.querySync(queryEnd);
      });

      rl.on('close', function() {
        console.log(url + ": " + i);

        pg.end(function() {
          process.exit(0);
        });
      });
    });
  });
}

countRequests(url);
