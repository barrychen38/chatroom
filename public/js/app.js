var Vue = require('../vendor/vue.min');
var io = require('socket.io-client');

var emoji = require('./emoji');
var util = require('./util');
var service = require('./service');

module.exports = function() {

	Vue.config.devtools = false;

	var emojiLength = emoji.names.length;

	var socket = io(),
			chatId,
			user,
			yourNickname,
			hasHistoryMsg = false;

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
			chatId = util.getItem('chatId');
			user = util.getItem('user');

			var self = this;
			self.isGettingMsg = true;
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
						self.contents.push(
							{
								isJoinShow: true,
								text: 'History Messages'
							}
						);
						hasHistoryMsg = false;
					}

					self.isGettingMsg = false;
				})
				.catch(function(error) {
					self.isGettingMsg = false;
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
						chatId: util.getItem('chatId')
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
				var self = this,
						showTimer;
				clearTimeout(showTimer);
				self.isInfoShow = true;
				self.info = infoMsg;
				showTimer = setTimeout(function() {
					self.isInfoShow = false;
				}, 1000);
			},

			sendMessage: function(event) {
				var transformMessage = checkMessage(this.typeMessage);
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

			sendImage: function(event) {
				var self = this,
						_file,
						_val,
						_target = event.target;
				_target.onchange = function() {
					_val = this.value;
					_file = this.files[0];
					if (!_file.type.match(/(jpg|jpeg|png|gif)/g)) {
						self.showInfo('Please choose an Image.');
						_val = '';
						return;
					}
					if (_file.size > util.MAX_IMAGE_SIZE) {
						self.showInfo('Please choose an image less than 2MB.');
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
			util.smoothScroll();
		});

	});

	// Set chatId
	socket.on('set uuid', function(userInfo) {
		if (!util.getItem('chatId')) {
			util.setItem('chatId', userInfo.chatId);
			chatId = userInfo.chatId;
		}
		util.setItem('user', userInfo.user);
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
			util.smoothScroll();
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

		util.preloadImage(imgItem.image, function() {
			showMsg(imgItem);
		});

	});

	function showMsg(item, showAlert) {

		var msgItem = checkUser(item, showAlert);

		Chat.contents.push(msgItem);
		Vue.nextTick(function() {
			util.smoothScroll();
		});
	}

	/**
	 * Check user to identify who you are
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
				transformText = checkMessage(item.text);
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
				util.alertMessage(_people, item.text);
			}
			transformText = checkMessage(item.text);
			msgItem.text = transformText + '<dt>' + _people + '</dt>';
			return msgItem;

		}

		// Send image
		if (showAlert) {
			util.alertMessage(_people, 'Send a photo in Group Chat.');
		}
		msgItem.text = '<img src="' + item.image + '"><dt>' + _people + '</dt>';
		return msgItem;
	}

	/**
	 * Check and filter the message
	 */
	function checkMessage(msg) {
		var message = msg,
				emojis = message.match(/\[[a-z_]+\]/g);
		if (message.indexOf('<') !== -1) {
			message = message.replace(/</g, '&lt;');
		}
		if (message.indexOf('>') !== -1) {
			message = message.replace(/>/g, '&gt;');
		}
		if (message.indexOf('\n') !== -1 && message.match(/\n/g).length === message.length) {
			message = message.replace(/\n/g, '');
		}
		if (emojis !== null) {
			var i = 0,
					len = emojis.length,
					emojiName;
			for (; i < len; i++) {
				emojiName = util.getEmojiName(emojis[i]);
				if (emoji.inputNames.indexOf(emojiName) !== -1) {
					message = message.replace(emojis[i], '<i class="em em-' + emojis[i].match(/[a-z_]+/g)[0] + '"></i>');
				}
			}
		}
		return message;
	}

}
