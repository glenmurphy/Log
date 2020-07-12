var SSHBot = require("../sshbot/sshbot.js");

var config = [
  {
    host : 'avocado.glenmurphy.com',
    username : 'glen',
    tasks : [
      { type : 'upload', localFile : 'server.js', remoteFile : '/home/glen/servers/logviewer/server.js'},
      { type : 'upload', localFile : './src/index.html', remoteFile : '/home/glen/servers/logviewer/src/index.html'},
      { type : 'exec', cmd : 'sudo systemctl restart logviewer'}
    ]
  }
];

SSHBot.run(config);