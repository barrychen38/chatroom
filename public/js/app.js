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
		uuid,
		yourNickname,
		yourOldName,
		MAX_WINDOW_HEIGHT = 380;

	var reader = new FileReader();

	var Chat = new Vue({

		el: '#app',

		data: {
			isNicknameShow: true,
			isWarnShow: true,
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
					uuid = 'sdfsfafd';
					socket.emit('user join', yourNickname);
					// save now your name to recover msg
					if (!helper.getItem('uuid')) {
						helper.setItem('uuid', uuid);
						yourOldName = yourNickname;
					} else {
						yourOldName = helper.getItem('uuid');
						helper.setItem('uuid', uuid);
					}
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
					people: yourNickname + '-' + uuid
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
										people: yourNickname + '-' + uuid
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
				var $scroller = document.querySelector('.inner'),
					diffHeight = $scroller.scrollHeight - MAX_WINDOW_HEIGHT;
				if (diffHeight <= 0) return;
				$scroller.scrollTop = diffHeight;
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

	// online
	socket.emit('online');
	socket.on('online', function(people) {
		Chat.people = people;
	});

	// user join
	socket.on('user join', function(username) {

		Chat.contents.push({
			isJoinShow: true,
			nickname: username + ' join the group chat.'
		});

		Vue.nextTick(function() {
			Chat.scrollInner();
		});

	});

	// offline
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

	// chat
	socket.on('chat', function(data) {

		var _people = data.people.split('-'),
			_msg = data.msg,
			_msg_obj = null;

		// is yourself
		if (Chat.nickname === _people[0] && uuid === _people[1]) {
			_msg = Chat.checkMessage(_msg);
			_msg_obj = {
				isJoinShow: false,
				msg: _msg + '<dt>Me</dt>',
				isYou: true
			}
		// someone else
		} else {
			Chat.alertMessage(_people[0], _msg);
			_msg = Chat.checkMessage(_msg);
			_msg_obj = {
				isJoinShow: false,
				msg: _msg + '<dt>' + _people[0] + '</dt>',
				isYou: false
			}
		}

		Chat.contents.push(_msg_obj);
		Vue.nextTick(function() {
			Chat.scrollInner();
		});
		Chat.typeMessage = '';
		Chat.isEmojisShow = false;

	});

	// send image
	socket.on('send image', function(data) {

		var _people = data.people.split('-'),
			_imgUrl = data.imgUrl,
			_img_obj = null;

		Chat.isJoinShow = false;

		if (Chat.nickname === _people[0] && uuid === _people[1]) { // is you
			_img_obj = {
				isJoinShow: false,
				msg: '<img src="' + _imgUrl + '"><dt>Me</dt>',
				isYou: true
			}
		} else {
			Chat.alertMessage(_people[0], 'Send a photo in Group Chat.');
			_img_obj = {
				isJoinShow: false,
				msg: '<img src="' + _imgUrl + '"><dt>' + _people[0] + '</dt>',
				isYou: false
			}
		}


		Chat.preloadImage(_imgUrl, function() {
			Chat.contents.push(_img_obj);
			Vue.nextTick(function() {
				Chat.scrollInner();
			});
		});

	});

}
