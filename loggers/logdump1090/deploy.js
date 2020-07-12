var SSHBot = require("../../sshbot/sshbot.js");

var config = [
  {
    host : 'coconut.glenmurphy.com',
    username : 'glen',
    tasks : [
      { type : 'upload', localFile : 'logdump1090.js', remoteFile : '/home/glen/logdump1090/logdump1090.js'},
      { type : 'exec', cmd : 'sudo systemctl restart logdump1090'}
    ]
  },
];

SSHBot.run(config);