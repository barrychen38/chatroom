$(function() {
	
	window.onbeforeunload = function() {
		return 1;
	}
	
	// notification
	if ('Notification' in window) {
		var permission = window.Notification.requestPermission(),
			checkPermission = window.Notification.permission;
	}
	
	var $confirm = $('.confirm'),
		$nickname = $('.nickname'),
		$input = $('.input'),
		$inner = $('.messages .inner'),
		$l_message = $('.messages .left'),
		$r_message = $('.messages .right'),
		$people = $('.whoiam .p_count'),
		$shake = $('.emoji .shake'),
		$emoji_all = $('.emoji .all'),
		$emoji_table = $('.emoji .table'),
		$wrapper = $('.wrapper'),
		$info = $('.info');
	
	var your_nickname,
		your_message,
		other_message;
	
	var socket = io();
	
	var u_time,
		record_input_emoji_info = 'blank';
	
	var emoji_name = ['em em-angry', 'em em-anguished', 'em em-astonished', 'em em-blush', 'em em-cold_sweat', 'em em-confounded', 'em em-confused', 'em em-cry', 'em em-disappointed', 'em em-disappointed_relieved', 'em em-dizzy_face', 'em em-expressionless', 'em em-fearful', 'em em-flushed', 'em em-frowning', 'em em-grimacing', 'em em-grin', 'em em-grinning', 'em em-heart_eyes', 'em em-hushed', 'em em-innocent', 'em em-joy', 'em em-kissing_heart', 'em em-laughing', 'em em-neutral_face', 'em em-no_mouth', 'em em-open_mouth', 'em em-pensive', 'em em-persevere', 'em em-relaxed', 'em em-satisfied', 'em em-smile', 'em em-sleepy', 'em em-smirk', 'em em-sob', 'em em-stuck_out_tongue_closed_eyes', 'em em-sunglasses', 'em em-sweat_smile', 'em em-tired_face', 'em em-yum'],
		emoji_input_name = ['Angry', 'Anguished', 'Astonished', 'Blush', 'Cold_Sweat', 'Confounded', 'Confused', 'Cry', 'Disappointed', 'Disappointed_Relieved', 'Dizzy_Face', 'Expressionless', 'Fearful', 'Flushed', 'Frowning', 'Grimacing', 'Grin', 'Grinning', 'Heart_Eyes', 'Hushed', 'Innocent', 'Joy', 'Kissing_Heart', 'Laughing', 'Neutral_Face', 'No_Mouth', 'Open_Mouth', 'Pensive', 'Persevere', 'Relaxed', 'Satisfied', 'Smile', 'Sleepy', 'Smirk', 'Sob', 'Stuck_Out_Tongue_Closed_Eyes', 'Sunglasses', 'Sweat_Smile', 'Tired_Face', 'Yum'],
		emoji_len = emoji_name.length;
	
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
		checkNN();
	});
	
	$nickname.on('keydown', function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			checkNN();
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
		return false;
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
	
	socket.on('chat', function(data) {
		var people = data.people.split('_');
		if ($('.nickname').val() === people[0] && u_time === +people[1]) { // is you
			your_message = checkMesage(data.msg, data.riei, your_nickname);
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
	});
	
	function checkNN() {
		var nn = $('.nickname').val(),
			len = nn.length,
			check = nn.match(/\s/g);
		if (!len) {
			confirm('PLEASE ENTER YOUR NICKNAME!');
			return;
		}
		if (check && check.length === len) {
			confirm('NICKNAME CANNOT BE ALL SPACES!');
			return;
		}
		$('.whoiam .name').text(nn);
		u_time = new Date().getTime();
		your_nickname = nn;
		$('.enter_nickname').hide();
	}
	
	function sendMessage() {
		if ($input.val() === '') {
			alert('CANNOT SEND BLANK MESSAGE!');
		} else {
			socket.emit('chat', {
				msg: $input.val(),
				riei: record_input_emoji_info,
				people: $('.nickname').val() + '_' + u_time
			});
			$input.val('');
			return false;
		}
	}
	
	function checkMesage(msg, riei, nn) {
		record_input_emoji_info = riei;
		console.info('record_input_emoji_info: ' + record_input_emoji_info);
		var li = $('<li></li><br>'),
			emojis = record_input_emoji_info.match(/\[[a-z|_]+\]/g),
			len = 0;
		if (emojis !== null) { // have emoji(s)
			len = emojis.length;
			if (msg.indexOf('<') !== -1 || msg.indexOf('>') !== -1) {
				msg = msg.replace(/<+/g, '&lt;');
				msg = msg.replace(/>+/g, '&gt;');
			}
			for (var i = 0; i < len; i++) { // record emoji(s)
				if (msg.indexOf(emojis[i]) !== -1) {
					msg = msg.replace(emojis[i], '<i class="em em-' + emojis[i].match(/[a-z|_]+/g)[0] + '"></i>');
				}
			}
			li.eq(0).append(msg);
		} else { // no emoji(s)
			li.eq(0).text(msg);
		}
		li.eq(0).append('<dt>' + nn + '</dt>');
		return li;
	}
	
});