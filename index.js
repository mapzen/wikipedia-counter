var zlib = require('zlib');
var fs = require('fs');

var fs =  require('fs-extra');
var path = require('path');

var url = process.argv[2];

var redis = require("redis"),
  client = redis.createClient();

var request = require('request');

var i = 0;
var en = 0;

function countRequests(url) {
  client.exists(url, function(err, key_exists) {
    if (key_exists) {
      console.log("skipping " + url);
      return;
    }
    console.log("counting " + url);

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
      var key = lang + ":::" + name;
      var views = parts[2];
      i++;

      if (lang !== 'en') {
        return;
      }
      en++;

      client.incrby(key, parseInt(views));
    });

    rl.on('close', function() {
      console.log(url + ": " + i + " (" + en + " en)");
      client.set(url, "ok");
      process.exit(0);
    });
  });
}

countRequests(url);
