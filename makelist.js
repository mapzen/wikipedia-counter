var redis = require("redis"),
  client = redis.createClient();

function scanNext(cursor) {
  client.scan(cursor, function(err, response) {
    var newCursor = response[0];
    var items = response[1];

    items.forEach(function(key) {
      client.get(key, function(err, value) {
        console.log(value + ", " + key);
      });
    });
    scanNext(newCursor);
  });
}

scanNext("0");
