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
		id,
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
			people: 0,
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
			var _this = this;
			_this.isGettingMsg = true;
			service.getLastestMsg()
				.then(function(response) {
					if (response.data) {
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
					this.confirmResult = 'Nickname cannot be all spaces';
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
						username: yourNickname,
						id: helper.getItem('id')
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
					this.showInfo('Cannot send blank message.');
					return;
				}
				socket.emit('chat', {
					msg: this.typeMessage,
					people: yourNickname,
					id: id
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
										imgUrl: response.data.imgUrl,
										people: yourNickname,
										id: id
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
	socket.on('online', function(people) {
		Chat.people = people;
	});

	// User join
	socket.on('user join', function(data) {

		helper.setItem('id', data.id);
		id = data.id;

		Chat.contents.push({
			isJoinShow: true,
			nickname: data.username + ' join the group chat.'
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
			nickname: people.username + ' leave the group chat.'
		});

		Vue.nextTick(function() {
			Chat.scrollInner();
		});

	});

	// Chat
	socket.on('chat', function(data) {

		var msgItem = checkUser(data);

		Chat.contents.push(msgItem);
		Vue.nextTick(function() {
			Chat.scrollInner();
		});
		Chat.typeMessage = '';
		Chat.isEmojisShow = false;

	});

	// Send image
	socket.on('send image', function(data) {

		Chat.isJoinShow = false;

		var msgItem = checkUser(data);

		Chat.preloadImage(data.imgUrl, function() {
			Chat.contents.push(msgItem);
			Vue.nextTick(function() {
				Chat.scrollInner();
			});
		});

	});

	/**
	 * Check user
	 */
	function checkUser(data) {

		var _people = data.people,
				_id = data.id;

		var msgItem = {
			isJoinShow: false,
			isYou: true
		};

		var transformMsg;

		// It is you
		if (Chat.nickname === _people && id === _id) {

			// Send message
			if (data.msg) {
				transformMsg = Chat.checkMessage(data.msg);
				msgItem.msg = transformMsg + '<dt>Me</dt>';
				return msgItem;
			}

			// Send image
			msgItem.msg = '<img src="' + data.imgUrl + '"><dt>Me</dt>';
			return msgItem;

		}

		// It is not you
		msgItem.isYou = false;

		if (data.msg) {

			// Send message
			Chat.alertMessage(_people, data.msg);
			transformMsg = Chat.checkMessage(data.msg);
			msgItem.msg = transformMsg + '<dt>' + _people + '</dt>';
			return msgItem;

		}

		// Send image
		Chat.alertMessage(_people, 'Send a photo in Group Chat.');
		msgItem.msg = '<img src="' + data.imgUrl + '"><dt>' + _people + '</dt>';
		return msgItem;

	}

}
