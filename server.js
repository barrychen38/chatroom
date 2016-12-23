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
const chat = require('./routes/chat');
// config
const mysql_config = require('./config/config').config;
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
app.use('/chat', chat);
// parse request body
app.use(bodyParser.json({limit: 1024*1024*5}));
app.use(bodyParser.urlencoded({extended: true, limit: 1024*1024*5}));
// apply all
app.all('*', (req, res, next) => {
	// res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET,POST");
	// res.header("Content-Type", "application/json;charset=utf-8");
	next();
});
// chat
let p_count = 0,
	phone_count;
io.on('connection', socket => {
	p_count++;
	// console.log('online people: ' + p_count);
	
	socket.user = null;
	
	socket.on('chat', data => {
		io.emit('chat', data);
	});
	
	socket.on('online', () => {
		io.emit('online', p_count);
	});
	
	socket.on('user join', username => {
		socket.user = username;
		io.emit('user join', username);
	});
	
	socket.on('shake', shake => {
		io.emit('shake', shake);
	});
	
	socket.on('send image', data => {
		io.emit('send image', data);
	});
	
	socket.on('pshake', data => {
		io.emit('pshake', data);
	});
	
	socket.on('disconnect', () => {
		p_count--;
		// console.log('online people: ' + p_count);
		if (socket.user !== null) {
			io.emit('offline', {
				count: p_count,
				username: socket.user
			});
		}
	});
});
// save image return to client
app.post('/upload_image', (req, res) => {
	let r = req.body,
		data = null;
	let ext = r.file.substr(0, 22).match(/(jpg|jpeg|png|gif)/)[0],
		file = r.file.substr(22);
	let file_name = uuid.v1({msec: new Date().getTime()}) + '.' + ext;
	
	fs.writeFile('public/upload/' + file_name, new Buffer(file, 'base64'), err => {
		if (err) {
			data = JSON.stringify({readyState: 0, msg: 'Upload failed.'});
		}
		data = JSON.stringify({readyState: 1, img_url: '/upload/' + file_name});
		res.send(data);
	});
});
// run server
server.listen(PORT, () => {
	console.log('Server is running at 127.0.0.1:' + PORT);
});