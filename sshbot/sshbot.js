var Client = require('ssh2').Client;
var Writable = require('stream').Writable;

var mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!this.muted)
      process.stdout.write(chunk, encoding);
    callback();
  }
});

function SSHBot(host, username, password) {
  this.host = host;
  this.username = username;
  this.password = password;
}

SSHBot.prototype.passwordPrompt = function() {
  return new Promise(resolve => {
    var rl = require('readline').createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal : true
    });

    mutableStdout.muted = false;
    rl.question('Enter password for '+this.host+':', function(answer) {
      process.stdout.write("\n");
      resolve(answer);
      rl.close();
    });
    mutableStdout.muted = true;
  });
}

SSHBot.prototype.connect = async function() {
  if (!this.password) {
    this.password = await this.passwordPrompt();
  }

  return new Promise(
    (resolve) => {
      var conn = new Client();
      this.conn = conn;
      conn.on('ready', (err) => {
        if (err) throw err;
        console.log('** Connected to ' + this.host + ' ******');
        resolve();
      }).connect({
        host: this.host,
        port: 22,
        username: this.username,
        password: this.password
      });
    }
  );
}

SSHBot.prototype.upload = function(localFile, remoteFile) {
  return new Promise(resolve => {
    this.conn.sftp((err, sftp) => {
      if (err) throw err;
      console.log("Uploading...");
      sftp.fastPut(localFile, remoteFile, (err) => {
        if (err) throw err;
        console.log("Uploaded");
        resolve();
      });
    });
  });
}

SSHBot.prototype.exec = function(command) {
  return new Promise(resolve => {
    this.conn.exec(command, { pty: true }, (err, stream) => {
      console.log("Executing '" + command + "'");
      var result = "";
      if (err) throw err;
      stream.on('close', (code, signal) => {
        console.log("Command result: " + result);
        resolve(result);
      }).on('data', (data) => {
        result += data;
        if (data.toString().substring(0, 6) == "[sudo]") {
          console.log("Password required - applying");
          stream.write(this.password + '\n');
          result = ""
        }
      }).stderr.on('data', (data) => {
        console.log('Error: ' + data);
      });
    });
  });
}

SSHBot.prototype.end = function() {
  console.log("Closing connection");
  this.conn.end();
}

SSHBot.run = async function(config) {
  for (var i = 0; i < config.length; i++) {
    var c = config[i];
    var s = new SSHBot(c.host, c.username, c.password);
    await s.connect();
    for (var u = 0; u < c.tasks.length; u++) {
      var task = c.tasks[u];
      switch (task.type) {
        case 'exec':
          await s.exec(task.cmd);
          break;
        case 'upload':
          await s.upload(task.localFile, task.remoteFile);
          break;
      }
    }
    s.end();
  }
}

// Example usage 1
/*
var exampleConfig = [
  {
    host : "example.com",
    username : "ethan",
    tasks : [
      { type : 'exec', cmd : 'sudo uptime'},
      { type : 'upload', localFile : 'test.txt', remoteFile : '/home/glen/test2.txt'},
      { type : 'exec', cmd : 'uptime'}
    ]
  }
];
SSHBot.run(exampleConfig);
*/

// Example usage 2
/*
async function run() {
  var s = new SSHBot("example.com", "glen", "");
  await s.connect();
  var cheese = await s.exec('sudo uptime');
  // do something with cheese
  s.end();
  return;
}
run();
*/

module.exports = SSHBot;