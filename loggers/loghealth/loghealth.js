const { exec } = require("child_process");
var http = require('http');
var fs = require('fs');
var os = require('os');
var childProcess = require('child_process');

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

function getMem() {
  var total;
  var free;

  try {
    var stdout = childProcess.execSync("free -m").toString();
    var data = stdout.split("\n")[1].split(/\s+/);
    var total = data[1];
    var free = data[2];
    return {
      total : total,
      free : free
    }
  } catch(e) {
    console.log("getMem() error");
    return "error"
  }
}

function getTemps() {
  var temp;
  try {
    var stdout = childProcess.execSync("/opt/vc/bin/vcgencmd measure_temp").toString();
    temp = stdout.split("=")[1].split("'")[0];
    return temp;
  } catch(e) {
    console.log("getRasbianTemps error");
    return "error";
  }
}

function getLoad() {
  try {
    var stdout = childProcess.execSync("uptime").toString();
    var data = stdout.split("load average: ")[1].split(", ");
    return {
      current : data[0],
      recent : data[1]
    }
  } catch(e) {
    console.log("getLoad() error");
    return "error"
  }
}

function monitor(seconds) {
  var recordTemps = fs.existsSync("/opt/vc/bin/vcgencmd");
  var hostname = os.hostname();
  var type = hostname + '-health';

  function mon() {
    var content = {};

    if (recordTemps) 
      content.temp = getTemps();
    content.mem = getMem();
    content.load = getLoad();

    post({
      type : type,
      content : content
    });
  }
  mon();
  setInterval(mon, 1000 * seconds);
}

monitor(60 * 10);
