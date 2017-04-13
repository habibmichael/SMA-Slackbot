'use strict';

const slackClient = require('./slackClient');
const service = require('./service');
const http = require('http');
const server = http.createServer(service);
const config = require('./config');

const slackToken = config.token;
const logLevel = 'verbose';

const rtm = slackClient.init(slackToken, logLevel);
rtm.start();

slackClient.addAuthenticatedHandler(rtm, () => server.listen(3000));

server.on('listening', ()=> {
    console.log(`SMA is listening on ${server.address().port} in ${service.get('env')} mode.`);
});

