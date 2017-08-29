// Import from npm package
let express = require('express');
let http = require('http');
let path = require('path');
let bodyParser = require('body-parser');
let uuid = require('uuid');

// Create server for Socket.io
let app = express();
let server = http.createServer(app);
let io = require('socket.io')(server);

// Routes
let chat = require('./routes/chat');
let upload = require('./routes/upload');
let message = require('./routes/message');

let msgCollection = [];

/*-------- Socket.io Chat --------*/
let personCount = 0
io.on('connection', (socket) => {

	personCount++;

	if (personCount === 1) {
		msgCollection.length = 0;
	}

	socket.user = null;

	socket.on('online', () => {
		io.emit('online', personCount);
	});

	socket.on('user join', (data) => {

		socket.user = data.user;
		socket.chatId = data.chatId ? data.chatId : uuid.v1({msec: new Date().getTime()});
		// Broadcast your join message
		socket.broadcast.emit('user join', {
			user: socket.user
		});
		// Send individual chatId
		io.to(socket.id).emit('set uuid', {
			user: socket.user,
			chatId: socket.chatId
		});

	});

	socket.on('chat', (data) => {
		// Ensure your message
		data.chatId = socket.chatId;
		io.emit('chat', data);

		msgCollection.push(data);
		if (msgCollection.length === 100) {
			msgCollection.splice(0, 90);
		}

	});

	socket.on('send image', (data) => {

		io.emit('send image', data);

		let text = data.image;
		let dataCopy = Object.assign({}, data);
		delete dataCopy.image;
		dataCopy.text = text;

		msgCollection.push(data);
		if (msgCollection.length === 100) {
			msgCollection.splice(0, 90);
		}

	});

	socket.on('disconnect', () => {
		personCount--;
		if (!personCount) {
			message.save(msgCollection);
		}
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
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
	res.header('Access-Control-Allow-Methods', 'GET,POST');
	next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// Use middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: 1024 * 1024 * 2 }));
app.use(bodyParser.urlencoded({ extended: true, limit: 1024 * 1024 * 2 }));
app.use(chat);
app.use(upload);
app.use(message);

// Start server
server.listen(PORT, () => {
	console.log(`Server is running at 127.0.0.1:${PORT}`);
});
