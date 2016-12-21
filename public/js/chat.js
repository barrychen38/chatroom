!function(root) {
	
	// navigator to phone page
	if (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Windows Phone)/i)) {
		location.href = '/phone_shake' + location.hash;
		return;
	}
	
	// ask sure to leave
	window.onbeforeunload = function() {
		// return 1;
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
		record_input_emoji_info = 'blank',
		MAX_WINDOW_HEIGHT = document.querySelector('.inner').offsetHeight;
	
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
			isNicknameShow: false,
			isWarnShow: true,
			nickname: 'Barry',
			confirmResult: '',
			isEmojisShow: false,
			isInfoShow: false,
			animateObject: {
				animated: false,
				shake: false
			},
			cts: [],
			people: 0,
			info: '',
			typeMessage: '',
			others: [],
			yours: [],
		},
		watch: {
			nickname: function() {
				this.checkNickname();
			},
			typeMessage: function() {
				this.deleteMessage();
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
				record_input_emoji_info = this.typeMessage;
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
				var _this = this,
					_wrapper = document.querySelector('.wrapper');
				socket.emit('shake', this.nickname);
				socket.on('shake', function(people) {
					_this.animateObject.animated = true;
					_this.animateObject.shake = true;
					_this.showInfo(_this.nickname + ' SHAKED.');
				});
				_wrapper.addEventListener('animationend', function() {
					_this.animateObject.animated = false;
					_this.animateObject.shake = false;
				}, false);
			},
			getEmojiName: function(emoji) {
				emoji = emoji.replace('[', '');
				emoji = emoji.replace(']', '');
				return emoji;
			},
			checkMessage: function(message) {
				var _msg = message,
					emojis = _msg.match(/\[[a-z_]+\]/g);
				if (_msg.indexOf('<') !== -1) {
					_msg = _msg.replace(/\</g, '&lt;');
				}
				if (_msg.indexOf('>') !== -1) {
					_msg = _msg.replace(/\>/g, '&gt;');
				}
				if (_msg.indexOf('\n') !== -1 && _msg.match(/\n/g).length === _msg.length) {
					_msg = _msg.replace(/\n/g, '');
				}
				if (emojis !== null) {
					var i = 0,
						len = emojis.length,
						emoji_name;
					for (; i < len; i++) {
						emoji_name = this.getEmojiName(emojis[i]);
						if (emoji_input_name.indexOf(emoji_name) !== -1) {
							_msg = _msg.replace(emojis[i], '<i class="em em-' + emojis[i].match(/[a-z_]+/g)[0] + '"></i>');
						}
					}
				}
				return _msg;
			},
			deleteMessage: function() {
				
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
								socket.emit('send_image', {
									img_url: response.data.img_url,
									people: your_nickname + '_' + uuid
								});
							}
						});
					}
				}
			},
			alertMessage: function(people, body) {
				if (checkPermission === 'granted') {
					var notify = new Notification(people, {
						body: body,
						icon: '/img/notify.png',
						eventTime: 800
					});
				}
			}
		}
	});
	
	for (var i = 0; i < emoji_len; i++) {
		App.cts.push({
			className: emoji_name[i],
			title: emoji_input_name[i]
		});
	}
	
	// online
	socket.emit('online');
	socket.on('online', function(people) {
		App.people = people;
	});
	
	// chat
	socket.on('chat', function(data) {
		var _people = data.people.split('_'),
			_msg = data.msg;
		if (App.nickname === _people[0] && uuid === _people[1]) { // is you
			_msg = App.checkMessage(_msg);
			App.yours.push({
				msg: _msg + '<dt>Me</dt>',
				name: 'Me'
			});
		} else { // not you
			// App.alertMessage(_people[0], _msg);
			_msg = App.checkMessage(_msg);
			App.others.push({
				msg: _msg + '<dt>' + _people[0] + '</dt>',
				name: _people[0]
			});
		}
		App.typeMessage = '';
		App.isEmojisShow = false;
	});
	
	// send image
	socket.on('send_image', function(data) {
		var _people = data.people.split('_'),
			_img_url = data.img_url;
		if (App.nickname === _people[0] && uuid === _people[1]) { // is you
			App.preloadImage(_img_url, function() {
				App.yours.push({
					msg: '<img src="' + _img_url + '"><dt>Me</dt>',
					name: 'Me'
				});
			});
		} else {
			// App.alertMessage(_people[0], 'Send a photo in Group Chat.');
			App.preloadImage(_img_url, function() {
				App.others.push({
					msg: '<img src="' + _img_url + '"><dt>' + _people[0] + '</dt>',
					name: _people[0]
				});
			});
		}
	});
	
}(this);