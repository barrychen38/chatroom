let express = require('express');
let mongoose = require('mongoose');

let router = express.Router();
let URL = '/messages';
let DB_URI = 'mongodb://localhost/heroku_tnl8bl0x';

router.use((req, res, next) => {

	res.setHeader('Content-Type', 'application/json');
	next();

});

let db = mongoose.connect(DB_URI, {
	useMongoClient: true
});

db.then(() => {
	console.log('\033[42m>>> we are in. <<<\033[0m');
}, (error) => {
	console.error(error);
});

let schema = new mongoose.Schema({
	uuid: String,
	username: String,
	text: String
});

let Message = mongoose.model('Message', schema);

/**
 * Get the last 10 messages
 */
router.get(URL, (req, res) => {

	Message
		.find()
		.select('-__v -_id')
		.exec((err, message) => {
			if (err) {
				return err;
			}
			res.json(message);
		});

});

/**
 * Save the last 10 message
 */
router.save = () => {

}

module.exports = router;
