var express = require('express');

var router = express.Router();

router.get('/', function(req, res) {
	res.render('phone_shake', {
		title: 'phone_shake'
	});
});

module.exports = router;