var express = require('express');

var router = express.Router();

router.get('/', function(req, res) {
	res.render('register', {
		title: 'register'
	});
});

module.exports = router;