const express = require('express');
const mongoose = require('../mongo/db');

const router = express.Router();

router.use((req, res, next) => {

	res.setHeader('Content-Type', 'application/json');
	next();

});

const schema = new mongoose.Schema({
	chatId: String,
	user: String,
	text: String
});

const Message = mongoose.model('Message', schema);

/**
 * Get the last 10 messages
 */
router.get('/messages', (req, res) => {

	Message
		.find()
		.select('-__v -_id')
		.exec((err, message) => {
			if (err) {
				throw new Error(err);
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
			throw new Error(err);
		}
		msgItems.forEach((item) => {
			const message = new Message(item);
			message.save();
		});
	});
}

module.exports = router;
