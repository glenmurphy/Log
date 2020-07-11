Server install
- install MongoDB 
  https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
  https://stackoverflow.com/questions/58111885/mongodb-4-2-doesnt-start-on-ubuntu-18-04-after-reinstall-process-immediately-s
- npm install mongodb
- edit /etc/mongod.conf to bind to the right IP addresses
- Edit startServer in logserver.js to contain the right IPs (you don't want this world-writable)
- Run logserver.js (example systemd config included)

Client logger install
- Put the loghealth.js files on your servers, customize the hostname to point to your server
- Set up systemd to run them
- npm install ssh2 (in the /sshbot/ directory if necessary)
- Edit deploy.js on your dev machine accordingly