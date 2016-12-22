!function(root) {
	
	// ask sure to leave
	window.onbeforeunload = function() {
		return 1;
	}
	
	// check notification
	if ('Notification' in window) {
		var permission = window.Notification.requestPermission(),
			checkPermission = window.Notification.permission;
	}
	
	// define emojis
	var emoji_name = ['em em-angry', 'em em-anguished', 'em em-astonished', 'em em-blush', 'em em-cold_sweat', 'em em-confounded', 'em em-confused', 'em em-cry', 'em em-disappointed', 'em em-disappointed_relieved', 'em em-dizzy_face', 'em em-expressionless', 'em em-fearful', 'em em-flushed', 'em em-frowning', 'em em-grimacing', 'em em-grin', 'em em-grinning', 'em em-heart_eyes', 'em em-hushed', 'em em-innocent', 'em em-joy', 'em em-kissing_heart', 'em em-laughing', 'em em-neutral_face', 'em em-no_mouth', 'em em-open_mouth', 'em em-scream', 'em em-pensive', 'em em-persevere', 'em em-relaxed', 'em em-satisfied', 'em em-smile', 'em em-sleepy', 'em em-smirk', 'em em-sob', 'em em-stuck_out_tongue_closed_eyes', 'em em-sunglasses', 'em em-sweat_smile', 'em em-tired_face', 'em em-yum', 'em em-mask', 'em em-boy', 'em em-alien', 'em em-clap', 'em em-facepunch', 'em em-girl', 'em em-imp', 'em em-monkey_face', 'em em-octocat', 'em em-rage', 'em em-see_no_evil', 'em em-smiling_imp', 'em em-speak_no_evil', 'em em-thumbsup', 'em em-thumbsdown', 'em em-v', 'em em-trollface', 'em em-dog', 'em em-broken_heart'],
		emoji_input_name = ['angry', 'anguished', 'astonished', 'blush', 'cold_sweat', 'confounded', 'confused', 'cry', 'disappointed', 'disappointed_relieved', 'dizzy_face', 'expressionless', 'fearful', 'flushed', 'frowning', 'grimacing', 'grin', 'grinning', 'heart_eyes', 'hushed', 'innocent', 'joy', 'kissing_heart', 'laughing', 'neutral_face', 'no_mouth', 'open_mouth', 'scream', 'pensive', 'persevere', 'relaxed', 'satisfied', 'smile', 'sleepy', 'smirk', 'sob', 'stuck_out_tongue_closed_eyes', 'sunglasses', 'sweat_smile', 'tired_face', 'yum', 'mask', 'boy', 'alien', 'clap', 'facepunch', 'girl', 'imp', 'monkey_face', 'octocat', 'rage', 'see_no_evil', 'smiling_imp', 'speak_no_evil', 'thumbsup', 'thumbsdown', 'v', 'trollface', 'dog', 'broken_heart'],
		emoji_len = emoji_name.length;
	
	var socket = io(),
		uuid,
		your_nickname,
		your_old_name,
		MAX_WINDOW_HEIGHT = 380;
	
	var reader = new FileReader();
	
	// Vue.component('msg-list', {
	// 	template: '#msg-template',
	// 	props: ['contents']
	// });
	
	Vue.config.devtools = true;
	
	var App = new Vue({
		el: '#app',
		// components:
		data: {
			isNicknameShow: true,
			isWarnShow: true,
			nickname: '',
			confirmResult: '',
			isEmojisShow: false,
			isInfoShow: false,
			animateObject: {
				animated: false,
				shake: false
			},
			emojis: [],
			people: 0,
			rightClass: 'right',
			leftClass: 'left',
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
			for (var i = 0; i < emoji_len; i++) {
				this.emojis.push({
					className: emoji_name[i],
					title: emoji_input_name[i]
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
					your_nickname = this.nickname;
					this.isNicknameShow = false;
					uuid = UUID.generate();
					socket.emit('user join', your_nickname);
					// save now your name to recover msg
					if (!localStorage.getItem('nickname')) {
						localStorage.setItem('nickname', your_nickname + '_' + uuid);
						your_old_name = your_nickname;
					} else {
						your_old_name = localStorage.getItem('nickname');
						localStorage.setItem('nickname', your_nickname + '_' + uuid);
					}
					console.log('your_old_nickname: ' + your_old_name + '\nyour_nickname: ' + your_nickname);
					if (!location.hash) {
						location.href += '#nickname=' + your_nickname + '_' + uuid;
					} else {
						location.href = location.origin + location.pathname + '#nickname=' + your_nickname + '_' + uuid;
					}
				}
			},
			showEmojisTable: function(event) {
				if (!this.isEmojisShow && event.target.className !== 'em all')
					return false;
				this.isEmojisShow = !this.isEmojisShow;
			},
			chooseEmoji: function(index) {
				this.typeMessage += '[' + emoji_input_name[index] + ']';
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
			shakeWindow: function() {
				socket.emit('shake', this.nickname);
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
						emoji_name;
					for (; i < len; i++) {
						emoji_name = this.getEmojiName(emojis[i]);
						if (emoji_input_name.indexOf(emoji_name) !== -1) {
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
					people: your_nickname + '_' + uuid
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
					if (_file.size > 1024*1024*5) {
						_this.showInfo('Please choose an Image less than 5MB.');
						val = '';
						return;
					}
					_target.setAttribute('disabled', 'disabled');
					reader.readAsDataURL(_file);
					reader.onload = function() {
						axios.post('/upload_image', {
							file: this.result
						}).then(function(response) {
							if (response.data.readyState === 1) {
								_target.removeAttribute('disabled');
								val = '';
								socket.emit('send image', {
									img_url: response.data.img_url,
									people: your_nickname + '_' + uuid
								});
							}
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
		},
		computed: {
			
		}
	});
	
	// online
	socket.emit('online');
	socket.on('online', function(people) {
		App.people = people;
	});
	
	// user join
	socket.on('user join', function(username) {
		App.contents.push({
			isJoinShow: true,
			nickname: username + ' join the group chat.'
		});
		Vue.nextTick(function() {
			App.scrollInner();
		});
	});
	
	// offline
	socket.on('offline', function(people) {
		App.people = people.count;
		App.contents.push({
			isJoinShow: true,
			nickname: people.username + ' leave the group chat.'
		});
		Vue.nextTick(function() {
			App.scrollInner();
		});
	});
	
	// shake window
	var _wrapper = document.querySelector('.wrapper');
	socket.on('shake', function(people) {
		App.animateObject.animated = true;
		App.animateObject.shake = true;
		App.showInfo(people + ' SHAKED.');
	});
	_wrapper.addEventListener('animationend', function() {
		App.animateObject.animated = false;
		App.animateObject.shake = false;
	}, false);
	
	// chat
	socket.on('chat', function(data) {
		var _people = data.people.split('_'),
			_msg = data.msg,
			_msg_obj = null;
		if (App.nickname === _people[0] && uuid === _people[1]) { // is you
			_msg = App.checkMessage(_msg);
			_msg_obj = {
				isJoinShow: false,
				msg: _msg + '<dt>Me</dt>',
				isYou: true
			}
		} else { // not you
			App.alertMessage(_people[0], _msg);
			_msg = App.checkMessage(_msg);
			_msg_obj = {
				isJoinShow: false,
				msg: _msg + '<dt>' + _people[0] + '</dt>',
				isYou: false
			}
		}
		App.contents.push(_msg_obj);
		Vue.nextTick(function() {
			App.scrollInner();
		});
		App.typeMessage = '';
		App.isEmojisShow = false;
	});
	
	// send image
	socket.on('send image', function(data) {
		var _people = data.people.split('_'),
			_img_url = data.img_url,
			_img_obj = null;
		App.isJoinShow = false;
		if (App.nickname === _people[0] && uuid === _people[1]) { // is you
			_img_obj = {
				isJoinShow: false,
				msg: '<img src="' + _img_url + '"><dt>Me</dt>',
				isYou: true
			}
		} else {
			App.alertMessage(_people[0], 'Send a photo in Group Chat.');
			_img_obj = {
				isJoinShow: false,
				msg: '<img src="' + _img_url + '"><dt>' + _people[0] + '</dt>',
				isYou: false
			}
		}
		App.preloadImage(_img_url, function() {
			App.contents.push(_img_obj);
			Vue.nextTick(function() {
				App.scrollInner();
			});
		});
	});
	
}(this);