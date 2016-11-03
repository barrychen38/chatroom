// modules
var express = require('express'),
	http = require('http'),
	bodyParser = require('body-parser'),
	ejs = require('ejs'),
	mysql = require('mysql'),
	favicon = require('serve-favicon');
// routes
var login = require('./routes/login'),
	register = require('./routes/register'),
	chat = require('./routes/chat');
// config
var mysql_config = require('./config/config').config;
// utils
var errMsg = require('./utils/errmsg'),
	sqlQuery = require('./utils/query');
// port
var port = process.env.PORT || 3000;
// server
var app = express(),
	server = http.createServer(app),
	io = require('socket.io')(server);
// engine
app.engine('html', ejs.__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
// favicon
app.use(favicon(__dirname + '/public/favicon.ico'));
// static files
app.use(express.static(__dirname + '/public'));
// use routes
app.use('/login', login);
app.use('/register', register);
app.use('/chat', chat);
// parse request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// create mysql pool
var pool = mysql.createPool(mysql_config);
// get info
app.get('/getInfo', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (err) {
			res.send(JSON.stringify(errMsg.sql_connect_error));
			return;
		}
		connection.query(sqlQuery.select_user, function(err, rows) {
			if (err) {
				res.send(JSON.stringify(errMsg.sql_select_error));
				return;
			}
			res.send(JSON.stringify({result: 1, data: rows}));
			connection.release();
		});
	});
});
// login
app.post('/loginConfirm', function(req, res) {
	var request = req.body;
	pool.getConnection(function(err, connection) {
		if (err) {
			res.send(JSON.stringify(errMsg.sql_connect_error));
			return;
		}
		connection.query(sqlQuery.select_user_where_email, [request.name], function(err, rows) {
			if (err) {
				res.send(JSON.stringify(errMsg.sql_select_error));
				return;
			}
			if (rows.length) {
				if (rows[0].pwd === request.password) {
					res.send(JSON.stringify({result: 1}));
				} else {
					res.send(JSON.stringify({result: 3}));
				}
			} else {
				res.send(JSON.stringify({result: 2}));
			}
			connection.release();
		});
	});
});
// register
app.post('/register', function(req, res) {
	var request = req.body,
		values = [request.name, request.mobile, request.password, request.email, request.uid];
	pool.getConnection(function(err, connection) {
		if (err) {
			res.send(JSON.stringify(errMsg.sql_connect_error));
			return;
		}
		connection.query('SELECT mobile,email FROM user WHERE uid = ?', [request.uid], function(err, rows) {
			if (rows.length) {
				connection.query('UPDATE user SET name = ?, mobile = ?, pwd = ?, email = ? WHERE uid = ?', values, function(err, results) {
					if (err) {
						res.send(JSON.stringify(errMsg.sql_update_error));
						return;
					}
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
// chat
var p_count = 0;
io.on('connection', function(socket) {
	p_count++;
	console.log('online people: ' + p_count);
	socket.on('chat', function(data) {
		io.emit('chat', data);
	});
	socket.on('online', function() {
		io.emit('online', p_count);
	});
	// socket.on('offline', function(people) {
	// 	io.emit('offline', people);
	// });
	socket.on('shake', function(shake) {
		io.emit('shake', shake);
	});
	socket.on('disconnect', function() {
		p_count--;
		if (p_count === 0) {
			io.emit('save_chat');
		}
		console.log('online people: ' + p_count);
		io.emit('offline', p_count);
	});
});
// get chat history
app.get('/get_chat_history', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (err) {
			res.send(JSON.stringify(errMsg.sql_connect_error));
			return;
		}
		connection.query(sqlQuery.select_save_chat, function(err, rows) {
			if (err) {
				res.send(JSON.stringify(errMsg.sql_select_error));
				return;
			}
			res.send(JSON.stringify({result: 1, data: rows}));
			connection.release();
		});
	});
	
});
// save chat
app.post('/save_chat', function(req, res) {
	
});
// run server
server.listen(port, function() {
	console.log('Server is running at 127.0.0.1:' + port);
});