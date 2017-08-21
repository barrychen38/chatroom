var Vue = require('../vendor/vue');
var io = require('socket.io-client');

Vue.config.devtools = false;

require('./notify')();
require('./app')(Vue, io);
