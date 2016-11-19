$(function() {
	
	var $confirm = $('.confirm'),
		$nickname = $('.nickname'),
		$input = $('.input'),
		$inner = $('.messages .inner'),
		$l_message = $('.messages .left'),
		$r_message = $('.messages .right'),
		$people = $('.whoiam .p_count'),
		$shake = $('.emoji .shake'),
		$send_image = $('.emoji .file'),
		$emoji_all = $('.emoji .all'),
		$emoji_table = $('.emoji .table'),
		$wrapper = $('.wrapper'),
		$info = $('.info');
	
	var your_nickname,
		your_message,
		other_message,
		your_old_name,
		save_chat_history = [];
	
	var socket = io();
	
	var u_time,
		record_input_emoji_info = 'blank';
	
	// define emojis
	var emoji_name = ['em em-angry', 'em em-anguished', 'em em-astonished', 'em em-blush', 'em em-cold_sweat', 'em em-confounded', 'em em-confused', 'em em-cry', 'em em-disappointed', 'em em-disappointed_relieved', 'em em-dizzy_face', 'em em-expressionless', 'em em-fearful', 'em em-flushed', 'em em-frowning', 'em em-grimacing', 'em em-grin', 'em em-grinning', 'em em-heart_eyes', 'em em-hushed', 'em em-innocent', 'em em-joy', 'em em-kissing_heart', 'em em-laughing', 'em em-neutral_face', 'em em-no_mouth', 'em em-open_mouth', 'em em-scream', 'em em-pensive', 'em em-persevere', 'em em-relaxed', 'em em-satisfied', 'em em-smile', 'em em-sleepy', 'em em-smirk', 'em em-sob', 'em em-stuck_out_tongue_closed_eyes', 'em em-sunglasses', 'em em-sweat_smile', 'em em-tired_face', 'em em-yum', 'em em-mask', 'em em-boy', 'em em-alien', 'em em-clap', 'em em-facepunch', 'em em-girl', 'em em-imp', 'em em-monkey_face', 'em em-octocat', 'em em-rage', 'em em-see_no_evil', 'em em-smiling_imp', 'em em-speak_no_evil', 'em em-thumbsup', 'em em-thumbsdown', 'em em-v', 'em em-trollface', 'em em-dog', 'em em-broken_heart'],
		emoji_input_name = ['angry', 'anguished', 'astonished', 'blush', 'cold_sweat', 'confounded', 'confused', 'cry', 'disappointed', 'disappointed_relieved', 'dizzy_face', 'expressionless', 'fearful', 'flushed', 'frowning', 'grimacing', 'grin', 'grinning', 'heart_eyes', 'hushed', 'innocent', 'joy', 'kissing_heart', 'laughing', 'neutral_face', 'no_mouth', 'open_mouth', 'scream', 'pensive', 'persevere', 'relaxed', 'satisfied', 'smile', 'sleepy', 'smirk', 'sob', 'stuck_out_tongue_closed_eyes', 'sunglasses', 'sweat_smile', 'tired_face', 'yum', 'mask', 'boy', 'alien', 'clap', 'facepunch', 'girl', 'imp', 'monkey_face', 'octocat', 'rage', 'see_no_evil', 'smiling_imp', 'speak_no_evil', 'thumbsup', 'thumbsdown', 'v', 'trollface', 'dog', 'broken_heart'],
		emoji_len = emoji_name.length;
	
	window.onbeforeunload = function() {
		// return 1;
	}
	
	// check notification
	if ('Notification' in window) {
		var permission = window.Notification.requestPermission(),
			checkPermission = window.Notification.permission;
	}
	
	/**
	 * get chat history
	 * @pos: 1 => left(others), 2 => right(myself)
	 * @id: 0-9, only save 10 messages, up to bottom
	 * @msg: message
	 * @name: last time user's nickname
	 */
	// $.ajax({
	// 	url: '/get_chat_history',
	// 	type: 'GET',
	// 	dataType: 'json',
	// 	success: function(data) {
	// 		var result = data.result;
	// 		if (result === 0) {
	// 			console.error('Get chat history failed.');
	// 		}
	// 		if (result === 1) {
				
	// 		}
	// 	}
	// });
	
	for (var i = 0; i < emoji_len; i++) {
		var i_tag = $('<i></i>');
		i_tag.addClass(emoji_name[i]);
		i_tag.attr('title', emoji_input_name[i]);
		$emoji_table.append(i_tag);
	}
	
	var $emoji_choose = $emoji_table.children('i');
	
	$emoji_choose.on('click', function() {
		$input.val($input.val() + '[' + emoji_input_name[$(this).index()] + ']');
		record_input_emoji_info = $input.val();
		$input.focus();
	});
	
	$confirm.on('click', function(event) {
		event.preventDefault();
		checkNickName();
	});
	
	$nickname.on('keydown', function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			checkNickName();
		}
	});
	
	$input.on('keydown', function(event) {
		if (event.keyCode === 13 && !event.ctrlKey) {
			event.preventDefault();
			sendMessage();
		}
		if (event.keyCode === 13 && event.ctrlKey) {
			$(this).val($input.val() + '\n');
		}
	});
	
	$('.send').on('click', function() {
		sendMessage();
	});
	
	var reader = new FileReader();
	
	// send image
	$send_image.on('change', function(event) {
		var file = event.target.files[0];
		if (file.size > 1024*1024*5) {
			alert('Please upload a photo less than 5MB.');
			return;
		}
		$(this).attr('disabled');
		reader.readAsDataURL(file);
		reader.onload = function() {
			sendImage(this.result);
			$send_image.val('');
		}
	});
	
	// shake
	var showTimer;
	$shake.on('click', function() {
		socket.emit('shake', $('.whoiam .name').text());
		clearTimeout(showTimer);
		// return false;
	});
	socket.on('shake', function(shake) {
		$wrapper.addClass('animated shake');
		$info.show();
		$info.text(shake + ' SHAKED');
		showTimer = setTimeout(function() {
			$info.fadeOut(400);
		}, 900);
	});
	$wrapper.on('webkitAnimationEnd animationend', function() {
		$(this).removeClass('animated shake');
	});
	
	// emoji
	$emoji_all.on('click', function() {
		$emoji_table.toggleClass('ghost');
		return false;
	});
	
	$('body').on('click', function(event) {
		if (!$emoji_table.hasClass('ghost') && event.target !== $emoji_all[0]) {
			$emoji_table.addClass('ghost');
		}
		// return false;
	});
	
	// online
	socket.on('online', function(people) {
		$people.text(people);
	});
	socket.emit('online');
	// offline
	socket.on('offline', function(people) {
		$people.text(people);
	});
	// save chat
	// socket.on('save_chat', saveChat);
	
	socket.on('chat', function(data) {
		var people = data.people.split('_'),
			pos = null;
		if ($('.nickname').val() === people[0] && u_time === +people[1]) { // is you
			pos = 2;
			your_message = checkMesage(data.msg, data.riei, 'Me');
			var right_height = $r_message.height();
			$r_message.append(your_message);
			$emoji_table.addClass('ghost');
			var right_len = $r_message.children('li').length;
			if ($l_message.height() > right_height) {
				$r_message.children('li').eq(right_len - 1).css({
					'margin-top': $l_message.height() - right_height + 24
				});
			}
			$inner.scrollTop($r_message.height());
		} else { // not you
			if (checkPermission === 'granted') {
				var notify = new Notification(people[0], {
					body: data.msg,
					icon: '/img/notify.png'
				});
			}
			pos = 1;
			other_message = checkMesage(data.msg, data.riei, people[0]);
			var left_height = $l_message.height();
			$l_message.append(other_message);
			$emoji_table.addClass('ghost');
			var left_len = $l_message.children('li').length;
			if ($r_message.height() > left_height) {
				$l_message.children('li').eq(left_len - 1).css({
					'margin-top': $r_message.height() - left_height + 24
				});
			}
			$inner.scrollTop($l_message.height());
		}
		save_chat_history.push({
			msg: data.msg,
			pos: pos,
			name: people
		});
		if (save_chat_history.length >= 10)
			save_chat_history.length = 10;
	});
	
	socket.on('send_image', function(data) {
		var people = data.people.split('_');
		if ($('.nickname').val() === people[0] && u_time === +people[1]) { // is you
			var right_height = $r_message.height();
			preloadImage(data.img_url, function() {
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
					icon: '/img/notify.png'
				});
			}
			var left_height = $l_message.height();
			preloadImage(data.img_url, function() {
				$l_message.append('<li><img src="' + data.img_url + '"><dt>' + people[0] + '</dt></li>');
				var left_len = $l_message.children('li').length;
				if ($r_message.height() > left_height) {
					$l_message.children('li').eq(left_len - 1).css({
						'margin-top': $r_message.height() - left_height + 24
					});
				}
				$inner.scrollTop($l_message.height());
				$send_image.removeAttr('disabled');
			});
		}
	});
	
	function checkNickName() {
		var nn = $('.nickname').val(),
			len = nn.length,
			check = nn.match(/\s/g);
		if (!len) {
			alert('PLEASE ENTER YOUR NICKNAME!');
			return;
		}
		if (check && check.length === len) {
			alert('NICKNAME CANNOT BE ALL SPACES!');
			return;
		}
		$('.whoiam .name').text(nn);
		u_time = new Date().getTime();
		your_nickname = nn;
		// save now your name to recover msg
		if (!localStorage.getItem('nickname')) {
			localStorage.setItem('nickname', your_nickname + '_' + u_time);
			your_old_name = your_nickname;
		} else {
			your_old_name = localStorage.getItem('nickname');
			localStorage.setItem('nickname', your_nickname + '_' + u_time);
		}
		console.log('your_old_nickname: ' + your_old_name + '\nyour_nickname: ' + your_nickname);
		$('.enter_nickname').hide();
	}
	
	function sendMessage() {
		if ($input.val() === '') {
			alert('CANNOT SEND BLANK MESSAGE!');
		} else {
			socket.emit('chat', {
				msg: $input.val(),
				riei: record_input_emoji_info,
				people: your_nickname + '_' + u_time
			});
			$input.val('');
			return false;
		}
	}
	
	function checkMesage(msg, riei, nn) {
		record_input_emoji_info = riei;
		console.info('record_input_emoji_info: ' + record_input_emoji_info);
		var li = $('<li></li><br>'),
			emojis = record_input_emoji_info.match(/\[[a-z_]+\]/g),
			len = 0;
		if (emojis !== null) { // have emoji(s)
			len = emojis.length;
			if (msg.indexOf('<') !== -1 || msg.indexOf('>') !== -1) {
				msg = msg.replace(/<+/g, '&lt;');
				msg = msg.replace(/>+/g, '&gt;');
			}
			for (var i = 0; i < len; i++) { // record emoji(s)
				if (msg.indexOf(emojis[i]) !== -1) {
					msg = msg.replace(emojis[i], '<i class="em em-' + emojis[i].match(/[a-z_]+/g)[0] + '"></i>');
				}
			}
			li.eq(0).append(msg);
		} else { // no emoji(s)
			li.eq(0).text(msg);
		}
		li.eq(0).append('<dt>' + nn + '</dt>');
		return li;
	}
	
	function sendImage(file) {
		$.ajax({
			url: '/upload_image',
			type: 'POST',
			dataType: 'json',
			data: {
				file: file
			},
			success: function(data) {
				var result = data.readState;
				if (result === 1) {
					socket.emit('send_image', {
						img_url: data.img_url,
						people: your_nickname + '_' + u_time
					});
				}
			}
		});
	}
	
	function preloadImage(src, fn) {
		var image = new Image();
		image.src = src;
		image.onload = function() {
			fn && fn();
		}
	}
	
});