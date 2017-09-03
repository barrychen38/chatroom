// Import from npm package
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const uuid = require('uuid');

// Create server for Socket.io
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

// Routes
const chat = require('./routes/chat');
const upload = require('./routes/upload');
const message = require('./routes/message');

const msgCollection = [];

/* -------- Socket.io Chat -------- */
let personCount = 0
io.on('connection', (socket) => {

	personCount += 1;

	if (personCount === 1) {
		msgCollection.length = 0;
	}

	socket.user = null;

	socket.on('online', () => {
		io.emit('online', personCount);
	});

	socket.on('user join', (userInfo) => {

		socket.user = userInfo.user;
		socket.chatId = userInfo.chatId ? userInfo.chatId : uuid.v1({msec: new Date().getTime()});
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

	socket.on('chat', (msgItem) => {
		// Ensure your message
		msgItem.chatId = socket.chatId;
		io.emit('chat', msgItem);

		msgCollection.push(msgItem);
		if (msgCollection.length === 100) {
			msgCollection.splice(0, 90);
		}

	});

	socket.on('send image', (imgItem) => {

		io.emit('send image', imgItem);

		let text = imgItem.image;
		let dataCopy = Object.assign({}, imgItem);
		Reflect.deleteProperty(dataCopy, 'image');
		dataCopy.text = text;

		msgCollection.push(imgItem);
		if (msgCollection.length === 100) {
			msgCollection.splice(0, 90);
		}

	});

	socket.on('disconnect', () => {
		personCount -= 1;
		if (!personCount) {
			message.save(msgCollection);
		}
		if (socket.user !== null) {
			socket.broadcast.emit('offline', {
				count: personCount,
				user: socket.user
			});
		}
	});
});

/* -------- Express App -------- */
const PORT = process.env.PORT || 2261;

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
app.use(bodyParser.json({limit: 1024 * 1024 * 2}));
app.use(bodyParser.urlencoded({
	extended: true,
	limit: 1024 * 1024 * 2
}));
app.use(chat);
app.use(upload);
app.use(message);

// Start server
server.listen(PORT, () => {
	console.log(`Server is running at 127.0.0.1:${PORT}`);
});
