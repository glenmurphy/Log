var mongo = require('mongodb');
var fs = require('fs');
var http = require('http');
var querystring = require('querystring');
var rjson = require('relaxed-json');

var MongoIP = "100.122.250.78";
var HTTPIP = "100.122.250.78";

function Logs() {
  this.mongoClient = mongo.MongoClient;
  this.mongoClient.connect("mongodb://"+MongoIP+":27017/logsdb", this.handleConnect.bind(this));
}

Logs.prototype.handleConnect = function(err, db) {
  if (err) throw err;
  this.db = db.db("logsdb");
  this.db.createCollection("logs", this.handleCreateCollection.bind(this));
}

Logs.prototype.handleCreateCollection = function(err, res) {
  if (err) throw err;
  console.log("Collection created!");
  this.logs = this.db.collection("logs");

  this.logs.findOne({}, function(err, result) {
    if (err) throw err;
    if (result) {
      console.log("Most recent entry:");
      console.log(result);
    }
  });

  this.startServer();
}

Logs.prototype.startServer = function() {
  console.log("Starting server");
  http.createServer(this.handleRequest.bind(this)).listen(5706, HTTPIP);
  http.createServer(this.handleRequest.bind(this)).listen(5706, "127.0.0.1");
}

Logs.prototype.insert = function(type, content) {
  console.log("  Inserting...");
  this.logs.insertOne({
    type : type,
    date : new Date(),
    content : content
  });
}

Logs.prototype.selectRecent = function(limit, callback) {
  console.log("  Selecting recent");
  this.logs.find().sort({date: -1}).limit(limit).toArray(callback);
}

Logs.prototype.selectType = function(type, limit, callback) {
  console.log("  Selecting by type:" + type);
  this.logs.find({type : type}).sort({date: -1}).limit(limit).toArray(callback);
}

Logs.prototype.selectQuery = function(query, limit, callback) {
  console.log("  Selecting by query");
  this.logs.find(query).sort({date: -1}).limit(limit).toArray(callback);
}


Logs.prototype.handleGet = function(res, data) {
  var limit = data.limit ? Math.min(data.limit, 100) : 10;

  if (data.type) {
    this.selectType(data.type, limit, function(e, r) {
      res.write(JSON.stringify(r));
      res.end();
    });
  } else if (data.q) {
    var limit = data.limit ? Math.min(data.limit, 100) : 10;
    var query = {};
    try {
      query = rjson.parse(data.q)
    } catch(e) {
      console.log("  JSON parse error");
      res.write("Query JSON format error; make sure it's valid JSON (double-quotes and all); you can make it safe by doing 'http://address/?q=' + encodeURIComponent(JSON.stringify({test:'test'}));");
      res.end();
      return;
    }
    this.selectQuery(query, limit, function(e, r) {
      res.write(JSON.stringify(r));
      res.end();
    });
  } else {
    this.selectRecent(limit, function(e, r) {
      res.write(JSON.stringify(r));
      res.end();
    });
  }
}

Logs.prototype.handlePost = function(data) {
  if (data.type)
    this.insert(data.type, data.content);
}

Logs.prototype.handleRequest = function(req, res) {
  console.log("* New request from " + req.connection.remoteAddress);
  res.writeHead(200);
  if (req.method == 'GET') {
    console.log("  Handling GET for " + req.url);
    // e.g. "http://address/?type=test"
    // e.g. "http://address/?q=" + encodeURIComponent(JSON.stringify({test:'test'}));
    res.writeHead(200, {
      'Access-Control-Allow-Origin' : '*',
      'Content-Type': 'application/json'
    });
    var queryData = req.url.split('?')[1];
    this.handleGet(res, querystring.parse(queryData));
  } else if (req.method == 'POST') {
    console.log("  Handling POST");
    // e.g.
    // fetch('http://localhost:5706', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     type: 'exam',
    //     content : { title : 'exam title', body : 'exam body'}
    //   }),
    //   headers: {
    //     'Content-type': 'application/json; charset=UTF-8'
    //   }
    // })
    var queryData = "";
    req.on('data', function(data) {
      queryData += data;
      if(queryData.length > 1e6) {
          queryData = "";
          res.writeHead(413, {'Content-Type': 'text/plain'}).end();
          req.connection.destroy();
      }
    });
    req.on('end', function() {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end();
      this.handlePost(JSON.parse(queryData));
    }.bind(this));
  } else {
    console.log("  Not handled: " + req.method);
    res.end();
  }
}

new Logs();