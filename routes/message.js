let express = require('express');
let mongoose = require('../mongo/db');

let router = express.Router();

router.use((req, res, next) => {

	res.setHeader('Content-Type', 'application/json');
	next();

});

let schema = new mongoose.Schema({
	chatId: String,
	user: String,
	text: String
});

let Message = mongoose.model('Message', schema);

/**
 * Get the last 10 messages
 */
router.get('/messages', (req, res) => {

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
router.save = (msgItems) => {
	Message.remove({}, (err) => {
		if (err) {
			return err;
		}
		msgItems.forEach((item) => {
			let message = new Message(item);
			message.save();
		});
	});
}

module.exports = router;
