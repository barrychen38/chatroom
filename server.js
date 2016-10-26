var express = require('express'),
	bodyParser = require('body-parser'),
	ejs = require('ejs'),
	mysql = require('mysql'),
	favicon = require('serve-favicon'),
	eventproxy = require('eventproxy');

// file module
var login = require('./routes/login'),
	register = require('./routes/register'),
	chat = require('./routes/chat'),
	mysql_config = require('./config/config').config;

var port = process.env.PORT || 3000;

var app = express();

app.engine('html', ejs.__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(__dirname + '/public'));

app.use('/login', login);
app.use('/register', register);
app.use('/chat', chat);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// mysql pool
var pool = mysql.createPool(mysql_config);

// get info
app.post('/getInfo', function(req, res) {
	var request = req.body;
	
});

// login
app.post('/loginConfirm', function(req, res) {
	var request = req.body;
	
});

// register
app.post('/register', function(req, res) {
	var request = req.body,
		values = [request.name, request.mobile, request.password, request.email, request.uid];
	pool.getConnection(function(err, connection) {
		connection.query('SELECT mobile,email FROM user WHERE uid = ?', [request.uid], function(err, rows) {
			if (rows.length) {
				connection.query('UPDATE user SET name = ?, mobile = ?, pwd = ?, email = ? WHERE uid = ?', values, function(err, results) {
					res.send(JSON.stringify({result: 2}));
					connection.release();
				});
			} else {
				connection.query('INSERT INTO user VALUES(?, ?, ?, ?, ?)', values, function(err, result) {
					res.send(JSON.stringify({result: 1}));
					connection.release();
				});
			}
		});
	});
});

app.listen(port, function() {
	console.log('Server is running at 127.0.0.1:' + port);
});