var zlib = require('zlib');
var fs = require('fs');

var fs =  require('fs-extra');
var path = require('path');

var url = process.argv[2];

var redis = require("redis"),
  client = redis.createClient();

var request = require('request');

var i = 0;

function countRequests(url) {
  var rl = require('readline').createInterface({
   input: request(url).pipe(zlib.createGunzip())
  });

  rl.on('line', function (line) {
    var parts = line.split(' ');

    var lang = parts[0];
    var name = parts[1];
    var key = lang + ":::" + name;
    var views = parts[2];

    client.incrby(key, parseInt(views));

    i++;
  });
  rl.on('close', function() {
    console.log(url + ": " + i);
    process.exit(0);
  });
}

countRequests(url);
