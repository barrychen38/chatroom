var Vue = require('../vendor/vue');
var io = require('socket.io-client');

var emoji = require('./emoji');
var helper = require('./helper');
var service = require('./service');

module.exports = function() {

	Vue.config.devtools = false;

	// Check notification
	if ('Notification' in window) {
		window.Notification.requestPermission();
		var checkPermission = window.Notification.permission;
	}

	var emojiLength = emoji.names.length;

	var socket = io(),
			chatId,
			user,
			yourNickname,
			hasHistoryMsg = false,
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
				this.checkNickname(this.nickname);
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
			service.getLatestMsg()
				.then(function(response) {
					if (response.data.length) {
						hasHistoryMsg = true;
						var msgLength = response.data.length;
						for (var i = 0; i < msgLength; i++) {
							showMsg(response.data[i], false);
						}
					}

					// If history message, show the tip
					if (hasHistoryMsg) {
						_this.contents.push(
							{
								isJoinShow: true,
								text: '-------- History Message --------'
							}
						);
						hasHistoryMsg = false;
					}

					_this.isGettingMsg = false;
				})
				.catch(function(error) {
					_this.isGettingMsg = false;
					throw new Error(error.message);
				})
		},

		methods: {

			checkNickname: function(nickname) {
				var _len = nickname.length,
						_check = nickname.match(/\s/g);
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

			confirmNickname: function(nickname) {
				if (this.checkNickname(nickname)) {
					yourNickname = nickname;
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

			showInfo: function(infoMsg) {
				var _this = this,
						showTimer;
				clearTimeout(showTimer);
				_this.isInfoShow = true;
				_this.info = infoMsg;
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
					_message = _message.replace(/</g, '&lt;');
				}
				if (_message.indexOf('>') !== -1) {
					_message = _message.replace(/>/g, '&gt;');
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
						_val,
						_target = event.target;
				_target.onchange = function() {
					_val = this.value;
					_file = this.files[0];
					if (!_file.type.match(/(jpg|jpeg|png|gif)/g)) {
						_this.showInfo('Please choose an Image.');
						_val = '';
						return;
					}
					if (_file.size > 1024 * 1024 * 2) {
						_this.showInfo('Please choose an image less than 2MB.');
						_val = '';
						return;
					}
					_target.setAttribute('disabled', 'disabled');
					reader.readAsDataURL(_file);
					reader.onload = function() {
						service.uploadImage(reader.result)
							.then(function(response) {
								if (response.data.readyState === 1) {
									_target.removeAttribute('disabled');
									_val = '';
									socket.emit('send image', {
										image: response.data.image,
										user: yourNickname,
										chatId: chatId
									});
								}
							})
							.catch(function(err) {
								throw new Error(err.message);
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

		Chat.contents.push({
			isJoinShow: true,
			text: data.user + ' join the room.'
		});

		Vue.nextTick(function() {
			Chat.scrollInner();
		});

	});

	// Set chatId
	socket.on('set uuid', function(userInfo) {
		if (!helper.getItem('chatId')) {
			helper.setItem('chatId', userInfo.chatId);
			chatId = userInfo.chatId;
		}
		helper.setItem('user', userInfo.user);
		user = userInfo.user;
	});

	// Offline
	socket.on('offline', function(person) {

		Chat.people = person.count;
		Chat.contents.push({
			isJoinShow: true,
			text: person.user + ' leave the room.'
		});

		Vue.nextTick(function() {
			Chat.scrollInner();
		});

	});

	// Chat
	socket.on('chat', function(msgItem) {

		showMsg(msgItem);
		Chat.typeMessage = '';
		Chat.isEmojisShow = false;

	});

	// Send image
	socket.on('send image', function(imgItem) {

		Chat.isJoinShow = false;

		Chat.preloadImage(imgItem.image, function() {
			showMsg(imgItem);
		});

	});

	function showMsg(item, showAlert) {

		var msgItem = checkUser(item, showAlert);

		Chat.contents.push(msgItem);
		Vue.nextTick(function() {
			Chat.scrollInner();
		});
	}

	/**
	 * Check user
	 */
	function checkUser(item, showAlert) {

		// Default is true
		if (typeof showAlert === 'undefined') {
			showAlert = true;
		}

		var _people = item.user,
				_id =  item.chatId;

		var msgItem = {
			isJoinShow: false,
			isYou: true
		};

		var transformText;

		// It is you
		if (user === _people && chatId === _id) {

			// Send message
			if (item.text) {
				transformText = Chat.checkMessage(item.text);
				msgItem.text = transformText + '<dt>Me</dt>';
				return msgItem;
			}

			// Send image
			msgItem.text = '<img src="' + item.image + '"><dt>Me</dt>';
			return msgItem;

		}

		// It is not you
		msgItem.isYou = false;

		if (item.text) {

			// Send message
			if (showAlert) {
				Chat.alertMessage(_people, item.text);
			}
			transformText = Chat.checkMessage(item.text);
			msgItem.text = transformText + '<dt>' + _people + '</dt>';
			return msgItem;

		}

		// Send image
		if (showAlert) {
			Chat.alertMessage(_people, 'Send a photo in Group Chat.');
		}
		msgItem.text = '<img src="' + item.image + '"><dt>' + _people + '</dt>';
		return msgItem;

	}

	// For test
	return Chat;

}
