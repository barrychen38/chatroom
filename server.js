// core module
var path = require('path');

var express = require('express'),
	bodyParser = require('body-parser'),
	ejs = require('ejs'),
	mysql = require('mysql'),
	favicon = require('serve-favicon');

// file module
var list = require('./routes/list'),
	login = require('./routes/login'),
	config = require('./config/config').config;

var port = process.env.PORT || 3000;

var app = express();

app.engine('html', ejs.__express);
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'html');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname + '/public')));

app.use('/list', list);
app.use('/login', login);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// get info
app.post('/getInfo', function(req, res) {
	var request = req.body;
	var info_db = mysql.createConnection(config);
	info_db.connect();
	info_db.query('SELECT * FROM user', function(err, rows) {
		
	});
});

// login
app.post('/loginConfirm', function(req, res) {
	var request = req.body;
	var login_db = mysql.createConnection(config);
	login_db.connect();
	login_db.query('SELECT * FROM user WHERE email = ?', [
		request.name
	], function(err, rows) {
		// if (err) {
		// 	console.error(err);
		// 	return;
		// }
		if (rows.length) {
			// console.log(rows);
			if(rows[0].pwd === request.password) {
				res.send(JSON.stringify({result: 1}));
			} else {
				res.send(JSON.stringify({result: 0}));
			}
		}
	});
	login_db.end();
});

app.listen(port, function() {
	console.log('Server is running at 127.0.0.1:' + port);
});



// console.log(path.join(__dirname + '/public'));