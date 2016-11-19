// modules
var express = require('express'),
	http = require('http'),
	bodyParser = require('body-parser'),
	ejs = require('ejs'),
	jade = require('jade'),
	mysql = require('mysql'),
	favicon = require('serve-favicon'),
	uuid = require('uuid'),
	fs = require('fs');
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
app.use(bodyParser.json({limit: 1024*1024*5}));
app.use(bodyParser.urlencoded({extended: true, limit: 1024*1024*5}));
// apply all
app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET,POST");
	// res.header("Content-Type", "application/json;charset=utf-8");
	next();
});
// create mysql pool
var pool = mysql.createPool(mysql_config);
// get info
app.get('/getInfo', (req, res) => {
	pool.getConnection((err, connection) => {
		if (err) {
			res.send(JSON.stringify(errMsg.sql_connect_error));
			return;
		}
		connection.query(sqlQuery.select_user, (err, rows) => {
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
app.post('/loginConfirm', (req, res) => {
	var request = req.body;
	pool.getConnection((err, connection) => {
		if (err) {
			res.send(JSON.stringify(errMsg.sql_connect_error));
			return;
		}
		connection.query(sqlQuery.select_user_where_email, [request.name], (err, rows) => {
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
app.post('/register', (req, res) => {
	var request = req.body,
		values = [request.name, request.mobile, request.password, request.email, request.uid];
	pool.getConnection((err, connection) => {
		if (err) {
			res.send(JSON.stringify(errMsg.sql_connect_error));
			return;
		}
		connection.query('SELECT mobile,email FROM user WHERE uid = ?', [request.uid], (err, rows) => {
			if (rows.length) {
				connection.query('UPDATE user SET name = ?, mobile = ?, pwd = ?, email = ? WHERE uid = ?', values, (err, results) => {
					if (err) {
						res.send(JSON.stringify(errMsg.sql_update_error));
						return;
					}
					res.send(JSON.stringify({result: 2}));
					connection.release();
				});
			} else {
				connection.query('INSERT INTO user VALUES(?, ?, ?, ?, ?)', values, (err, result) => {
					res.send(JSON.stringify({result: 1}));
					connection.release();
				});
			}
		});
	});
});
// chat
var p_count = 0;
io.on('connection', (socket) => {
	p_count++;
	console.log('online people: ' + p_count);
	socket.on('chat', (data) => {
		io.emit('chat', data);
	});
	socket.on('online', ()=> {
		io.emit('online', p_count);
	});
	// socket.on('offline', people => {
	// 	io.emit('offline', people);
	// });
	socket.on('shake', shake => {
		io.emit('shake', shake);
	});
	socket.on('send_image', data => {
		io.emit('send_image', data);
	});
	socket.on('disconnect', () => {
		p_count--;
		if (p_count === 0) {
			io.emit('save_chat');
		}
		console.log('online people: ' + p_count);
		io.emit('offline', p_count);
	});
});
// save image return to client
app.post('/upload_image', (req, res) => {
	var r = req.body;
	
	var ext = r.file.substr(0, 22).match(/(jpg|jpeg|png|gif)/)[0],
		file = r.file.substr(22);
	var file_name = uuid.v1({msec: new Date().getTime()}) + '.' + ext;
	
	fs.writeFile('public/upload/' + file_name, new Buffer(file, 'base64'), err => {
		if (err) {
			res.send(JSON.stringify({readState: 0, msg: 'Upload failed.'}));
			return;
		}
	});
	res.send(JSON.stringify({readState: 1, img_url: '/upload/' + file_name}));
});
// get chat history
app.get('/get_chat_history', (req, res) => {
	pool.getConnection((err, connection) => {
		if (err) {
			res.send(JSON.stringify(errMsg.sql_connect_error));
			return;
		}
		connection.query(sqlQuery.select_save_chat, (err, rows) => {
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
app.post('/save_chat', (req, res) => {
	
});
// run server
server.listen(port, () => {
	console.log('Server is running at 127.0.0.1:' + port);
});