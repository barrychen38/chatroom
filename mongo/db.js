let mongoose = require('mongoose');

let DB_URI = 'mongodb://ds149603.mlab.com:49603/heroku_tnl8bl0x';
// let DB_URI = 'mongodb://localhost/heroku_tnl8bl0x';

let options = {
	user: 'heroku_tnl8bl0x',
	pass: 'dv05toqtjsntfqoo010tsina4b',
	useMongoClient: true
}

let db = mongoose.connect(DB_URI, options, (err) => {
	if (err) {
		return err;
	}
	console.log('\033[42m>>> we are in.\033[0m');
});

module.exports = mongoose;
