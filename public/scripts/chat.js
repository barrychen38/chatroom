$(function() {
	
	var $confirm = $('.confirm'),
		$nickname = $('.nickname'),
		$input = $('.input'),
		$inner = $('.messages .inner'),
		$o_message = $('.messages .left'),
		$message = $('.messages .right');
	
	var your_nickname = '<i>Guest</i>',
		your_message = '<li>Hello World!' + your_nickname + '</li><br>';
	
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
			var new_left_height = $o_message.height();
			sendMessage(new_left_height);
		}
		if (event.keyCode === 13 && event.ctrlKey) {
			$(this).val($input.val() + '\n');
		}
	});
	
	$('.send').on('click', function() {
		var new_left_height = $o_message.height();
		sendMessage(new_left_height);
	});
	
	function checkNN() {
		var nn = $('.nickname').val();
		if (nn === '') {
			confirm('CAN YOU ENTER YOUR NICKNAME?');
		} else {
			$('.whoiam').html(nn);
			your_nickname = '<i>' + nn + '</i>';
			$('.enter_nickname').hide();
		}
	}
	
	function sendMessage(new_height) {
		if ($input.val() === '') {
			alert('CANNOT SEND BLANK MESSAGE!');
		} else {
			your_message = '<li>' + $input.val() + your_nickname + '</li><br>';
			$message.append(your_message);
			var left_height = $o_message.height(),
				len = $message.children('li').length;
			if (new_height !== left_height || left_height === 0) {
				$message.children('li').eq(len - 1).css({
					'margin-top': left_height + 24
				});
			}
			$inner.scrollTop($message.height());
			$input.val('');
		}
	}
	
});