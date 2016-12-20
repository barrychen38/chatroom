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
	
	/* -------------------- Vue.js test start -------------------- */
	
	// define emojis
	var emoji_name = ['em em-angry', 'em em-anguished', 'em em-astonished', 'em em-blush', 'em em-cold_sweat', 'em em-confounded', 'em em-confused', 'em em-cry', 'em em-disappointed', 'em em-disappointed_relieved', 'em em-dizzy_face', 'em em-expressionless', 'em em-fearful', 'em em-flushed', 'em em-frowning', 'em em-grimacing', 'em em-grin', 'em em-grinning', 'em em-heart_eyes', 'em em-hushed', 'em em-innocent', 'em em-joy', 'em em-kissing_heart', 'em em-laughing', 'em em-neutral_face', 'em em-no_mouth', 'em em-open_mouth', 'em em-scream', 'em em-pensive', 'em em-persevere', 'em em-relaxed', 'em em-satisfied', 'em em-smile', 'em em-sleepy', 'em em-smirk', 'em em-sob', 'em em-stuck_out_tongue_closed_eyes', 'em em-sunglasses', 'em em-sweat_smile', 'em em-tired_face', 'em em-yum', 'em em-mask', 'em em-boy', 'em em-alien', 'em em-clap', 'em em-facepunch', 'em em-girl', 'em em-imp', 'em em-monkey_face', 'em em-octocat', 'em em-rage', 'em em-see_no_evil', 'em em-smiling_imp', 'em em-speak_no_evil', 'em em-thumbsup', 'em em-thumbsdown', 'em em-v', 'em em-trollface', 'em em-dog', 'em em-broken_heart'],
		emoji_input_name = ['angry', 'anguished', 'astonished', 'blush', 'cold_sweat', 'confounded', 'confused', 'cry', 'disappointed', 'disappointed_relieved', 'dizzy_face', 'expressionless', 'fearful', 'flushed', 'frowning', 'grimacing', 'grin', 'grinning', 'heart_eyes', 'hushed', 'innocent', 'joy', 'kissing_heart', 'laughing', 'neutral_face', 'no_mouth', 'open_mouth', 'scream', 'pensive', 'persevere', 'relaxed', 'satisfied', 'smile', 'sleepy', 'smirk', 'sob', 'stuck_out_tongue_closed_eyes', 'sunglasses', 'sweat_smile', 'tired_face', 'yum', 'mask', 'boy', 'alien', 'clap', 'facepunch', 'girl', 'imp', 'monkey_face', 'octocat', 'rage', 'see_no_evil', 'smiling_imp', 'speak_no_evil', 'thumbsup', 'thumbsdown', 'v', 'trollface', 'dog', 'broken_heart'],
		emoji_len = emoji_name.length;
	
	var showTimer,
		socket = io(),
		uuid,
		your_nickname,
		your_old_name,
		record_input_emoji_info = 'blank';
	
	var reader = new FileReader();
	
	// Vue.component('msg-list', {
	// 	template: '#msg-template',
	// 	props: ['contents']
	// });
	
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
			transformMessage: '',
			others: [],
			yours: [],
		},
		watch: {
			nickname: function() {
				this.checkNickname();
			},
			typeMessage: function() {
				this.checkMessage();
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
			shakeWindow: function() {
				var _this = this,
					_wrapper = document.querySelector('.wrapper');
				socket.emit('shake', this.nickname);
				socket.on('shake', function(people) {
					clearTimeout(showTimer);
					_this.animateObject.animated = true;
					_this.animateObject.shake = true;
					_this.isInfoShow = true;
					_this.info = people + ' SHAKED';
					showTimer = setTimeout(function() {
						_this.isInfoShow = false;
					}, 900);
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
			checkMessage: function() {
				var _msg = this.typeMessage,
					emojis = _msg.match(/\[[a-z_]+\]/g);
				if (_msg.indexOf('<') !== -1) {
					_msg = _msg.replace(/\</g, '&lt;');
				}
				if (_msg.indexOf('>') !== -1) {
					_msg = _msg.replace(/\>/g, '&gt;');
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
				this.transformMessage = _msg;
				// console.log(this.transformMessage);
			},
			sendMessage: function() {
				if (this.typeMessage === '') {
					alert('Cannot send blank message!');
					return;
				}
				socket.emit('chat', {
					msg: this.typeMessage,
					people: your_nickname + '_' + uuid
				});
				this.typeMessage = '';
			},
			preloadImage: function(fn) {
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
						alert('PLEASE SEND A IMAGE.');
						val = '';
						return;
					}
					if (_file.size > 1024*1024*5) {
						alert('Please upload a photo less than 5MB.');
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
		var people = data.people.split('_');
		if (App.nickname === people[0] && uuid === people[1]) { // is you
			// var right_height = $r_message.height();
			App.yours.push({
				msg: data.msg,
				name: App.nickname
			});
			App.isEmojisShow = false;
			// var right_len = $r_message.children('li').length;
			// if ($l_message.height() > right_height) {
			// 	$r_message.children('li').eq(right_len - 1).css({
			// 		'margin-top': $l_message.height() - right_height + 24
			// 	});
			// }
			// $inner.scrollTop($r_message.height());
		} else { // not you
		// 	if (checkPermission === 'granted') {
		// 		var notify = new Notification(people[0], {
		// 			body: data.msg,
		// 			icon: '/img/notify.png',
		// 			eventTime: 800
		// 		});
		// 	}
		// 	other_message = checkMesage(data.msg, data.riei, people[0]);
		// 	var left_height = $l_message.height();
		// 	$l_message.append(other_message);
		// 	$emoji_table.addClass('ghost');
		// 	var left_len = $l_message.children('li').length;
		// 	if ($r_message.height() > left_height) {
		// 		$l_message.children('li').eq(left_len - 1).css({
		// 			'margin-top': $r_message.height() - left_height + 24
		// 		});
		// 	}
		// 	$inner.scrollTop($l_message.height());
		}
	});
	
	// send image
	socket.on('send_image', function(data) {
		var people = data.people.split('_');
		if (App.nickname === people[0] && uuid === people[1]) { // is you
			var right_height = $r_message.height();
			App.preloadImage(data.img_url, function() {
				App.yours.push({
					
				});
				$r_message.append('<li><img src="' + data.img_url + '"><dt>Me</dt></li>');
				var right_len = $r_message.children('li').length;
				if ($l_message.height() > right_height) {
					$r_message.children('li').eq(right_len - 1).css({
						'margin-top': $l_message.height() - right_height + 24
					});
				}
				$inner.scrollTop($r_message.height());
				$send_image.removeAttr('disabled');
			});
		} else {
			if (checkPermission === 'granted') {
				var notify = new Notification(people[0], {
					body: 'Send a photo in Group Chat.',
					icon: '/img/notify.png',
					eventTime: 800
				});
			}
			var left_height = $l_message.height();
			App.preloadImage(data.img_url, function() {
				$l_message.append('<li><img src="' + data.img_url + '"><dt>' + people[0] + '</dt></li>');
				var left_len = $l_message.children('li').length;
				if ($r_message.height() > left_height) {
					$l_message.children('li').eq(left_len - 1).css({
						'margin-top': $r_message.height() - left_height + 24
					});
				}
				$inner.scrollTop($l_message.height());
			});
		}
	});
	
	/* -------------------- Vue.js test end -------------------- */
	
}(this);