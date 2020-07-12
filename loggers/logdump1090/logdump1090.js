const { exec } = require("child_process");
var http = require('http');
var https = require('https');

var debug = false;

function post(data) {
  if (debug) {
    console.log(data);
    return;
  }

  var dataString = JSON.stringify(data);
  var options = {
    hostname: 'avocado.glenmurphy.com',
    port: 5706,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    }
  }

  var req = http.request(options, (res) => {
    res.on('data', (d) => {
      process.stdout.write(d)
    })
  })

  req.on('error', (error) => {
    console.error(error)
  })

  req.write(dataString);
  req.end();

  console.log("posted");
}

function monitor(seconds) {
  function mon() {
    https.get('https://coconut.glenmurphy.com/dump1090-fa/data/aircraft.json',(res) => {
      let body = "";
      res.on("data", (chunk) => {
          body += chunk;
      });
      res.on("end", () => {
        try {
          var data = JSON.parse(body);
          var count = 0;
          for (var i = 0; i < data.aircraft.length; i++) {
            if (data.aircraft[i].lat)
              count++;
          }
          post({
            type : "coconut-dump1090",
            content : {
              count : count
            }
          });
        } catch (error) {
          console.error(error.message);
        };
      });
    }).on("error", (error) => {
        console.error(error.message);
    });

  }

  mon();
  setInterval(mon, 1000 * seconds);
}

monitor(60 * 5);
