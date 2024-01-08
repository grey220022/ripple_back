const serverlessHttp = require('serverless-http');
const fastifyApp = require('../../server.js');

module.exports.handler = serverlessHttp(fastifyApp);
