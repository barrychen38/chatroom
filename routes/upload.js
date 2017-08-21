let express = require('express');
let uuid = require('uuid');
let fs = require('fs');

let router = express.Router();

router.post('/upload', (req, res) => {

	res.setHeader('Content-Type', 'application/json');

	let body = req.body,
		data = null;
	let ext = body.file.substr(0, 22).match(/(jpg|jpeg|png|gif)/)[0],
		file = body.file.substr(22);
	let fileName = `${uuid.v1({msec: new Date().getTime()})}.${ext}`;

	fs.writeFile('public/upload/' + fileName, new Buffer(file, 'base64'), (err) => {
		if (err) {
			data = JSON.stringify({readyState: 0, message: 'Upload failed.'});
		} else {
			data = JSON.stringify({readyState: 1, imgUrl: '/upload/' + fileName});
		}
		res.send(data);
	});

});

module.exports = router;
