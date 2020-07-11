var SSHBot = require("../../sshbot/sshbot.js");

var config = [
  {
    host : 'avocado.glenmurphy.com',
    username : 'glen',
    tasks : [
      { type : 'upload', localFile : 'loghealth.js', remoteFile : '/home/glen/servers/loghealth/loghealth.js'},
      { type : 'exec', cmd : 'sudo systemctl restart loghealth'}
    ]
  },
  {
    host : 'coconut.glenmurphy.com',
    username : 'glen',
    tasks : [
      { type : 'upload', localFile : 'loghealth.js', remoteFile : '/home/glen/loghealth/loghealth.js'},
      { type : 'exec', cmd : 'sudo systemctl restart loghealth'}
    ]
  },
];

SSHBot.run(config);