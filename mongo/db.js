let mongoose = require('mongoose');

// Remote mLab db server URI
let DB_URI = 'mongodb://ds149603.mlab.com:49603/heroku_tnl8bl0x';
// Local test db server URI
// let DB_URI = 'mongodb://localhost/heroku_tnl8bl0x';

let options = {
	// Heroku add-on mLab auth
	user: 'heroku_tnl8bl0x',
	pass: 'dv05toqtjsntfqoo010tsina4b',
	useMongoClient: true
}

let db = mongoose.connect(DB_URI, options, (err) => {
	if (err) {
		return err;
	}
	console.log('>>> we are in.');
});

module.exports = mongoose;
