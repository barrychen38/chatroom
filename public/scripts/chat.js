$(function() {
	
	window.onbeforeunload = function() {
		return confirm();
	}
	
	var $confirm = $('.confirm'),
		$nickname = $('.nickname'),
		$input = $('.input'),
		$inner = $('.messages .inner'),
		$l_message = $('.messages .left'),
		$r_message = $('.messages .right');
	
	var your_nickname = '<i>Guest</i>',
		your_message = '<li>Hello World!' + your_nickname + '</li><br>',
		other_message;
	
	var socket = io();
	
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
	
	socket.on('chat', function(data) {
		var people = data.people;
		if ($('.nickname').val() === people) { // is you
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
			other_message = '<li>' + data.msg + '<i>' + people + '</i></li><br>';
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
		var nn = $('.nickname').val();
		if (nn === '') {
			confirm('CAN YOU ENTER YOUR NICKNAME?');
		} else {
			$('.whoiam .name').html(nn);
			your_nickname = '<i>' + nn + '</i>';
			$('.enter_nickname').hide();
		}
	}
	
	function sendMessage() {
		if ($input.val() === '') {
			alert('CANNOT SEND BLANK MESSAGE!');
		} else {
			socket.emit('chat', {
				msg: $input.val(),
				people: $('.nickname').val()
			});
			$input.val('');
			return false;
		}
	}
	
});