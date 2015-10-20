var redis = require("redis"),
  client = redis.createClient();

function scanNext(cursor) {
  client.scan(cursor, function(err, response) {
    var newCursor = response[0];
    var items = response[1];

    client.mget(items, function(response) {
      console.log(response);
    });

    if (newCursor !== "0") {
      scanNext(newCursor);
    }
  });
}

scanNext("0");
