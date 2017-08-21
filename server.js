// Import from npm package
let express = require('express');
let http = require('http');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

// Create server for Socket.io
let app = express();
let server = http.createServer(app);
let io = require('socket.io')(server);

// Routes
let chat = require('./routes/chat');
let upload = require('./routes/upload');

/*-------- Socket.io Chat --------*/
let personCount = 0
io.on('connection', (socket) => {
	personCount++;

	socket.user = null;

	socket.on('chat', (data) => {
		io.emit('chat', data);
	});

	socket.on('online', () => {
		io.emit('online', personCount);
	});

	socket.on('user join', (username) => {
		socket.user = username;
		io.emit('user join', username);
	});

	socket.on('send image', (data) => {
		io.emit('send image', data);
	});

	socket.on('disconnect', () => {
		personCount--;
		// console.log('online people: ' + personCount);
		if (socket.user !== null) {
			io.emit('offline', {
				count: personCount,
				username: socket.user
			});
		}
	});
});

/*-------- Express App --------*/
let PORT = process.env.PORT || 2261;

app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
	res.header("Access-Control-Allow-Methods", "GET,POST");
	next();
});

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
// Use middlewares
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: 1024*1024*2}));
app.use(bodyParser.urlencoded({extended: true, limit: 1024*1024*2}));
app.use(chat);
app.use(upload);

// Start server
server.listen(PORT, () => {
	console.log(`Server is running at 127.0.0.1:${PORT}`);
});
