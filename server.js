// modules
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const pug = require('pug');
const mysql = require('mysql');
const favicon = require('serve-favicon');
const uuid = require('uuid');
const fs = require('fs');
// routes
const phone_shake = require('./routes/phone_shake');
const chat = require('./routes/chat');
// config
const mysql_config = require('./config/config').config;
// utils
const errMsg = require('./utils/errmsg');
const sqlQuery = require('./utils/query');
// port
const PORT = process.env.PORT || 2261;
// server
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
// engine
// app.engine('html', ejs.__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
// favicon
app.use(favicon(__dirname + '/public/favicon.ico'));
// static files
app.use(express.static(__dirname + '/public'));
// use routes
app.use('/phone_shake', phone_shake);
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
let pool = mysql.createPool(mysql_config);
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
	let request = req.body;
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
	let request = req.body,
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
let p_count = 0,
	phone_count,
	user_names = [];
io.on('connection', (socket) => {
	p_count++;
	// console.log('online people: ' + p_count);
	
	socket.on('chat', (data) => {
		io.emit('chat', data);
	});
	
	socket.on('online', ()=> {
		io.emit('online', p_count);
	});
	
	socket.on('shake', (shake) => {
		io.emit('shake', shake);
	});
	
	socket.on('send_image', (data) => {
		io.emit('send_image', data);
	});
	
	socket.on('pshake', (data) => {
		io.emit('pshake', data);
	});
	
	socket.on('disconnect', () => {
		p_count--;
		// console.log('online people: ' + p_count);
		io.emit('offline', p_count);
	});
});
// save image return to client
app.post('/upload_image', (req, res) => {
	let r = req.body;
	
	let ext = r.file.substr(0, 22).match(/(jpg|jpeg|png|gif)/)[0],
		file = r.file.substr(22);
	let file_name = uuid.v1({msec: new Date().getTime()}) + '.' + ext;
	
	fs.writeFile('public/upload/' + file_name, new Buffer(file, 'base64'), err => {
		if (err) {
			res.send(JSON.stringify({readyState: 0, msg: 'Upload failed.'}));
			return;
		}
	});
	res.send(JSON.stringify({readyState: 1, img_url: '/upload/' + file_name}));
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
server.listen(PORT, () => {
	console.log('Server is running at 127.0.0.1:' + PORT);
});