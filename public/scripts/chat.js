$(function() {
	
	window.onbeforeunload = function() {
		// return confirm();
	}
	
	// notification
	var permission = window.Notification.requestPermission(),
		checkPermission = window.Notification.permission;
	
	var $confirm = $('.confirm'),
		$nickname = $('.nickname'),
		$input = $('.input'),
		$inner = $('.messages .inner'),
		$l_message = $('.messages .left'),
		$r_message = $('.messages .right'),
		$people = $('.whoiam .p_count'),
		$shake = $('.emoji .shake'),
		$emoji_all = $('.emoji .all'),
		$wrapper = $('.wrapper'),
		$info = $('.info');
	
	var your_nickname = '<dt>Guest</dt>',
		your_message = '<li>Hello World!' + your_nickname + '</li><br>',
		other_message;
	
	var socket = io();
	
	var u_time;
	
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
			your_message = '<li>' + data.msg + your_nickname + '</li><br>';
			var right_height = $r_message.height();
			$r_message.append(your_message);
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
			other_message = '<li>' + data.msg + '<dt>' + people[0] + '</dt></li><br>';
			var left_height = $l_message.height();
			$l_message.append(other_message);
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
			confirm('CAN YOU ENTER YOUR NICKNAME?');
			return;
		}
		if (check && check.length === len) {
			confirm('CAN YOU ENTER YOUR NICKNAME?');
			return;
		}
		$('.whoiam .name').html(nn);
		u_time = new Date().getTime();
		your_nickname = '<dt>' + nn + '</dt>';
		$('.enter_nickname').hide();
	}
	
	function sendMessage() {
		if ($input.val() === '') {
			alert('CANNOT SEND BLANK MESSAGE!');
		} else {
			socket.emit('chat', {
				msg: $input.val(),
				people: $('.nickname').val() + '_' + u_time
			});
			$input.val('');
			return false;
		}
	}
	
	function checkMesage(msg) {
		
	}
	
});