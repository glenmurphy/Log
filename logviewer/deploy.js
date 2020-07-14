var SSHBot = require("../sshbot/sshbot.js");

var config = [
  {
    host : 'avocado.glenmurphy.com',
    username : 'glen',
    tasks : [
      { type : 'upload', localFile : './src/index.html', remoteFile : '/home/glen/servers/logviewer/src/index.html'},
      // for sites running server.js (avocado is running nginx - see /etc/nginx/sites-available/logs.glenmurphy.com)
      //{ type : 'upload', localFile : 'server.js', remoteFile : '/home/glen/servers/logviewer/server.js'},
      //{ type : 'exec', cmd : 'sudo systemctl restart logviewer'}
    ]
  }
];

SSHBot.run(config);