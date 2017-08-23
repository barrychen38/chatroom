var emoji = require('./emoji');
var helper = require('./helper');
var service = require('./service');

module.exports = function(Vue, io) {

	// Check notification
	if ('Notification' in window) {
		var permission = window.Notification.requestPermission(),
				checkPermission = window.Notification.permission;
	}

	var emojiLength = emoji.names.length;

	var socket = io(),
			chatId,
			user,
			yourNickname,
			MAX_WINDOW_HEIGHT = 380;

	var reader = new FileReader();

	var Chat = new Vue({

		el: '#app',

		data: {
			isNicknameShow: true,
			isWarnShow: true,
			isGettingMsg: false,
			nickname: '',
			confirmResult: '',
			isEmojisShow: false,
			isInfoShow: false,
			emojis: [],
			peopleCount: 0,
			rightMsgClass: 'right',
			leftMsgClass: 'left',
			info: '',
			typeMessage: '',
			contents: []
		},

		watch: {
			nickname: function() {
				this.checkNickname();
			}
		},

		created: function() {
			for (var i = 0; i < emojiLength; i++) {
				this.emojis.push({
					className: emoji.names[i],
					title: emoji.inputNames[i]
				});
			}

		},

		mounted: function() {

			// Get the info first to judge who you are
			chatId = helper.getItem('chatId');
			user = helper.getItem('user');

			var _this = this;
			_this.isGettingMsg = true;
			service.getLastestMsg()
				.then(function(response) {
					if (response.data) {
						var msgLength = response.data.length;
						for (var i = 0; i < msgLength; i++) {
							showMsg(response.data[i], false);
						}
						_this.isGettingMsg = false;
					}
				})
				.catch(function(error) {
					_this.isGettingMsg = false;
					console.error(error.message);
				})
		},

		methods: {

			checkNickname: function() {
				var _len = this.nickname.length,
						_check = this.nickname.match(/\s/g);
				if (!_len) {
					this.confirmResult = 'Please enter a nickname';
					return false;
				}
				if (_check && _check.length === _len) {
					this.confirmResult = 'Nickname can not be all spaces';
					return false;
				}
				this.confirmResult = '';
				return true;
			},

			confirmNickname: function() {
				if (this.checkNickname()) {
					yourNickname = this.nickname;
					this.isNicknameShow = false;
					socket.emit('user join', {
						user: yourNickname,
						chatId: helper.getItem('chatId')
					});
				}
			},

			showEmojisTable: function(event) {
				if (!this.isEmojisShow && event.target.className !== 'em all')
					return false;
				this.isEmojisShow = !this.isEmojisShow;
			},

			chooseEmoji: function(index) {
				this.typeMessage += '[' + emoji.inputNames[index] + ']';
				document.querySelector('.input').focus();
			},

			showInfo: function(info_msg) {
				var _this = this,
						showTimer;
				clearTimeout(showTimer);
				_this.isInfoShow = true;
				_this.info = info_msg;
				showTimer = setTimeout(function() {
					_this.isInfoShow = false;
					// _this.info = '';
				}, 1000);
			},

			getEmojiName: function(emoji) {
				emoji = emoji.replace('[', '');
				emoji = emoji.replace(']', '');
				return emoji;
			},

			checkMessage: function(msg) {
				var _message = msg,
						emojis = _message.match(/\[[a-z_]+\]/g);
				if (_message.indexOf('<') !== -1) {
					_message = _message.replace(/\</g, '&lt;');
				}
				if (_message.indexOf('>') !== -1) {
					_message = _message.replace(/\>/g, '&gt;');
				}
				if (_message.indexOf('\n') !== -1 && _message.match(/\n/g).length === _message.length) {
					_message = _message.replace(/\n/g, '');
				}
				if (emojis !== null) {
					var i = 0,
							len = emojis.length,
							emojiName;
					for (; i < len; i++) {
						emojiName = this.getEmojiName(emojis[i]);
						if (emoji.inputNames.indexOf(emojiName) !== -1) {
							_message = _message.replace(emojis[i], '<i class="em em-' + emojis[i].match(/[a-z_]+/g)[0] + '"></i>');
						}
					}
				}
				return _message;
			},

			sendMessage: function(event) {
				var transformMessage = this.checkMessage(this.typeMessage);
				if (event.ctrlKey) {
					this.typeMessage += '\n';
					return;
				}
				if (transformMessage === '') {
					this.showInfo('Can not send blank message.');
					return;
				}
				socket.emit('chat', {
					text: this.typeMessage,
					user: yourNickname,
					chatId: chatId
				});
			},

			preloadImage: function(src, fn) {
				var image = new Image();
				image.src = src;
				image.onload = function() {
					fn && fn();
				}
			},

			sendImage: function(event) {
				var _this = this,
						_file,
						_target = event.target;
				_target.onchange = function() {
					_file = this.files[0];
					val = this.value;
					if (!_file.type.match(/(jpg|jpeg|png|gif)/g)) {
						_this.showInfo('Please choose an Image.');
						val = '';
						return;
					}
					if (_file.size > 1024 * 1024 * 2) {
						_this.showInfo('Please choose an image less than 2MB.');
						val = '';
						return;
					}
					_target.setAttribute('disabled', 'disabled');
					reader.readAsDataURL(_file);
					reader.onload = function() {
						service.uploadImage(reader.result)
							.then(function(response) {
								if (response.data.readyState === 1) {
									_target.removeAttribute('disabled');
									val = '';
									socket.emit('send image', {
										image: response.data.image,
										user: yourNickname,
										chatId: chatId
									});
								}
							})
							.catch(function(err) {
								console.error(err.message);
							});
					}
				}
			},

			scrollInner: function() {
				var scroller = document.querySelector('.inner'),
						diffHeight = scroller.scrollHeight - MAX_WINDOW_HEIGHT;
				if (diffHeight <= 0) {
					return;
				}
				scroller.scrollTop = diffHeight;
			},

			alertMessage: function(user, body) {
				if (checkPermission === 'granted') {
					var notify = new Notification(user, {
						body: body,
						icon: '/dist/img/notify.png',
						eventTime: 800
					});
				}
			}

		}
	});

	// Online
	socket.emit('online');
	socket.on('online', function(peopleCount) {
		Chat.peopleCount = peopleCount;
	});

	// User join
	socket.on('user join', function(data) {

		helper.setItem('chatId', data.chatId);
		helper.setItem('user', data.user);

		// Set the new info of you
		chatId = data.chatId;
		user = data.user;

		if (Chat.contents.length) {
			Chat.contents.push(
				{
					isJoinShow: true,
					text: 'History Message.'
				}, {
					isJoinShow: true,
					text: '--------------------------------'
				}
			);
		}

		Chat.contents.push({
			isJoinShow: true,
			text: data.user + ' join the group chat.'
		});

		Vue.nextTick(function() {
			Chat.scrollInner();
		});

	});

	// Offline
	socket.on('offline', function(people) {

		Chat.people = people.count;
		Chat.contents.push({
			isJoinShow: true,
			nickname: people.user + ' leave the group chat.'
		});

		Vue.nextTick(function() {
			Chat.scrollInner();
		});

	});

	// Chat
	socket.on('chat', function(data) {

		showMsg(data);
		Chat.typeMessage = '';
		Chat.isEmojisShow = false;

	});

	// Send image
	socket.on('send image', function(data) {

		Chat.isJoinShow = false;

		Chat.preloadImage(data.image, function() {
			showMsg(data);
		});

	});

	function showMsg(data, showAlert) {

		var msgItem = checkUser(data, showAlert);

		Chat.contents.push(msgItem);
		Vue.nextTick(function() {
			Chat.scrollInner();
		});
	}

	/**
	 * Check user
	 */
	function checkUser(data, showAlert) {

		// Default is true
		if (typeof showAlert === 'undefined') {
			showAlert = true;
		}

		var _people = data.user,
				_id =  data.chatId;

		var msgItem = {
			isJoinShow: false,
			isYou: true
		};

		var transformText;

		// It is you
		if (user === _people && chatId === _id) {

			// Send message
			if (data.text) {
				transformText = Chat.checkMessage(data.text);
				msgItem.text = transformText + '<dt>Me</dt>';
				return msgItem;
			}

			// Send image
			msgItem.text = '<img src="' + data.image + '"><dt>Me</dt>';
			return msgItem;

		}

		// It is not you
		msgItem.isYou = false;

		if (data.text) {

			// Send message
			if (showAlert) {
				Chat.alertMessage(_people, data.text);
			}
			transformText = Chat.checkMessage(data.text);
			msgItem.text = transformText + '<dt>' + _people + '</dt>';
			return msgItem;

		}

		// Send image
		if (showAlert) {
			Chat.alertMessage(_people, 'Send a photo in Group Chat.');
		}
		msgItem.text = '<img src="' + data.image + '"><dt>' + _people + '</dt>';
		return msgItem;

	}

}
