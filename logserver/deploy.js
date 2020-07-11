var SSHBot = require("../sshbot/sshbot.js");

var config = [
  {
    host : 'avocado.glenmurphy.com',
    username : 'glen',
    tasks : [
      { type : 'upload', localFile : 'logserver.js', remoteFile : '/home/glen/servers/logs/logserver.js'},
      { type : 'exec', cmd : 'sudo systemctl restart logserver'}
    ]
  }
];

SSHBot.run(config);