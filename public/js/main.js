var Vue = require('../vendor/vue');
var io = require('socket.io-client');

Vue.config.devtools = false;

// Notification in browser
// require('./notify')();
require('./app')(Vue, io);
